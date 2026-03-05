// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface ISemaphore {
    function validateProof(
        uint256 groupId,
        uint256 merkleTreeRoot,
        uint256 signal,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external view;
}

contract CrowdFundingComplete {
    struct Campaign {
        uint256 id;
        uint256 targetAmount;
        uint256 amountRaised;
        string description;
        string img;
        address owner;
        bool isActive;
        uint256 deadline;
    }
    
    Campaign[] public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donations;
    
    // ZK Privacy features
    ISemaphore public semaphore;
    uint256 public donorGroupId;
    mapping(uint256 => bool) public nullifierUsed;
    mapping(uint256 => uint256) public anonymousDonations;
    
    // Relayer support
    address public contractOwner;
    mapping(address => bool) public approvedRelayers;
    uint256 public relayerFeePercent = 1; // 1% default fee
    
    event CampaignCreated(uint256 indexed id, address indexed owner, uint256 targetAmount, string description, string img, uint256 deadline);
    event DonationMade(address indexed donor, uint256 indexed campaignId, uint256 amount);
    event AnonymousDonationMade(uint256 indexed campaignId, uint256 netAmount, uint256 relayerFee);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount);
    event RelayerApproved(address indexed relayer);
    event RelayerRemoved(address indexed relayer);
    
    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Only contract owner");
        _;
    }
    
    constructor(address _semaphoreAddress, uint256 _donorGroupId) {
        semaphore = ISemaphore(_semaphoreAddress);
        donorGroupId = _donorGroupId;
        contractOwner = msg.sender;
        
        // Auto-approve deployer as first relayer
        approvedRelayers[msg.sender] = true;
    }
    
    // ==================== RELAYER MANAGEMENT ====================
    
    function addRelayer(address relayer) external onlyContractOwner {
        approvedRelayers[relayer] = true;
        emit RelayerApproved(relayer);
    }
    
    function removeRelayer(address relayer) external onlyContractOwner {
        approvedRelayers[relayer] = false;
        emit RelayerRemoved(relayer);
    }
    
    function setRelayerFee(uint256 feePercent) external onlyContractOwner {
        require(feePercent <= 10, "Fee too high"); // Max 10%
        relayerFeePercent = feePercent;
    }
    
    // ==================== CAMPAIGN MANAGEMENT ====================
    
    function createCampaign(
        uint256 targetAmount,
        string calldata description,
        string calldata img,
        uint256 durationInDays
    ) external {
        require(targetAmount > 0, "Target amount must be positive");
        require(bytes(description).length > 0, "Description required");
        
        uint256 id = campaigns.length;
        uint256 deadline = block.timestamp + (durationInDays * 1 days);
        
        campaigns.push(Campaign({
            id: id,
            targetAmount: targetAmount,
            amountRaised: 0,
            description: description,
            img: img,
            owner: msg.sender,
            isActive: true,
            deadline: deadline
        }));
        
        emit CampaignCreated(id, msg.sender, targetAmount, description, img, deadline);
    }
    
    // ==================== DONATION FUNCTIONS ====================
    
    // Normal donation (wallet address visible)
    function donate(uint256 campaignId) external payable {
        require(campaignId < campaigns.length, "Invalid campaign ID");
        Campaign storage campaign = campaigns[campaignId];
        
        require(campaign.isActive, "Campaign is not active");
        require(block.timestamp < campaign.deadline, "Campaign deadline has passed");
        require(msg.value > 0, "Donation amount must be positive");
        
        campaign.amountRaised += msg.value;
        donations[campaignId][msg.sender] += msg.value;
        
        emit DonationMade(msg.sender, campaignId, msg.value);
    }
    
    // Anonymous donation with ZK proof and relayer support
    function donateAnonymously(
        uint256 campaignId,
        uint256 merkleTreeDepth,
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external payable {
        require(campaignId < campaigns.length, "Invalid campaign ID");
        Campaign storage campaign = campaigns[campaignId];
        
        require(campaign.isActive, "Campaign is not active");
        require(block.timestamp < campaign.deadline, "Campaign deadline has passed");
        require(msg.value > 0, "Donation amount must be positive");
        require(!nullifierUsed[nullifierHash], "Proof already used");
        
        // Check if sender is approved relayer
        address relayer = address(0);
        uint256 relayerFee = 0;
        uint256 netDonation = msg.value;
        
        if (approvedRelayers[msg.sender]) {
            relayer = msg.sender;
            relayerFee = (msg.value * relayerFeePercent) / 100;
            netDonation = msg.value - relayerFee;
        }
        
        // Verify ZK proof
        semaphore.validateProof(
            donorGroupId,
            merkleTreeRoot,
            netDonation, // signal = net donation amount
            nullifierHash,
            proof
        );
        
        nullifierUsed[nullifierHash] = true;
        
        // Pay relayer fee if applicable
        if (relayer != address(0) && relayerFee > 0) {
            payable(relayer).transfer(relayerFee);
        }
        
        // Add to campaign
        campaign.amountRaised += netDonation;
        anonymousDonations[campaignId] += netDonation;
        
        emit AnonymousDonationMade(campaignId, netDonation, relayerFee);
    }
    
    // ==================== WITHDRAWAL & REFUND ====================
    
    function withdrawFunds(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        
        require(msg.sender == campaign.owner, "Only campaign owner can withdraw");
        require(campaign.isActive, "Campaign is not active");
        require(block.timestamp >= campaign.deadline, "Cannot withdraw before deadline");
        require(campaign.amountRaised >= campaign.targetAmount, "Funding goal not reached");
        
        uint256 amount = campaign.amountRaised;
        campaign.amountRaised = 0;
        campaign.isActive = false;
        
        payable(msg.sender).transfer(amount);
        
        emit FundsWithdrawn(campaignId, msg.sender, amount);
    }
    
    function getRefund(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        
        require(block.timestamp >= campaign.deadline, "Cannot refund before deadline");
        require(campaign.amountRaised < campaign.targetAmount, "Funding goal was reached");
        
        uint256 amount = donations[campaignId][msg.sender];
        require(amount > 0, "No donations to refund");
        
        donations[campaignId][msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
    
    // ==================== VIEW FUNCTIONS (FOR FRONTEND) ====================
    
    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }
    
    function getCampaign(uint256 campaignId) external view returns (
        uint256 id,
        uint256 targetAmount,
        uint256 amountRaised,
        string memory description,
        string memory img,
        address owner,
        bool isActive,
        uint256 deadline
    ) {
        require(campaignId < campaigns.length, "Invalid campaign ID");
        Campaign memory campaign = campaigns[campaignId];
        
        return (
            campaign.id,
            campaign.targetAmount,
            campaign.amountRaised,
            campaign.description,
            campaign.img,
            campaign.owner,
            campaign.isActive,
            campaign.deadline
        );
    }
    
    function getAllCampaigns() external view returns (Campaign[] memory) {
        return campaigns;
    }
    
    function getActiveCampaigns() external view returns (Campaign[] memory) {
        uint256 activeCount = 0;
        
        // Count active campaigns
        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i].isActive && block.timestamp < campaigns[i].deadline) {
                activeCount++;
            }
        }
        
        // Create array of active campaigns
        Campaign[] memory activeCampaigns = new Campaign[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i].isActive && block.timestamp < campaigns[i].deadline) {
                activeCampaigns[index] = campaigns[i];
                index++;
            }
        }
        
        return activeCampaigns;
    }
    
    function getAnonymousDonations(uint256 campaignId) external view returns (uint256) {
        return anonymousDonations[campaignId];
    }
    
    function getDonorContribution(uint256 campaignId, address donor) external view returns (uint256) {
        return donations[campaignId][donor];
    }
    
    function isRelayerApproved(address relayer) external view returns (bool) {
        return approvedRelayers[relayer];
    }
}

//0x94A1027556140c7cD2f90BAf3bc6977CB04c9D01