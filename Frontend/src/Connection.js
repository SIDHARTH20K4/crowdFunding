import { ethers } from "ethers";

const contractAddress = "0xYOUR_CONTRACT_ADDRESS"; // Replace with your deployed contract address
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

/**
 * Initializes provider, signer, and contract instance.
 */
async function initializeProviderAndSigner() {
    if (!window.ethereum) {
        throw new Error("MetaMask not installed");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, ABI, signer);
}

/**
 * Creates a new crowdfunding campaign.
 * @param {string} amountInEth - Amount in ETH
 * @param {string} description - Campaign description
 * @param {string} imgUrl - Campaign image URL
 */
async function createCampaign(amountInEth, description, imgUrl) {
    if (!signer) await initializeProviderAndSigner(); // Ensure signer is initialized

    const tx = await contract.createCampaign(
        ethers.utils.parseEther(amountInEth),
        description,
        imgUrl
    );
    await tx.wait();
    console.log("Campaign created ✅", tx);
}

/**
 * Donates ETH to a crowdfunding campaign.
 * @param {string} campaignOwner - Address of the campaign owner
 * @param {string} amountInEth - Amount in ETH
 */
async function donateToCampaign(campaignOwner, amountInEth) {
    if (!signer) await initializeProviderAndSigner(); // Ensure signer is initialized

    try {
        const tx = await contract.donateCampaign(campaignOwner, {
            value: ethers.utils.parseEther(amountInEth),
        });

        console.log("Transaction sent! Waiting for confirmation...");
        await tx.wait();

        console.log("Transaction confirmed ✅", tx);
        return tx;
    } catch (error) {
        console.error("Transaction failed ❌", error);
        throw error;
    }
}

// Initialize provider and signer at the start
initializeProviderAndSigner();

export { createCampaign, donateToCampaign };