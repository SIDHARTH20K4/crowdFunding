import { useState } from 'react';
import { useDonate } from '../Connections/connections';
import { formatEther, parseEther } from 'viem';

interface CampaignCardProps {
  campaignData: any[];
  index: number;
  onDonationComplete: () => void;
}

export default function CampaignCard({ campaignData, index, onDonationComplete }: CampaignCardProps) {
  const [donationAmount, setDonationAmount] = useState('');
  const { donate, isPending, isConfirming, error } = useDonate({
    onSuccess: () => {
      setDonationAmount('');
      onDonationComplete();
    }
  });
  
  const handleDonate = () => {
    if (!donationAmount || Number(donationAmount) <= 0) return;
    
    try {
      const value = parseEther(donationAmount);
      donate(BigInt(index), value);
    } catch (err) {
      console.error('Donation error:', err);
    }
  };

  const targetAmount = BigInt(campaignData[1] || 0);
  const raisedAmount = BigInt(campaignData[2] || 0);
  const description = String(campaignData[3] || 'Unnamed Campaign');
  const isActive = Boolean(campaignData[5]);
  
  const progress = targetAmount > 0 
    ? Math.min((Number(raisedAmount) * 100) / Number(targetAmount), 100)
    : 0;

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      transition: 'box-shadow 0.2s',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '1.25rem',
          color: '#333',
          flex: 1
        }}>
          {description}
        </h3>
        <span style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600',
          backgroundColor: isActive ? '#e8f5e9' : '#f5f5f5',
          color: isActive ? '#2e7d32' : '#757575'
        }}>
          {isActive ? 'Active' : 'Ended'}
        </span>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '12px',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <span>Raised: {formatEther(raisedAmount)} ETH</span>
        <span>Goal: {formatEther(targetAmount)} ETH</span>
      </div>

      <div style={{
        height: '8px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#4caf50',
          transition: 'width 0.3s ease'
        }} />
      </div>

      <div style={{
        textAlign: 'right',
        fontSize: '0.85rem',
        color: '#666',
        marginBottom: '20px'
      }}>
        {progress.toFixed(1)}% funded
      </div>

      {isActive && (
        <div>
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <input
              type="number"
              placeholder="Amount in ETH"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              step="0.01"
              min="0"
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button 
              onClick={handleDonate}
              disabled={isPending || isConfirming || !donationAmount || Number(donationAmount) <= 0}
              style={{
                padding: '12px 24px',
                backgroundColor: isPending || isConfirming ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isPending || isConfirming || !donationAmount || Number(donationAmount) <= 0 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {isPending || isConfirming ? 'Processing...' : 'Donate'}
            </button>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#ffebee',
              borderRadius: '8px',
              color: '#c62828',
              fontSize: '0.9rem'
            }}>
              {error.message}
            </div>
          )}
        </div>
      )}

      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #f0f0f0',
        fontSize: '0.8rem',
        color: '#999'
      }}>
        Campaign ID: #{index}
      </div>
    </div>
  );
}