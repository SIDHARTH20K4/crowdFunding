// Updated CampaignList.tsx
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAllCampaigns } from '../Connections/connections';
import CampaignCard from './campaignCard';

export default function CampaignList() {
  const { isConnected } = useAccount();
  const { data: campaignsData, isLoading, refetch } = useAllCampaigns();
  
  if (!isConnected) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Campaigns</h2>
        <p>Please connect your wallet to view campaigns</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Campaigns</h2>
        <p>Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>All Campaigns</h2>

      {campaignsData && Array.isArray(campaignsData) ? (
        <div>
          {campaignsData.map((campaignResponse, index) => {
            if (!campaignResponse.result || !Array.isArray(campaignResponse.result)) {
              return null;
            }
            
            return (
              <CampaignCard 
                key={index}
                campaignData={campaignResponse.result}
                index={index}
                onDonationComplete={refetch}
              />
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p>No campaigns found</p>
        </div>
      )}
    </div>
  );
}