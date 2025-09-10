import { useAllCampaigns, useDonation } from '../Connections/connections';
import { useDonate } from '../Connections/connections';
import { useAccount } from 'wagmi';
import { useState, ChangeEvent } from 'react';
import { formatEther } from 'viem';

// Types for campaign and campaignData (customize as needed based on your backend/schema)
type CampaignResult = {
  description: string;
  owner: string;
  img?: string;
  targetAmount?: bigint | string | number;
  amountRaised?: bigint | string | number;
  deadline?: number | string | bigint;
  isActive?: boolean;
};

type Campaign = {
  result?: CampaignResult;
};

export function CampaignList() {
  const { data: campaigns, isLoading, refetch } = useAllCampaigns();
  const { address } = useAccount();
  const [donationAmounts, setDonationAmounts] = useState<Record<number, string>>({});
  const [activeDonation, setActiveDonation] = useState<number | null>(null);

  const { donate, isPending: isDonating } = useDonate({
    onSuccess: () => {
      refetch();
      setActiveDonation(null);
      setDonationAmounts(prev => ({ ...prev, [activeDonation as number]: '' }));
    }
  });

  const { data: userDonations } = useDonation(activeDonation ?? BigInt(0), address);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading campaigns...</p>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No campaigns yet</h3>
        <p>Be the first to create a campaign and start fundraising!</p>
      </div>
    );
  }

  const handleDonate = (campaignId: number) => {
    const amount = donationAmounts[campaignId];
    if (!amount || Number(amount) <= 0) return;
    setActiveDonation(campaignId);
    donate(campaignId, BigInt(Number(amount) * 10 ** 18));
  };

  const handleAmountChange = (campaignId: number, amount: string) => {
    setDonationAmounts(prev => ({
      ...prev,
      [campaignId]: amount
    }));
  };

  const formatAddress = (addr?: string | null): string => {
    if (!addr) return 'Unknown';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isCampaignOwner = (campaignOwner?: string | null): boolean => {
    return (address?.toLowerCase() ?? '') === (campaignOwner?.toLowerCase() ?? '');
  };

  return (
    <div className="campaign-list">
      <div className="campaigns-header">
        <h2>Active Campaigns</h2>
        <p>{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} running</p>
      </div>
      <div className="campaigns-grid">
        {campaigns.map((campaign: Campaign, index: number) => {
          const campaignData = campaign.result;
          if (!campaignData) return null;
          const campaignId = BigInt(index);
          const targetAmount = campaignData.targetAmount ? Number(campaignData.targetAmount) : 0;
          const amountRaised = campaignData.amountRaised ? Number(campaignData.amountRaised) : 0;
          const progress = targetAmount > 0 ? (amountRaised / targetAmount) * 100 : 0;

          const daysLeft = campaignData.deadline
            ? Math.ceil((Number(campaignData.deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
            : 0;
          const isExpired = daysLeft <= 0;
          const isFundingComplete = progress >= 100;
          const isOwner = isCampaignOwner(campaignData.owner);

          return (
            <div key={index} className="campaign-card">
              <div className="campaign-image">
                {campaignData.img ? (
                  <img
                    src={campaignData.img}
                    alt={campaignData.description}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const image = e.target as HTMLImageElement;
                      image.style.display = 'none';
                      if (image.nextSibling) {
                        (image.nextSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className="image-placeholder">
                  🎯
                </div>
                {isOwner && (
                  <div className="owner-badge">Your Campaign</div>
                )}
              </div>

              <div className="campaign-content">
                <h3 className="campaign-title">{campaignData.description}</h3>

                <div className="campaign-meta">
                  <div className="campaign-creator">
                    <span className="creator-label">Created by:</span>
                    <span className="creator-address">{formatAddress(campaignData.owner)}</span>
                  </div>
                  {isExpired && (
                    <div className="campaign-status expired">
                      ⏰ Campaign Ended
                    </div>
                  )}
                  {isFundingComplete && !isExpired && (
                    <div className="campaign-status completed">
                      ✅ Funding Complete!
                    </div>
                  )}
                </div>
                <div className="campaign-stats">
                  <div className="stat">
                    <span className="stat-label">Raised</span>
                    <span className="stat-value">
                      {formatEther(BigInt(amountRaised))} ETH
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Target</span>
                    <span className="stat-value">
                      {formatEther(BigInt(targetAmount))} ETH
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Days Left</span>
                    <span className="stat-value">{daysLeft > 0 ? daysLeft : 'Ended'}</span>
                  </div>
                </div>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {progress.toFixed(1)}% funded
                  </div>
                </div>
                {/* Donation Section */}
                {!isOwner && !isExpired && !isFundingComplete && (
                  <div className="donation-section">
                    <div className="donation-input-group">
                      <input
                        type="number"
                        placeholder="0.1"
                        step="0.1"
                        min="0.01"
                        value={donationAmounts[index] || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleAmountChange(index, e.target.value)
                        }
                        className="donation-input"
                        disabled={isDonating && activeDonation === index}
                      />
                      <span className="donation-suffix">ETH</span>
                    </div>

                    <button
                      onClick={() => handleDonate(index)}
                      disabled={isDonating && activeDonation === index}
                      className="donate-button"
                    >
                      {isDonating && activeDonation === index ? (
                        <>
                          <div className="spinner-small"></div>
                          Donating...
                        </>
                      ) : (
                        '💰 Donate'
                      )}
                    </button>
                  </div>
                )}
                {isOwner && (
                  <div className="owner-actions">
                    <small>This is your campaign</small>
                  </div>
                )}
                {userDonations && Number(userDonations) > 0 && (
                  <div className="user-donation">
                    <small>Your donation: {formatEther(BigInt(Number(userDonations)))} ETH</small>
                  </div>
                )}
                <div className="campaign-footer">
                  <small>ID: #{index}</small>
                  {campaignData.isActive === false && (
                    <small className="inactive-tag">Completed</small>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
