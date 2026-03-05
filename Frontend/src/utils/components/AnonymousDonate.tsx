import React, { useState, useEffect } from 'react';
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { generateProof } from '@semaphore-protocol/proof';
import { useAccount, useSignMessage, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS } from '../../config/contracts';

interface Props {
  campaignId: number;
  amount: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RELAYER_WALLET = '0x1a5D145b7DE3c635B4dd256854CFfA7e6C08f470' as `0x${string}`;

export function AnonymousDonate({ campaignId, amount, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState('');
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [paymentHash, setPaymentHash] = useState<`0x${string}` | null>(null);
  const [shouldGenerateProof, setShouldGenerateProof] = useState(false);

  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { sendTransaction } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isPaymentConfirmed } = useWaitForTransactionReceipt({
    hash: paymentHash || undefined,
  });

  useEffect(() => {
    if (isPaymentConfirmed && paymentHash && shouldGenerateProof) {
      setShouldGenerateProof(false);
      handleGenerateAndSubmitProof();
    }
  }, [isPaymentConfirmed, paymentHash, shouldGenerateProof]);

  const handleAnonymousDonate = async () => {
    try {
      setLoading(true);
      setCurrentStep(1);
      setStatus('Sending payment to relayer...');

      sendTransaction({
        to: RELAYER_WALLET,
        value: parseEther(amount),
      }, {
        onSuccess: (hash) => {
          setPaymentHash(hash);
          setShouldGenerateProof(true);
          setCurrentStep(2);
          setStatus('Waiting for payment confirmation...');
        },
        onError: (error) => {
          setStatus('Payment failed');
          setLoading(false);
          alert(`Payment error: ${error.message}`);
        }
      });
    } catch (error: any) {
      setStatus('Payment failed');
      setLoading(false);
    }
  };

  const handleGenerateAndSubmitProof = async () => {
    try {
      setCurrentStep(2);
      setStatus('Generating anonymous proof...');

      const identity = new Identity();
      const group = new Group([identity.commitment]);
      
      setStatus('Creating zero-knowledge proof (3-4 sec)...');
      const fullProof = await generateProof(identity, group, amount, amount);

      const merkleTreeRoot = fullProof.merkleTreeRoot;
      const nullifierHash = fullProof.nullifier;

      let proofArray: string[];
      if (Array.isArray(fullProof.points)) {
        proofArray = fullProof.points.map(p => p.toString());
      } else {
        const points = fullProof.points as any;
        proofArray = [
          points.a[0], points.a[1],
          points.b[0][1], points.b[0][0],
          points.b[1][1], points.b[1][0],
          points.c[0], points.c[1]
        ].map(p => p.toString());
      }

      setCurrentStep(3);
      setStatus('Submitting anonymous donation...');

      const response = await fetch(`${CONTRACTS.RELAYER_URL}/relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaignId.toString(),
          merkleTreeRoot: merkleTreeRoot.toString(),
          nullifierHash: nullifierHash.toString(),
          proof: proofArray,
          amount,
          paymentTxHash: paymentHash,
          payerAddress: address
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('Complete!');
        setReceiptId(result.receiptId);

        const savedReceipts = JSON.parse(localStorage.getItem('myReceipts') || '[]');
        savedReceipts.push({
          receiptId: result.receiptId,
          campaignId,
          amount,
          timestamp: new Date().toISOString(),
          txHash: result.transactionHash,
          paymentTxHash: paymentHash,
          claimed: false
        });
        localStorage.setItem('myReceipts', JSON.stringify(savedReceipts));

        window.open(result.explorerUrl, '_blank');

        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        setStatus('Donation failed');
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      setStatus('Error occurred');
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (receiptId) {
    return (
      <div style={{
        padding: '24px',
        background: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 12px',
            borderRadius: '50%',
            background: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '28px'
          }}>
            ✓
          </div>
          <h4 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '18px', fontWeight: '700' }}>
            Donation Complete!
          </h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#15803d' }}>
            Your wallet address is hidden on the blockchain
          </p>
        </div>
        
        <div style={{
          padding: '16px',
          background: 'white',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '12px'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Amount:</span>
            <strong style={{ float: 'right', color: '#111827' }}>{amount} MATIC</strong>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Campaign:</span>
            <strong style={{ float: 'right', color: '#111827' }}>#{campaignId}</strong>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb', wordBreak: 'break-all' }}>
            Receipt ID: {receiptId}
          </div>
        </div>

        <button
          onClick={() => onSuccess?.()}
          style={{
            width: '100%',
            padding: '12px',
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Steps */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              height: '4px',
              background: currentStep >= step ? '#6366f1' : '#e5e7eb',
              borderRadius: '2px',
              transition: 'all 0.3s'
            }}
          />
        ))}
      </div>

      {/* Info Box */}
      <div style={{
        padding: '16px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px', fontWeight: '600' }}>
          Private Donation Process:
        </div>
        <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
          <li>Send {amount} MATIC to relayer</li>
          <li>Generate anonymous proof</li>
          <li>Relayer submits donation</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onCancel}
          disabled={loading || isConfirming}
          style={{
            flex: 1,
            padding: '14px',
            background: 'white',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: (loading || isConfirming) ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleAnonymousDonate}
          disabled={loading || isConfirming}
          style={{
            flex: 2,
            padding: '14px',
            background: (loading || isConfirming) 
              ? '#e5e7eb' 
              : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            color: (loading || isConfirming) ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: (loading || isConfirming) ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit'
          }}
        >
          {isConfirming ? 'Confirming...' : loading ? 'Processing...' : 'Donate Privately'}
        </button>
      </div>

      {/* Status */}
      {status && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          {status}
        </div>
      )}
    </div>
  );
}