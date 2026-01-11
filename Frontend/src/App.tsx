import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import {CampaignList} from './utils/components/getAllList';
import CreateCampaign from './utils/components/createCampaign';
import { Connect } from './utils/components/WalletConnect';

function App() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        padding: '16px 24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
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
      <main style={{ 
        flex: 1,
        width: '100%',
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '24px'
      }}>
        {isConnected ? (
          <>
            {/* Navigation Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '24px',
              borderBottom: '2px solid #e0e0e0'
            }}>
              <button
                onClick={() => setActiveTab('browse')}
                style={{
                  padding: '12px 24px',
                  background: activeTab === 'browse' ? '#4caf50' : 'transparent',
                  color: activeTab === 'browse' ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
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
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Create Campaign
              </button>
            </div>

            {/* Tab Content */}
            <div>
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
            marginTop: '40px'
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
        padding: '24px',
        background: '#333',
        color: 'white',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0 }}>© 2024 CrowdFund DApp. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;