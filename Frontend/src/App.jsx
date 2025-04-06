import { useCrowdfunding } from "./Hooks/useCrowdfunding";
import { ConnectWallet } from "../components/ConnectWallet";
import { CreateCampaign } from "../components/CreateCampaign";
import { CampaignCard } from "../components/CampaignCard";
import './index.css';

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
    <div className="App">
      <header className="header">
        <div className="logo">
          <span>🌱</span>
          <span>FundForward</span>
        </div>
        <ConnectWallet connectWallet={connectWallet} account={account} />
      </header>

      <main className="container">
        {account && (
          <CreateCampaign 
            createCampaign={createCampaign} 
            loading={loading} 
          />
        )}

        <h2 style={{ margin: '2rem 0 1rem', color: 'var(--primary)' }}>
          {account ? 'Active Campaigns' : 'Connect Wallet to View Campaigns'}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner"></div>
            <p>Loading campaigns...</p>
          </div>
        ) : campaigns.length > 0 ? (
          <div className="campaigns-grid">
            {campaigns.map((campaign, index) => (
              <CampaignCard
                key={index}
                campaign={campaign}
                donate={donate}
                account={account}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No campaigns found. Create one to get started!</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;