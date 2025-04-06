import { useState } from 'react';

export function CampaignCard({ campaign, donate, account }) {
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonateModal, setShowDonateModal] = useState(false);

  const handleDonate = () => {
    donate(campaign.id, donationAmount);
    setDonationAmount('');
    setShowDonateModal(false);
  };

  return (
    <div className="campaign-card">
      <img src={campaign.img} className="campaign-image" alt="Campaign" />
      <div className="campaign-content">
        <h3 className="campaign-title">{campaign.description}</h3>
        <p className="campaign-description">Goal: {campaign.amount} ETH</p>
        
        <div className="campaign-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${Math.min(100, (campaign.amountRaised / campaign.targetAmount) * 100)}%` }}
          ></div>
        </div>
        
        <p>Raised: {campaign.amountRaised || 0} ETH</p>
        
        {account && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowDonateModal(true)}
          >
            💖 Donate Now
          </button>
        )}

        {showDonateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Support This Campaign</h3>
              <input
                type="number"
                placeholder="Amount in ETH"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="form-control"
              />
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={handleDonate}>
                  Confirm Donation
                </button>
                <button 
                  className="btn" 
                  style={{ background: '#eee' }}
                  onClick={() => setShowDonateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}