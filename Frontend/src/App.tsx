import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { CampaignList } from './utils/components/getAllList';
import CreateCampaign from './utils/components/createCampaign';
import { ReceiptManager } from './utils/components/ReciptManager';
import { Connect } from './utils/components/WalletConnect';

function App() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'receipts'>('browse');

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f7fa',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        padding: '24px 32px',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '28px',
              color: '#111827',
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              PrivateFund
            </h1>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '14px', 
              color: '#6b7280',
              fontWeight: '400'
            }}>
              Privacy-Enhanced Crowdfunding Platform
            </p>
          </div>
          <Connect />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1,
        width: '100%',
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px 32px'
      }}>
        {isConnected ? (
          <>
            {/* Navigation Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '32px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <button
                onClick={() => setActiveTab('browse')}
                style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  color: activeTab === 'browse' ? '#6366f1' : '#6b7280',
                  border: 'none',
                  borderBottom: activeTab === 'browse' ? '2px solid #6366f1' : '2px solid transparent',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
              >
                Browse Campaigns
              </button>
              <button
                onClick={() => setActiveTab('create')}
                style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  color: activeTab === 'create' ? '#6366f1' : '#6b7280',
                  border: 'none',
                  borderBottom: activeTab === 'create' ? '2px solid #6366f1' : '2px solid transparent',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
              >
                Create Campaign
              </button>
              <button
                onClick={() => setActiveTab('receipts')}
                style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  color: activeTab === 'receipts' ? '#6366f1' : '#6b7280',
                  border: 'none',
                  borderBottom: activeTab === 'receipts' ? '2px solid #6366f1' : '2px solid transparent',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
              >
                My Receipts
              </button>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'browse' && <CampaignList />}
              {activeTab === 'create' && <CreateCampaign />}
              {activeTab === 'receipts' && <ReceiptManager />}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            paddingTop: '40px'
          }}>
            {/* Hero Section */}
            <div style={{
              marginBottom: '60px'
            }}>
              <h2 style={{ 
                color: '#111827', 
                marginBottom: '20px',
                fontSize: '48px',
                fontWeight: '800',
                letterSpacing: '-0.03em',
                lineHeight: '1.1'
              }}>
                Donate Anonymously,<br />
                <span style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Make an Impact
                </span>
              </h2>
              <p style={{ 
                color: '#6b7280', 
                marginBottom: '40px',
                fontSize: '20px',
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto 40px auto'
              }}>
                Support causes you care about while keeping your identity private using zero-knowledge proof technology.
              </p>
              
              <Connect />
            </div>

            {/* Feature Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
              maxWidth: '900px',
              margin: '0 auto 60px auto'
            }}>
              <div style={{
                padding: '32px 24px',
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                textAlign: 'left'
              }}>
                <div style={{ 
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#6366f1'
                }}>
                  ZK
                </div>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#111827', 
                  fontSize: '18px', 
                  fontWeight: '700' 
                }}>
                  Zero-Knowledge Proofs
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '15px', 
                  color: '#6b7280', 
                  lineHeight: '1.6' 
                }}>
                  Cryptographically prove you donated without revealing your wallet address. Powered by Semaphore Protocol.
                </p>
              </div>
              
              <div style={{
                padding: '32px 24px',
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                textAlign: 'left'
              }}>
                <div style={{ 
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  fontSize: '24px'
                }}>
                  ⚡
                </div>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#111827', 
                  fontSize: '18px', 
                  fontWeight: '700' 
                }}>
                  Fast & Secure
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '15px', 
                  color: '#6b7280', 
                  lineHeight: '1.6' 
                }}>
                  Built on Polygon Amoy testnet for instant transactions with minimal gas fees. Your funds are secured by smart contracts.
                </p>
              </div>
              
              <div style={{
                padding: '32px 24px',
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                textAlign: 'left'
              }}>
                <div style={{ 
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#ef4444'
                }}>
                  R
                </div>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#111827', 
                  fontSize: '18px', 
                  fontWeight: '700' 
                }}>
                  Optional Receipts
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '15px', 
                  color: '#6b7280', 
                  lineHeight: '1.6' 
                }}>
                  Get verifiable proof of your donation when you need it. Perfect for tax deductions or matching programs.
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '48px',
              border: '1px solid #e5e7eb',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              <h3 style={{
                margin: '0 0 40px 0',
                fontSize: '28px',
                fontWeight: '700',
                color: '#111827',
                letterSpacing: '-0.02em'
              }}>
                How It Works
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '32px',
                textAlign: 'left'
              }}>
                <div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '18px',
                    marginBottom: '16px'
                  }}>
                    1
                  </div>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#111827' 
                  }}>
                    Choose a Campaign
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    lineHeight: '1.5' 
                  }}>
                    Browse active campaigns and select one you'd like to support
                  </p>
                </div>

                <div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '18px',
                    marginBottom: '16px'
                  }}>
                    2
                  </div>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#111827' 
                  }}>
                    Donate Privately
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    lineHeight: '1.5' 
                  }}>
                    Click "Private" to generate a zero-knowledge proof that hides your identity
                  </p>
                </div>

                <div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '18px',
                    marginBottom: '16px'
                  }}>
                    3
                  </div>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#111827' 
                  }}>
                    Get Your Receipt
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    lineHeight: '1.5' 
                  }}>
                    Receive a verifiable receipt that you can optionally claim when needed
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '32px',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#111827', fontWeight: '600' }}>
          Privacy-Enhanced Crowdfunding Platform
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
          Built with Semaphore Protocol • Polygon Amoy • Final Year College Project
        </p>
      </footer>
    </div>
  );
}

export default App;