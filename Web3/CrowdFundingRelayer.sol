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

contract CrowdFunding {
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
    
    // NEW: Relayer support
    address public owner;
    mapping(address => bool) public approvedRelayers;
    uint256 public relayerFeePercent = 1; // 1% default fee
    
    event CampaignCreated(uint256 indexed id, address indexed owner, uint256 targetAmount, string description, string img, uint256 deadline);
    event DonationMade(address indexed donor, uint256 indexed campaignId, uint256 amount);
    event AnonymousDonationMade(uint256 indexed campaignId, uint256 netAmount, uint256 relayerFee);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount);
    event RelayerApproved(address indexed relayer);
    event RelayerRemoved(address indexed relayer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(address _semaphoreAddress, uint256 _donorGroupId) {
        semaphore = ISemaphore(_semaphoreAddress);
        donorGroupId = _donorGroupId;
        owner = msg.sender;
    }
    
    // RELAYER MANAGEMENT
    function addRelayer(address relayer) external onlyOwner {
        approvedRelayers[relayer] = true;
        emit RelayerApproved(relayer);
    }
    
    function removeRelayer(address relayer) external onlyOwner {
        approvedRelayers[relayer] = false;
        emit RelayerRemoved(relayer);
    }
    
    function setRelayerFee(uint256 feePercent) external onlyOwner {
        require(feePercent <= 10, "Fee too high"); // Max 10%
        relayerFeePercent = feePercent;
    }
    
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
    
    // Normal donation
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
    
    // UPDATED: Anonymous donation with relayer support
    function donateAnonymously(
        uint256 campaignId,
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        address relayer
    ) external payable {
        require(campaignId < campaigns.length, "Invalid campaign ID");
        Campaign storage campaign = campaigns[campaignId];
        
        require(campaign.isActive, "Campaign is not active");
        require(block.timestamp < campaign.deadline, "Campaign deadline has passed");
        require(msg.value > 0, "Donation amount must be positive");
        require(!nullifierUsed[nullifierHash], "Proof already used");
        
        // If using relayer, verify
        if (relayer != address(0)) {
            require(approvedRelayers[relayer], "Relayer not approved");
            require(msg.sender == relayer, "Only relayer can submit");
        }
        
        // Verify ZK proof
        semaphore.validateProof(
            donorGroupId,
            merkleTreeRoot,
            msg.value,
            nullifierHash,
            proof
        );
        
        nullifierUsed[nullifierHash] = true;
        
        // Calculate fees
        uint256 relayerFee = 0;
        uint256 netDonation = msg.value;
        
        if (relayer != address(0)) {
            relayerFee = (msg.value * relayerFeePercent) / 100;
            netDonation = msg.value - relayerFee;
            payable(relayer).transfer(relayerFee);
        }
        
        campaign.amountRaised += netDonation;
        anonymousDonations[campaignId] += netDonation;
        
        emit AnonymousDonationMade(campaignId, netDonation, relayerFee);
    }
    
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
    
    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }
    
    function getAnonymousDonations(uint256 campaignId) external view returns (uint256) {
        return anonymousDonations[campaignId];
    }
}