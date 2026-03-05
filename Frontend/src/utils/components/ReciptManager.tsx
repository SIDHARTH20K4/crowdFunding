import React, { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { CONTRACTS } from '../../config/contracts';

interface Receipt {
  receiptId: string;
  campaignId: number;
  amount: string;
  timestamp: string;
  txHash: string;
  claimed: boolean;
  claimedBy?: string;
}

export function ReceiptManager() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = () => {
    const saved = localStorage.getItem('myReceipts');
    if (saved) {
      setReceipts(JSON.parse(saved));
    }
  };

  const handleClaimReceipt = async (receiptId: string) => {
    if (!address) {
      alert('Please connect your wallet to claim receipt');
      return;
    }

    try {
      setClaimingId(receiptId);

      const message = `I claim receipt ${receiptId}`;
      const signature = await signMessageAsync({ message });

      const response = await fetch(`${CONTRACTS.RELAYER_URL}/claim-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId,
          walletAddress: address,
          signature,
          message
        })
      });

      const result = await response.json();

      if (result.success) {
        const savedReceipts = JSON.parse(localStorage.getItem('myReceipts') || '[]');
        const updated = savedReceipts.map((r: any) => 
          r.receiptId === receiptId ? { ...r, claimed: true, claimedBy: address } : r
        );
        localStorage.setItem('myReceipts', JSON.stringify(updated));
        loadReceipts();
        
        alert('Receipt claimed successfully!');
      } else {
        alert(`Failed to claim: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setClaimingId(null);
    }
  };

  const viewReceipt = async (receiptId: string) => {
    try {
      const response = await fetch(`${CONTRACTS.RELAYER_URL}/receipt/${receiptId}`);
      const data = await response.json();
      
      const details = `
Receipt Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Campaign: #${data.campaignId}
Amount: ${data.amount} MATIC
Status: ${data.claimed ? 'Claimed' : 'Unclaimed'}
${data.claimed ? `Claimed By: ${data.claimedBy}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transaction: ${data.transactionHash}
Block: ${data.blockNumber}
Time: ${new Date(data.timestamp).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Receipt ID: ${data.receiptId}
      `.trim();
      
      alert(details);
    } catch (error) {
      alert('Failed to load receipt details');
    }
  };

  const openExplorer = (txHash: string) => {
    window.open(`https://amoy.polygonscan.com/tx/${txHash}`, '_blank');
  };

  return (
    <div>
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#111827',
            letterSpacing: '-0.02em'
          }}>
            My Donation Receipts
          </h2>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#6b7280' 
          }}>
            View and claim your anonymous donation receipts
          </p>
        </div>
        <div style={{
          padding: '8px 16px',
          background: '#f3f4f6',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#6b7280'
        }}>
          {receipts.length} {receipts.length === 1 ? 'Receipt' : 'Receipts'}
        </div>
      </div>
      
      {receipts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 40px',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px'
          }}>
            📄
          </div>
          <h3 style={{ 
            color: '#111827', 
            marginBottom: '8px',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            No Receipts Yet
          </h3>
          <p style={{ 
            color: '#6b7280', 
            margin: 0,
            fontSize: '14px'
          }}>
            Make an anonymous donation to receive your first receipt
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {receipts.map((receipt) => (
            <div
              key={receipt.receiptId}
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s',
                ':hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '20px'
              }}>
                <div>
                  <h4 style={{ 
                    margin: '0 0 4px 0',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#111827'
                  }}>
                    Campaign #{receipt.campaignId}
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#6b7280', 
                    fontSize: '13px' 
                  }}>
                    {new Date(receipt.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div style={{
                  padding: '6px 14px',
                  background: receipt.claimed ? '#ecfdf5' : '#fef3c7',
                  color: receipt.claimed ? '#065f46' : '#92400e',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  {receipt.claimed ? 'Claimed' : 'Unclaimed'}
                </div>
              </div>

              {/* Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '20px',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    Amount
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '700',
                    color: '#111827'
                  }}>
                    {receipt.amount} MATIC
                  </div>
                </div>
                <div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    Receipt ID
                  </div>
                  <div style={{ 
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#6366f1',
                    fontWeight: '600'
                  }}>
                    {receipt.receiptId.slice(0, 24)}...
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {!receipt.claimed && (
                  <button
                    onClick={() => handleClaimReceipt(receipt.receiptId)}
                    disabled={claimingId === receipt.receiptId}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: claimingId === receipt.receiptId ? '#e5e7eb' : '#6366f1',
                      color: claimingId === receipt.receiptId ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: claimingId === receipt.receiptId ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s'
                    }}
                  >
                    {claimingId === receipt.receiptId ? 'Claiming...' : 'Claim Receipt'}
                  </button>
                )}
                <button
                  onClick={() => viewReceipt(receipt.receiptId)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'white',
                    color: '#6366f1',
                    border: '1px solid #6366f1',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }}
                >
                  View Details
                </button>
                <button
                  onClick={() => openExplorer(receipt.txHash)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'white',
                    color: '#8b5cf6',
                    border: '1px solid #8b5cf6',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }}
                >
                  View on Chain
                </button>
              </div>

              {/* Claimed Info */}
              {receipt.claimed && receipt.claimedBy && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#ecfdf5',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#065f46'
                }}>
                  <strong>Claimed by:</strong> {receipt.claimedBy.slice(0, 6)}...{receipt.claimedBy.slice(-4)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}