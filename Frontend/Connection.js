import ethers from "ethers";
const contractAddress = "";
let provider, signer;

const ABI = [{
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ID",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "Amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "Description",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "img",
                "type": "string"
            }
        ],
        "name": "CampaignCreated",
        "type": "event"
    },
    {
        "inputs": [{
                "internalType": "uint256",
                "name": "Amount",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "Description",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "img",
                "type": "string"
            }
        ],
        "name": "createCampaign",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address payable",
            "name": "campaignOwner",
            "type": "address"
        }],
        "name": "donateCampaign",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "campaignOwner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "DonationMade",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "contractAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "EtherSentToContract",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "fundContract",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "user",
            "type": "address"
        }],
        "name": "addressBalance",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "contractBalance",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "name": "crowdFundData",
        "outputs": [{
                "internalType": "uint256",
                "name": "Amount",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "Description",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "img",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "ID",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const contract = new ethers.contract(contractAddress, ABI, signer);


async function getProvidersandSigners() {
    if (!window.ethereum) {
        throw new Error("Metamask not installed");
    }

    //requesting metamask to connect to the wallet
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = ethers.provider.Web3Provider(window.ethereum);

    const signer = provider.getSigner();

    return { provider, signer }
}

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