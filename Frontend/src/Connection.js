import { ethers } from "ethers";

const contractAddress = "0xYOUR_CONTRACT_ADDRESS"; // Replace with actual contract address
let provider, signer, contract;

const ABI = [{
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "ID", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "Amount", "type": "uint256" },
            { "indexed": false, "internalType": "string", "name": "Description", "type": "string" },
            { "indexed": false, "internalType": "string", "name": "img", "type": "string" }
        ],
        "name": "CampaignCreated",
        "type": "event"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "Amount", "type": "uint256" },
            { "internalType": "string", "name": "Description", "type": "string" },
            { "internalType": "string", "name": "img", "type": "string" }
        ],
        "name": "createCampaign",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address payable", "name": "campaignOwner", "type": "address" }],
        "name": "donateCampaign",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
];

export async function initializeProviderAndSigner() {
    // Check if already initialized
    if (provider && signer) return { provider, signer, contract };

    if (!window.ethereum) {
        throw new Error("MetaMask not installed");
    }

    try {
        // Check for pending requests
        if (window.ethereum._state && window.ethereum._state.isConnected) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Request accounts
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Modern ethers v6 syntax
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        contract = new ethers.Contract(contractAddress, ABI, signer);

        return { provider, signer, contract };
    } catch (error) {
        console.error("Initialization error:", error);
        throw error;
    }
}

export async function createCampaign(amountInEth, description, imgUrl) {
    const { contract } = await initializeProviderAndSigner();
    const tx = await contract.createCampaign(
        ethers.parseEther(amountInEth),
        description,
        imgUrl
    );
    return tx.wait();
}

export async function donateToCampaign(campaignOwner, amountInEth) {
    const { contract } = await initializeProviderAndSigner();
    const tx = await contract.donateCampaign(campaignOwner, {
        value: ethers.parseEther(amountInEth)
    });
    return tx.wait();
}