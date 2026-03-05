import React, { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACTS, CROWDFUNDING_ABI } from '../../config/contracts';
import { CampaignCard } from './CampaignCard';

interface Campaign {
  id: bigint;
  targetAmount: bigint;
  amountRaised: bigint;
  description: string;
  img: string;
  owner: string;
  isActive: boolean;
  deadline: bigint;
}

export function CampaignList() {
  // Use getAllCampaigns - much simpler!
  const { data: campaignsData, isLoading, refetch } = useReadContract({
    address: CONTRACTS.CROWDFUNDING_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: 'getAllCampaigns',
  });

  const campaigns = (campaignsData as any[] || []).map((c: any) => ({
    id: c.id,
    targetAmount: c.targetAmount,
    amountRaised: c.amountRaised,
    description: c.description,
    img: c.img || 'https://via.placeholder.com/300',
    owner: c.owner,
    isActive: c.isActive,
    deadline: c.deadline
  }));

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2>All Campaigns ({campaigns.length})</h2>
        <button
          onClick={() => refetch()}
          style={{
            padding: '10px 20px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🔄 Refresh
        </button>
      </div>
      
      {campaigns.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>No Campaigns Yet</h3>
          <p style={{ color: '#999' }}>Create the first campaign to get started!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {campaigns.map((campaign) => (
            <CampaignCard 
              key={campaign.id.toString()} 
              campaign={campaign}
              onDonationSuccess={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  );
}