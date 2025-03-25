// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

contract crowdFunding {
    uint256 private counter;

    struct crowdFund {
        uint256 Amount;
        string Description;
        string img;
        address owner;
        uint256 ID;
    }

    mapping(address => crowdFund) public crowdFundData;

    event CampaignCreated(address indexed owner, uint256 ID, uint256 Amount, string Description, string img);
    event DonationMade(address indexed donor, address indexed campaignOwner, uint256 amount);
    event EtherSentToContract(address indexed sender, address indexed contractAddress, uint256 amount);

    function createCampaign(uint256 Amount, string calldata Description, string calldata img) external payable {
        crowdFund memory newCampaign;
        newCampaign.Description = Description;
        newCampaign.Amount = Amount;
        newCampaign.img = img;
        newCampaign.owner = msg.sender;
        counter++;
        newCampaign.ID = counter;

        crowdFundData[newCampaign.owner] = newCampaign;

        emit CampaignCreated(msg.sender, newCampaign.ID, Amount, Description, img);
    }

    function donateCampaign(address payable campaignOwner) external payable {
        require(campaignOwner != address(0), "Invalid campaign owner address");
        require(crowdFundData[campaignOwner].ID != 0, "Campaign owner does not exist");
        require(msg.value > 0, "Invalid donation amount");

        (bool success, ) = campaignOwner.call{value: msg.value, gas: 500000}("");
        require(success, "Failed to send Ethers");

        emit DonationMade(msg.sender, campaignOwner, msg.value);
    }

    // Function to send Ether to the contract
    function fundContract() public payable {
        // This function can be used to send Ether to the contract
    }

    function contractBalance() public view returns(uint256){
        return address(this).balance;
    }

    function addressBalance(address user) public view returns(uint256){
        return user.balance;
    }
}