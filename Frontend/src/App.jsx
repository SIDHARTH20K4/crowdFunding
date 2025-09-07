// App.jsx
import { Connect } from './utils/components/WalletConnect';
import { useAccount } from 'wagmi';
import { CampaignList } from './utils/components/getAllList';
import { CreateCampaign } from './utils/components/createCampaign';
import { useState } from 'react';
import './index.css';

function App() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('campaigns');

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">🌐 CrowdFund</h1>
          <Connect />
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {isConnected ? (
          <>
            {/* Navigation Tabs */}
            <nav className="tabs">
              <button
                className={`tab ${activeTab === 'campaigns' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('campaigns')}
              >
                Browse Campaigns
              </button>
              <button
                className={`tab ${activeTab === 'create' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                Create Campaign
              </button>
            </nav>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'campaigns' && <CampaignList />}
              {activeTab === 'create' && <CreateCampaign />}
            </div>
          </>
        ) : (
          /* Welcome Screen for disconnected users */
          <div className="welcome-screen">
            <div className="welcome-card">
              <h2>Welcome to CrowdFund</h2>
              <p>Connect your wallet to start funding amazing projects or create your own campaign</p>
              <div className="features">
                <div className="feature">
                  <h3>🚀 Fund Projects</h3>
                  <p>Support innovative ideas and help bring them to life</p>
                </div>
                <div className="feature">
                  <h3>🛡️ Secure & Transparent</h3>
                  <p>Built on blockchain for complete transparency</p>
                </div>
                <div className="feature">
                  <h3>⚡ Instant Refunds</h3>
                  <p>Get refunded automatically if goals aren't met</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 CrowdFund. Built with ❤️ using Wagmi + React</p>
      </footer>
    </div>
  );
}

export default App;