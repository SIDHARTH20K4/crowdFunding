import { useAllCampaigns, useDonation } from '../Connections/connections';
import { useDonate } from '../Connections/connections';
import { useAccount } from 'wagmi';
import { useState, ChangeEvent } from 'react';
import { formatEther } from 'viem';

export function CampaignList() {
  const { data: campaigns, isLoading, refetch } = useAllCampaigns();
  const { address } = useAccount();
  const [donationAmounts, setDonationAmounts] = useState<Record<number, string>>({});
  const [activeDonation, setActiveDonation] = useState<number | null>(null);

  const { donate, isPending: isDonating } = useDonate({
    onSuccess: () => {
      refetch();
      setActiveDonation(null);
      if (activeDonation !== null) {
        setDonationAmounts(prev => ({ ...prev, [activeDonation]: '' }));
      }
    }
  });

  const { data: userDonations } = useDonation(
    activeDonation !== null ? BigInt(activeDonation) : BigInt(0), 
    address ?? '0x0'
  );

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #4caf50',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <p style={{ color: '#666', margin: 0 }}>Loading campaigns...</p>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        margin: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📋</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No campaigns yet</h3>
        <p style={{ margin: 0, color: '#666' }}>
          Be the first to create a campaign and start fundraising!
        </p>
      </div>
    );
  }

  const handleDonate = (campaignId: number) => {
    const amount = donationAmounts[campaignId];
    if (!amount || Number(amount) <= 0) return;
    setActiveDonation(campaignId);
    donate(BigInt(campaignId), BigInt(Number(amount) * 10 ** 18));
  };

  const handleAmountChange = (campaignId: number, amount: string) => {
    setDonationAmounts(prev => ({
      ...prev,
      [campaignId]: amount
    }));
  };

  const formatAddress = (addr?: string): string => {
    if (!addr) return 'Unknown';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isCampaignOwner = (campaignOwner?: string): boolean => {
    if (!address || !campaignOwner) return false;
    return address.toLowerCase() === campaignOwner.toLowerCase();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <h2 style={{ 
          margin: '0 0 8px 0',
          color: '#333',
          fontSize: '2rem'
        }}>
          Active Campaigns
        </h2>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
          {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} running
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {campaigns.map((campaign, index: number) => {
          // Handle both success and failure cases
          if (!campaign.result) return null;

          const campaignData = campaign.result;
          
          // campaignData is a tuple: [id, targetAmount, amountRaised, description, image, owner, isActive, deadline]
          const targetAmount = campaignData[1];
          const amountRaised = campaignData[2];
          const description = campaignData[3];
          const image = campaignData[4];
          const owner = campaignData[5];
          const isActive = campaignData[6];
          const deadline = campaignData[7];

          const progress = targetAmount > 0 
            ? (Number(amountRaised) / Number(targetAmount)) * 100 
            : 0;

          const daysLeft = deadline
            ? Math.ceil((Number(deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
            : 0;
          const isExpired = daysLeft <= 0;
          const isFundingComplete = progress >= 100;
          const isOwner = isCampaignOwner(owner);

          return (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Campaign Image */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '200px',
                backgroundColor: '#f0f0f0',
                overflow: 'hidden'
              }}>
                {image && (
                  <img
                    src={image}
                    alt={description}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: image ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem'
                }}>
                  🎯
                </div>
                {isOwner && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Your Campaign
                  </div>
                )}
              </div>

              {/* Campaign Content */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ 
                  margin: '0 0 16px 0',
                  fontSize: '1.25rem',
                  color: '#333',
                  lineHeight: '1.4'
                }}>
                  {description}
                </h3>

                {/* Creator Info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#999', marginRight: '6px' }}>
                      Created by:
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#666', fontFamily: 'monospace' }}>
                      {formatAddress(owner)}
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                {isExpired && (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    ⏰ Campaign Ended
                  </div>
                )}
                {isFundingComplete && !isExpired && (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    ✅ Funding Complete!
                  </div>
                )}

                {/* Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '4px' }}>
                      Raised
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333' }}>
                      {formatEther(amountRaised)} ETH
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '4px' }}>
                      Target
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333' }}>
                      {formatEther(targetAmount)} ETH
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '4px' }}>
                      Days Left
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333' }}>
                      {daysLeft > 0 ? daysLeft : 'Ended'}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    height: '8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '6px'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: '#4caf50',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{
                    textAlign: 'right',
                    fontSize: '0.8rem',
                    color: '#666'
                  }}>
                    {progress.toFixed(1)}% funded
                  </div>
                </div>

                {/* Donation Section */}
                {!isOwner && !isExpired && !isFundingComplete && isActive && (
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="number"
                          placeholder="0.1"
                          step="0.01"
                          min="0.01"
                          value={donationAmounts[index] || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleAmountChange(index, e.target.value)
                          }
                          disabled={isDonating && activeDonation === index}
                          style={{
                            width: '100%',
                            padding: '10px 45px 10px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#999',
                          fontSize: '0.9rem',
                          pointerEvents: 'none'
                        }}>
                          ETH
                        </span>
                      </div>
                      <button
                        onClick={() => handleDonate(index)}
                        disabled={isDonating && activeDonation === index}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: isDonating && activeDonation === index ? '#ccc' : '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: isDonating && activeDonation === index ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isDonating && activeDonation === index ? (
                          <>
                            <div style={{
                              width: '14px',
                              height: '14px',
                              border: '2px solid #fff',
                              borderTop: '2px solid transparent',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }} />
                            Donating...
                          </>
                        ) : (
                          '💰 Donate'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {isOwner && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    textAlign: 'center',
                    marginTop: 'auto'
                  }}>
                    <small style={{ color: '#666' }}>This is your campaign</small>
                  </div>
                )}

                {userDonations && Number(userDonations) > 0 && (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '6px',
                    marginTop: '8px'
                  }}>
                    <small style={{ color: '#1976d2' }}>
                      Your donation: {formatEther(userDonations)} ETH
                    </small>
                  </div>
                )}

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <small style={{ color: '#999', fontSize: '0.75rem' }}>ID: #{index}</small>
                  {!isActive && (
                    <small style={{
                      padding: '2px 8px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      color: '#757575',
                      fontSize: '0.75rem'
                    }}>
                      Completed
                    </small>
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