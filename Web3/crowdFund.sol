// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract crowdFunding
{
    uint256 private counter;

    struct crowdFund{
        uint256 Amount;
        string Description;
        string img;
        address owner;
        uint256 ID;
    }

    mapping(address => crowdFund) public crowdFundData;

    function createCampaign(uint256 Amount,
        string calldata Description,
        string calldata img
        ) external payable 
        {
            crowdFund memory newCampaign;
            newCampaign.Description = Description;
            newCampaign.Amount = Amount;
            newCampaign.img = img;
            newCampaign.owner = msg.sender;
            counter++;
            newCampaign.ID = counter;

            crowdFundData[newCampaign.owner] = newCampaign;
        }
}