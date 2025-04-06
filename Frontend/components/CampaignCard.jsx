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
    <div className="campaign-card card mb-3">
      <img src={campaign.img} className="card-img-top" alt="Campaign" />
      <div className="card-body">
        <h5 className="card-title">{campaign.description}</h5>
        <p className="card-text">Goal: {campaign.amount}</p>
        <p className="card-text">Owner: {campaign.owner}</p>
        
        {account && (
          <button 
            className="btn btn-success"
            onClick={() => setShowDonateModal(true)}
          >
            Donate
          </button>
        )}

        {showDonateModal && (
          <div className="donate-modal">
            <div className="modal-content">
              <h5>Donate to Campaign</h5>
              <input
                type="number"
                placeholder="Amount in ETH"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="form-control mb-2"
              />
              <div className="d-flex gap-2">
                <button className="btn btn-primary" onClick={handleDonate}>
                  Confirm Donation
                </button>
                <button 
                  className="btn btn-secondary" 
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