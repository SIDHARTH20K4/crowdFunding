// hooks/readable.ts
import { useReadContract, useReadContracts } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt,UseWriteContractParameters } from 'wagmi';
import { ABI, CONTRACT_ADDRESS } from '../constants/ABI';

/**
 * Hook to fetch the total number of campaigns
 * @returns Object containing campaign count and query status
 */
export function useCampaignCount() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
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
    address: CONTRACT_ADDRESS,
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
export function useDonation(campaignId: bigint, donorAddress: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
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
    address: CONTRACT_ADDRESS as `0x${string}`,
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
  const { data: count, isLoading: countLoading } = useCampaignCount();
  
  const campaignIds = count ? 
    Array.from({ length: Number(count) }, (_, i) => BigInt(i)) : 
    [];
  
  return useMultipleCampaigns(campaignIds);
}


/**
 * Hook to create a new campaign
 * @param config - Optional configuration for the transaction
 * @returns Object containing write function and transaction status
 */
export function useCreateCampaign(config?: UseWriteContractParameters) {
  const { 
    writeContract, 
    data: hash, 
    error, 
    isPending 
  } = useWriteContract(config);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });
  
  const createCampaign = (
    targetAmount: bigint, 
    description: string, 
    img: string, 
    durationInDays: bigint
  ) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'createCampaign',
      args: [targetAmount, description, img, durationInDays],
    });
  };
  
  return { 
    createCampaign, 
    hash, 
    error, 
    isPending, 
    isConfirming, 
    isConfirmed 
  };
}

/**
 * Hook to donate to a campaign
 * @param config - Optional configuration for the transaction
 * @returns Object containing write function and transaction status
 */
export function useDonate(config?: UseWriteContractParameters) {
  const { 
    writeContract, 
    data: hash, 
    error, 
    isPending 
  } = useWriteContract(config);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });
  
  const donate = (campaignId: bigint, value: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
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
 * @param config - Optional configuration for the transaction
 * @returns Object containing write function and transaction status
 */
export function useWithdrawFunds(config?: UseWriteContractParameters) {
  const { 
    writeContract, 
    data: hash, 
    error, 
    isPending 
  } = useWriteContract(config);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });
  
  const withdrawFunds = (campaignId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
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
 * @param config - Optional configuration for the transaction
 * @returns Object containing write function and transaction status
 */
export function useGetRefund(config?: UseWriteContractParameters) {
  const { 
    writeContract, 
    data: hash, 
    error, 
    isPending 
  } = useWriteContract(config);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });
  
  const getRefund = (campaignId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
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