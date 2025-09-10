import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { UseWriteContractParameters } from 'wagmi';
import { ABI, CONTRACT_ADDRESS } from './constants';
import { useEffect } from 'react';
import { Address } from 'viem';

// Cast the address to the correct type
const contractAddress = CONTRACT_ADDRESS as Address;

/**
 * Hook to fetch the total number of campaigns
 * @returns Object containing campaign count and query status
 */
export function useCampaignCount() {
  return useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'getCampaignCount',
  });
}

/**
 * Hook to fetch details of a specific campaign
 * @param campaignId - ID of the campaign to fetch
 * @returns Object containing campaign details and query status
 */
export function useCampaign(campaignId: bigint) {
  return useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'campaigns',
    args: [campaignId],
  });
}

/**
 * Hook to fetch donation amount from a specific donor to a campaign
 * @param campaignId - ID of the campaign
 * @param donorAddress - Address of the donor
 * @returns Object containing donation amount and query status
 */
export function useDonation(campaignId: bigint, donorAddress: Address) {
  return useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'donations',
    args: [campaignId, donorAddress],
  });
}

/**
 * Hook to fetch multiple campaigns at once
 * @param campaignIds - Array of campaign IDs to fetch
 * @returns Object containing array of campaign details and query status
 */
export function useMultipleCampaigns(campaignIds: bigint[]) {
  const contracts = campaignIds.map((id) => ({
    address: contractAddress,
    abi: ABI,
    functionName: 'campaigns' as const,
    args: [id] as const,
  }));

  return useReadContracts({ contracts });
}

/**
 * Hook to fetch all campaigns (use with caution for large numbers of campaigns)
 * @returns Object containing all campaigns and query status
 */
export function useAllCampaigns() {
  const { data: count, isLoading: countLoading, refetch: refetchCount } = useCampaignCount();
  
  const campaignIds = count ? 
    Array.from({ length: Number(count) }, (_, i) => BigInt(i)) : 
    [];
  
  const { data: campaigns, isLoading, refetch } = useMultipleCampaigns(campaignIds);
  
  return { 
    data: campaigns, 
    isLoading: countLoading || isLoading, 
    refetch: async () => {
      await refetchCount();
      await refetch();
    }
  };
}

/**
 * Hook to donate to a campaign with success callback
 * @param config - Optional configuration including success callback
 * @returns Object containing write function and transaction status
 */
export function useDonate(config?: UseWriteContractParameters & { onSuccess?: () => void }) {
  const { 
    writeContract, 
    data: hash, 
    error, 
    isPending 
  } = useWriteContract(config);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });
  
  // Handle success callback using useEffect
  useEffect(() => {
    if (isConfirmed && config?.onSuccess) {
      config.onSuccess();
    }
  }, [isConfirmed, config?.onSuccess]);
  
  const donate = (campaignId: bigint, value: bigint) => {
    writeContract({
      address: contractAddress,
      abi: ABI,
      functionName: 'donate',
      args: [campaignId],
      value,
    });
  };
  
  return { 
    donate, 
    hash, 
    error, 
    isPending, 
    isConfirming, 
    isConfirmed 
  };
}

/**
 * Hook to withdraw funds from a campaign (owner only)
 * @param config - Optional configuration including success callback
 * @returns Object containing write function and transaction status
 */
export function useWithdrawFunds(config?: UseWriteContractParameters & { onSuccess?: () => void }) {
  const { 
    writeContract, 
    data: hash, 
    error, 
    isPending 
  } = useWriteContract(config);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });
  
  useEffect(() => {
    if (isConfirmed && config?.onSuccess) {
      config.onSuccess();
    }
  }, [isConfirmed, config?.onSuccess]);
  
  const withdrawFunds = (campaignId: bigint) => {
    writeContract({
      address: contractAddress,
      abi: ABI,
      functionName: 'withdrawFunds',
      args: [campaignId],
    });
  };
  
  return { 
    withdrawFunds, 
    hash, 
    error, 
    isPending, 
    isConfirming, 
    isConfirmed 
  };
}

/**
 * Hook to get a refund from a campaign
 * @param config - Optional configuration including success callback
 * @returns Object containing write function and transaction status
 */
export function useGetRefund(config?: UseWriteContractParameters & { onSuccess?: () => void }) {
  const { 
    writeContract, 
    data: hash, 
    error, 
    isPending 
  } = useWriteContract(config);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });
  
  useEffect(() => {
    if (isConfirmed && config?.onSuccess) {
      config.onSuccess();
    }
  }, [isConfirmed, config?.onSuccess]);
  
  const getRefund = (campaignId: bigint) => {
    writeContract({
      address: contractAddress,
      abi: ABI,
      functionName: 'getRefund',
      args: [campaignId],
    });
  };
  
  return { 
    getRefund, 
    hash, 
    error, 
    isPending, 
    isConfirming, 
    isConfirmed 
  };
}

export function useCreateCampaign(config?: UseWriteContractParameters & { onSuccess?: () => void }) {
  const { 
    writeContract, 
    data: hash, 
    error, 
    isPending 
  } = useWriteContract(config);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });
  
  useEffect(() => {
    if (isConfirmed && config?.onSuccess) {
      config.onSuccess();
    }
  }, [isConfirmed, config?.onSuccess]);
  
  const CreateCampaign = (targetAmount: bigint, description: string, image: string, durationInDays: bigint) => {
    writeContract({
      address: contractAddress,
      abi: ABI,
      functionName: 'createCampaign',
      args: [targetAmount, description, image, durationInDays],
    });
  };
  
  return { 
    CreateCampaign, 
    hash, 
    error, 
    isPending, 
    isConfirming, 
    isConfirmed 
  };
}