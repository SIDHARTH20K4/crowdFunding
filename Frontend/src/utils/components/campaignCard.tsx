import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACTS, CROWDFUNDING_ABI } from '../../config/contracts';
import { AnonymousDonate } from './AnonymousDonate';

interface Campaign {
  id: bigint;
  targetAmount: bigint;
  amountRaised: bigint;
  description: string;
  img: string;
  owner: string;
  isActive: boolean;
  deadline: bigint;
}

interface Props {
  campaign: Campaign;
  onDonationSuccess?: () => void;
}

export function CampaignCard({ campaign, onDonationSuccess }: Props) {
  const [donateAmount, setDonateAmount] = useState('');
  const [showAnonymous, setShowAnonymous] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleNormalDonate = async () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'donate',
        args: [campaign.id],
        value: parseEther(donateAmount),
        maxFeePerGas: 30_000_000_000n,
        maxPriorityFeePerGas: 30_000_000_000n,
      });
    } catch (error: any) {
      console.error('Donation error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  React.useEffect(() => {
    if (isSuccess) {
      alert('Donation successful!');
      setDonateAmount('');
      onDonationSuccess?.();
    }
  }, [isSuccess]);

  const progress = Number(campaign.amountRaised) / Number(campaign.targetAmount) * 100;
  const daysLeft = Math.max(0, Math.floor((Number(campaign.deadline) - Date.now() / 1000) / (24 * 60 * 60)));

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      ':hover': {
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }
    }}>
      {/* Campaign Image */}
      <div style={{
        width: '100%',
        height: '200px',
        background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {campaign.img && campaign.img !== 'https://via.placeholder.com/300' ? (
          <img 
            src={campaign.img} 
            alt={campaign.description}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            fontSize: '48px',
            color: 'white',
            fontWeight: '700'
          }}>
            {campaign.description.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Status Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '6px 12px',
          background: campaign.isActive ? '#22c55e' : '#ef4444',
          color: 'white',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {campaign.isActive ? 'Active' : 'Ended'}
        </div>
      </div>

      {/* Campaign Info */}
      <div style={{ padding: '24px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: '#111827',
          fontSize: '20px',
          fontWeight: '700',
          letterSpacing: '-0.02em',
          lineHeight: '1.3'
        }}>
          {campaign.description}
        </h3>

        {/* Progress Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            <span style={{ color: '#6b7280', fontWeight: '500' }}>
              {formatEther(campaign.amountRaised)} MATIC
            </span>
            <span style={{ color: '#111827', fontWeight: '600' }}>
              {formatEther(campaign.targetAmount)} MATIC
            </span>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '100px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(progress, 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              transition: 'width 0.5s ease',
              borderRadius: '100px'
            }} />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: '13px'
          }}>
            <span style={{ color: '#6366f1', fontWeight: '600' }}>
              {progress.toFixed(1)}% funded
            </span>
            <span style={{ color: '#6b7280' }}>
              {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
            </span>
          </div>
        </div>

        {/* Donation Section */}
        {!showAnonymous ? (
          <div>
            <input
              type="number"
              step="0.001"
              placeholder="Amount in MATIC"
              value={donateAmount}
              onChange={(e) => setDonateAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                marginBottom: '12px',
                fontSize: '15px',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleNormalDonate}
                disabled={isPending || isConfirming || !donateAmount}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: (isPending || isConfirming || !donateAmount) 
                    ? '#e5e7eb' 
                    : '#6366f1',
                  color: (isPending || isConfirming || !donateAmount) ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: (isPending || isConfirming || !donateAmount) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
              >
                {isPending ? 'Approving...' : isConfirming ? 'Confirming...' : 'Donate'}
              </button>

              <button
                onClick={() => setShowAnonymous(true)}
                disabled={!donateAmount}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: !donateAmount ? '#e5e7eb' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  color: !donateAmount ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: !donateAmount ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
              >
                Private
              </button>
            </div>
          </div>
        ) : (
          <AnonymousDonate 
            campaignId={Number(campaign.id)} 
            amount={donateAmount}
            onSuccess={() => {
              setShowAnonymous(false);
              setDonateAmount('');
              onDonationSuccess?.();
            }}
            onCancel={() => setShowAnonymous(false)}
          />
        )}

        {/* Campaign Owner */}
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '13px',
          color: '#6b7280',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: '700'
          }}>
            {campaign.owner.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
              Campaign Owner
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#111827' }}>
              {campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}