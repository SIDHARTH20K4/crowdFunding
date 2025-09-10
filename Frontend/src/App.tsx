import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import CampaignList from './utils/components/donateCampaign';
import CreateCampaign from './utils/components/createCampaign';
import { Connect } from './utils/components/WalletConnect';

function App() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                  justifyContent: 'space-between'
     }}>
      {/* Header */}
      <header style={{
        background: 'white',
        padding: '16px 24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        // marginBottom: '24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, color: '#4caf50' }}>CrowdFund DApp</h1>
          
          <Connect />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
                      display: 'flex',
                      flex: '1 0 0',
                      flexDirection: 'column',
                      justifyContent: 'flex-start'
       }}>
        {isConnected ? (
          <>
            {/* Navigation Tabs */}
            <div style={{
              display: 'flex',
              marginBottom: '24px',
              borderBottom: '1px solid #e0e0e0',
              flexDirection: 'column',
              flex: '1 0 0',
              justifyContent: 'flex-start'
            }}>
              <div>
                <button
                  onClick={() => setActiveTab('browse')}
                  style={{
                    padding: '12px 24px',
                    background: activeTab === 'browse' ? '#4caf50' : 'transparent',
                    color: activeTab === 'browse' ? 'white' : '#666',
                    border: 'none',
                    borderBottom: activeTab === 'browse' ? '2px solid #4caf50' : 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Browse Campaigns
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  style={{
                    padding: '12px 24px',
                    background: activeTab === 'create' ? '#4caf50' : 'transparent',
                    color: activeTab === 'create' ? 'white' : '#666',
                    border: 'none',
                    borderBottom: activeTab === 'create' ? '2px solid #4caf50' : 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Create Campaign
                </button>
              </div>

            {/* Tab Content */}
            {activeTab === 'browse' ? (
              <CampaignList />
            ) : (
              <CreateCampaign />
            )}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{ color: '#666', marginBottom: '16px' }}>
              Welcome to CrowdFund DApp
            </h2>
            <p style={{ color: '#888', marginBottom: '32px' }}>
              Connect your wallet to browse campaigns or create your own
            </p>
            <Connect />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        // marginTop: '60px',
        padding: '24px',
        background: '#333',
        color: 'white',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0 }}>© 2023 CrowdFund DApp. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;