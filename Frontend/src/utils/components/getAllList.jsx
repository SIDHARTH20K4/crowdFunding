// components/CampaignList.jsx
import { useAllCampaigns } from '../Connections/connections';

export function CampaignList() {
  const { data: campaigns, isLoading } = useAllCampaigns();

  if (isLoading) {
    return <div className="loading">Loading campaigns...</div>;
  }

  return (
    <div className="campaign-list">
      <h2>Active Campaigns</h2>
      <div className="campaigns-grid">
        {campaigns?.map((campaign, index) => (
          <div key={index} className="campaign-card">
            <h3>{campaign.result?.description}</h3>
            <p>Target: {campaign.result?.targetAmount?.toString()} ETH</p>
            <p>Raised: {campaign.result?.amountRaised?.toString()} ETH</p>
          </div>
        ))}
      </div>
    </div>
  );
}