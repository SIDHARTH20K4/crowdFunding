// CampaignCard.tsx
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
  const { donate, isPending, isConfirming, isConfirmed, error } = useDonate({
    onSuccess: () => {
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

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: 'white'
    }}>
      <h3>{String(campaignData[3] || 'Unnamed Campaign')}</h3>
      <p>Raised: {formatEther(BigInt(campaignData[2] || 0))} ETH / {formatEther(BigInt(campaignData[1] || 0))} ETH</p>
      <p>Status: {campaignData[5] ? 'Active' : 'Ended'}</p>
      
      {campaignData[5] && (
        <div>
          <input
            type="number"
            placeholder="ETH amount"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            style={{ marginRight: '8px', padding: '8px' }}
          />
          <button 
            onClick={handleDonate}
            disabled={isPending || isConfirming || !donationAmount || Number(donationAmount) <= 0}
          >
            {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Donate'}
          </button>
        </div>
      )}
    </div>
  );
}