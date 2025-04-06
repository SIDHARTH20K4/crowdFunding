import { useCrowdfunding } from './Hooks/useCrowdFunding';
import { ConnectWallet } from '../components/ConnectWallet';
import { CreateCampaign } from '../components/CreateCampaign';
import { CampaignCard } from '../components/CampaignCard';
import './App.css';

function App() {
  const {
    account,
    campaigns,
    loading,
    connectWallet,
    createCampaign,
    donate
  } = useCrowdfunding();

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Simple Crowdfunding</h1>
      
      <div className="d-flex justify-content-end mb-4">
        <ConnectWallet connectWallet={connectWallet} account={account} />
      </div>

      {account && (
        <CreateCampaign createCampaign={createCampaign} loading={loading} />
      )}

      <h2 className="mb-3">Active Campaigns</h2>
      {loading ? (
        <div className="text-center">Loading campaigns...</div>
      ) : campaigns.length > 0 ? (
        <div className="row">
          {campaigns.map((campaign, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <CampaignCard 
                campaign={campaign} 
                donate={donate}
                account={account}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">No campaigns found</div>
      )}
    </div>
  );
}

export default App;