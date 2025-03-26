import { ethers } from "ethers";

const contractAddress = "0xYOUR_CONTRACT_ADDRESS";
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


//Initializes provider, signer, and contract instance.

export async function initializeProviderAndSigner() {
    if (!window.ethereum) {
        throw new Error("MetaMask not installed");
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, ABI, signer);

    return signer; // ✅ Return signer so App.jsx can use it
}

export async function createCampaign(amountInEth, description, imgUrl) {
    if (!signer) await initializeProviderAndSigner();
    const tx = await contract.createCampaign(
        ethers.utils.parseEther(amountInEth),
        description,
        imgUrl
    );
    await tx.wait();
    console.log("Campaign created ✅", tx);
}

export async function donateToCampaign(campaignOwner, amountInEth) {
    if (!signer) await initializeProviderAndSigner();
    try {
        const tx = await contract.donateCampaign(campaignOwner, {
            value: ethers.utils.parseEther(amountInEth),
        });
        await tx.wait();
        console.log("Donation successful ✅", tx);
        return tx;
    } catch (error) {
        console.error("Transaction failed ❌", error);
        throw error;
    }
}