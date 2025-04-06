import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const contractAddress = "YOUR_CONTRACT_ADDRESS";

export function useCrowdfunding() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);

    const connectWallet = async() => {
        if (window.ethereum) {
            try {
                setLoading(true);
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();

                setProvider(provider);
                setSigner(signer);
                setAccount(accounts[0]);

                const contract = new ethers.Contract(contractAddress, crowdFundingABI, signer);
                setContract(contract);

                await fetchCampaigns(contract);
            } catch (error) {
                console.error("Error connecting wallet:", error);
            } finally {
                setLoading(false);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    const fetchCampaigns = async(contract) => {
        // In a real app, you'd need to track campaign IDs and fetch each one
        // This is simplified for the demo
        try {
            setLoading(true);
            // You would need to implement proper campaign fetching logic here
            // For now we'll just show a mock campaign
            setCampaigns([{
                id: 1,
                amount: "1 ETH",
                description: "Sample Campaign",
                img: "https://placehold.co/600x400",
                owner: "0x123...abc"
            }]);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const createCampaign = async(amount, description, img) => {
        try {
            setLoading(true);
            const tx = await contract.createCampaign(
                ethers.parseEther(amount.toString()),
                description,
                img
            );
            await tx.wait();
            await fetchCampaigns(contract);
        } catch (error) {
            console.error("Error creating campaign:", error);
        } finally {
            setLoading(false);
        }
    };

    const donate = async(campaignId, amount) => {
        try {
            setLoading(true);
            const tx = await contract.donateCampaign(
                campaigns[campaignId].owner, { value: ethers.parseEther(amount.toString()) }
            );
            await tx.wait();
        } catch (error) {
            console.error("Error donating:", error);
        } finally {
            setLoading(false);
        }
    };

    return {
        provider,
        signer,
        contract,
        account,
        campaigns,
        loading,
        connectWallet,
        createCampaign,
        donate
    };
}