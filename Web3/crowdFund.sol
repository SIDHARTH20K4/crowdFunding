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
    
    // NEW: Semaphore integration
    ISemaphore public semaphore;
    uint256 public donorGroupId;
    mapping(uint256 => bool) public nullifierUsed;
    mapping(uint256 => uint256) public anonymousDonations; // campaignId => total anonymous amount
    
    event CampaignCreated(uint256 indexed id, address indexed owner, uint256 targetAmount, string description, string img, uint256 deadline);
    event DonationMade(address indexed donor, uint256 indexed campaignId, uint256 amount);
    event AnonymousDonationMade(uint256 indexed campaignId, uint256 amount); // NEW
    event FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount);
    
    // NEW: Constructor with Semaphore address
    constructor(address _semaphoreAddress, uint256 _donorGroupId) {
        semaphore = ISemaphore(_semaphoreAddress);
        donorGroupId = _donorGroupId;
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
    
    // EXISTING: Normal donation (unchanged)
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
    
    // NEW: Anonymous donation with ZK proof
    function donateAnonymously(
        uint256 campaignId,
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
        
        // Verify ZK proof - this proves donor is in the group without revealing who
        semaphore.validateProof(
            donorGroupId,
            merkleTreeRoot,
            msg.value, // signal = donation amount
            nullifierHash,
            proof
        );
        
        // Mark this proof as used (prevent double-spending)
        nullifierUsed[nullifierHash] = true;
        
        // Update campaign funds
        campaign.amountRaised += msg.value;
        anonymousDonations[campaignId] += msg.value;
        
        emit AnonymousDonationMade(campaignId, msg.value);
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
    
    // NEW: View functions for anonymous donations
    function getAnonymousDonations(uint256 campaignId) external view returns (uint256) {
        return anonymousDonations[campaignId];
    }
}

//0x930E08F5aFc553a4908C25ecb9Eb5EeDb0D4c40c