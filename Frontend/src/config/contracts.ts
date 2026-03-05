export const CONTRACTS = {
  CROWDFUNDING_ADDRESS: '0x4374C7EdB01ABbedafCae7f3529766aA30CFfe19' as `0x${string}`,
  SEMAPHORE_ADDRESS: '0xD3498E9910146B0E21691c2E07EC79FFE74a393C' as `0x${string}`,
  RELAYER_URL: 'http://localhost:3001',
  DONOR_GROUP_ID: 1
};

export const CROWDFUNDING_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "targetAmount", "type": "uint256" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "img", "type": "string" },
      { "internalType": "uint256", "name": "durationInDays", "type": "uint256" }
    ],
    "name": "createCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" }
    ],
    "name": "donate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "uint256", "name": "merkleTreeRoot", "type": "uint256" },
      { "internalType": "uint256", "name": "nullifierHash", "type": "uint256" },
      { "internalType": "uint256[8]", "name": "proof", "type": "uint256[8]" },
      { "internalType": "address", "name": "relayer", "type": "address" }
    ],
    "name": "donateAnonymously",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCampaignCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "campaignId", "type": "uint256" }],
    "name": "getCampaign",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "uint256", "name": "targetAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "amountRaised", "type": "uint256" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "img", "type": "string" },
      { "internalType": "address", "name": "campaignOwner", "type": "address" },
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCampaigns",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "uint256", "name": "targetAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "amountRaised", "type": "uint256" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "string", "name": "img", "type": "string" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "bool", "name": "isActive", "type": "bool" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "internalType": "struct CrowdFunding.Campaign[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "campaignId", "type": "uint256" }],
    "name": "getAnonymousDonations",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;