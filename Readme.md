# PrivateFund

Privacy-Enhanced Crowdfunding Platform using Zero-Knowledge Proofs

## 🎯 Overview

PrivateFund is a decentralized crowdfunding platform that enables anonymous donations using zero-knowledge proof technology. Built on Polygon Amoy testnet, it allows donors to contribute to campaigns while keeping their wallet addresses completely hidden on the blockchain.

### Key Features

- 🔐 **Anonymous Donations** - Zero-knowledge proofs hide donor wallet addresses
- ⚡ **Fast & Secure** - Built on Polygon Amoy blockchain
- 🧾 **Optional Receipts** - Claim verifiable proof of donation when needed
- 💰 **Campaign Management** - Create and manage fundraising campaigns
- 🔗 **Smart Contract Powered** - Trustless, transparent fund distribution

## 🏗️ Architecture

### Technology Stack

**Smart Contracts:**
- Solidity 0.8.26
- Semaphore Protocol v4.14.2 for ZK proofs
- Polygon Amoy Testnet

**Backend (Relayer Server):**
- Node.js
- Viem for blockchain interactions
- Express.js for API
- In-memory receipt storage

**Frontend:**
- React 18 + TypeScript
- Vite
- wagmi for wallet connections
- RainbowKit for wallet UI

### System Components

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   User's    │─────▶│   Frontend   │─────▶│   Relayer   │
│   Wallet    │      │    (React)   │      │   Server    │
└─────────────┘      └──────────────┘      └─────────────┘
                            │                      │
                            │                      │
                            ▼                      ▼
                     ┌──────────────────────────────────┐
                     │   Smart Contracts (Polygon)      │
                     │  - CrowdFunding.sol              │
                     │  - Semaphore.sol                 │
                     └──────────────────────────────────┘
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- MetaMask or compatible Web3 wallet
- Polygon Amoy testnet MATIC (get from faucet)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd crowdFunding
```

### 2. Install Frontend Dependencies

```bash
cd Frontend
npm install
```

### 3. Install Relayer Server Dependencies

```bash
cd relayer-server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `relayer-server` directory:

```env
RELAYER_PRIVATE_KEY=your_relayer_private_key_without_0x
CONTRACT_ADDRESS=0x4374C7EdB01ABbedafCae7f3529766aA30CFfe19
SEMAPHORE_ADDRESS=0xD3498E9910146B0E21691c2E07EC79FFE74a393C
RPC_URL=https://rpc-amoy.polygon.technology/
PORT=3001
```

### 5. Update Frontend Configuration

Update `frontend/src/config/contracts.ts` with deployed contract addresses:

```typescript
export const CONTRACTS = {
  CROWDFUNDING_ADDRESS: '0x4374C7EdB01ABbedafCae7f3529766aA30CFfe19' as `0x${string}`,
  SEMAPHORE_ADDRESS: '0xD3498E9910146B0E21691c2E07EC79FFE74a393C' as `0x${string}`,
  RELAYER_URL: 'http://localhost:3001',
  DONOR_GROUP_ID: 1
};
```

## 🎮 Running the Application

### Start Relayer Server

```bash
cd relayer-server
node server.js
```

Server will start on `http://localhost:3001`

### Start Frontend

```bash
cd Frontend
npm run dev
```

Frontend will start on `http://localhost:3000`

### Access the Application

1. Open browser to `http://localhost:3000`
2. Connect MetaMask wallet (ensure you're on Polygon Amoy network)
3. Get testnet MATIC from faucet if needed
4. Start creating campaigns or making donations!

## 🔧 Smart Contract Deployment

### Deployed Contracts (Polygon Amoy)

- **CrowdFunding Contract:** `0x4374C7EdB01ABbedafCae7f3529766aA30CFfe19`
- **Semaphore Contract:** `0xD3498E9910146B0E21691c2E07EC79FFE74a393C`
- **Donor Group ID:** `1`
- **Relayer Wallet:** `0x1a5D145b7DE3c635B4dd256854CFfA7e6C08f470`

### Deployment Steps (If Redeploying)

1. **Deploy Semaphore Contract** in Remix
   - Copy and compile `Semaphore.sol`
   - Deploy to Polygon Amoy
   - Note the contract address

2. **Create Donor Group**
   ```solidity
   createGroup(1, 20, YOUR_WALLET_ADDRESS)
   ```

3. **Deploy CrowdFunding Contract**
   - Constructor parameters:
     - `_semaphoreAddress`: Address from step 1
     - `_donorGroupId`: `1`
   - Note the contract address

4. **Approve Relayer**
   ```solidity
   addRelayer(0x1a5D145b7DE3c635B4dd256854CFfA7e6C08f470)
   ```

5. **Update Configuration**
   - Update `.env` in relayer-server
   - Update `contracts.ts` in frontend

## 💡 How It Works

### Normal Donation Flow

1. User selects a campaign
2. Enters donation amount
3. Clicks "Donate" button
4. MetaMask pops up for confirmation
5. Transaction is sent directly to campaign
6. User's wallet address is visible on-chain

### Anonymous Donation Flow

1. User selects a campaign
2. Enters donation amount
3. Clicks "Private" button
4. **Step 1:** User sends MATIC to relayer wallet (MetaMask popup)
5. **Step 2:** Frontend generates zero-knowledge proof (3-4 seconds)
   - Creates anonymous identity
   - Builds Merkle tree
   - Generates Groth16 proof
6. **Step 3:** Proof is sent to relayer server
7. Relayer submits donation transaction using received funds
8. **Result:** Donation appears from relayer address, not user's!
9. User receives receipt ID for optional claiming

### Privacy Guarantees

- **On-chain:** User wallet address never appears in donation transaction
- **Off-chain (unclaimed receipt):** No link between user and donation
- **Off-chain (claimed receipt):** User can prove donation via signed message (optional)

### Receipt System

Receipts provide **selective disclosure**:
- Unclaimed: 100% anonymous on-chain and off-chain
- Claimed: 100% anonymous on-chain, provable off-chain via signature

Perfect for:
- Tax deductions
- Matching programs
- Proof of charitable contribution
- Whistleblower protection

## 📂 Project Structure

```
crowdFunding/
├── Frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── contracts.ts          # Contract addresses & ABIs
│   │   ├── utils/
│   │   │   ├── components/
│   │   │   │   ├── getAllList.tsx    # Campaign list
│   │   │   │   ├── CampaignCard.tsx  # Campaign card component
│   │   │   │   ├── createCampaign.tsx # Create campaign form
│   │   │   │   ├── AnonymousDonate.tsx # ZK proof generation
│   │   │   │   └── ReceiptManager.tsx  # Receipt management
│   │   │   └── WalletConnect.tsx     # Wallet connection
│   │   └── App.tsx                    # Main app component
│   ├── package.json
│   └── vite.config.ts
│
├── relayer-server/
│   ├── server.js                      # Express server + relayer logic
│   ├── .env                           # Environment variables
│   └── package.json
│
├── contracts/
│   ├── CrowdFunding.sol               # Main crowdfunding contract
│   └── Semaphore.sol                  # ZK proof verification
│
└── README.md
```

## 🔌 API Endpoints (Relayer Server)

### Health Check
```
GET /health
```
Returns server status, relayer balance, network info

### Submit Anonymous Donation
```
POST /relay
Body: {
  campaignId: string,
  merkleTreeRoot: string,
  nullifierHash: string,
  proof: string[],
  amount: string,
  paymentTxHash: string,
  payerAddress: string
}
```
Submits anonymous donation to blockchain

### Get Receipt
```
GET /receipt/:receiptId
```
Returns receipt details

### Claim Receipt
```
POST /claim-receipt
Body: {
  receiptId: string,
  walletAddress: string,
  signature: string,
  message: string
}
```
Links receipt to wallet via signature verification

### Get Receipts by Wallet
```
GET /receipts/wallet/:address
```
Returns all receipts claimed by a wallet

## 🧪 Testing Workflow

### 1. Create a Campaign
- Go to "Create Campaign" tab
- Fill in details:
  - Target Amount: 1 MATIC
  - Description: "Test Campaign"
  - Duration: 30 days
- Click "Create Campaign"
- Confirm in MetaMask

### 2. Make Normal Donation
- Click on a campaign card
- Enter amount (e.g., 0.001 MATIC)
- Click "Donate"
- Confirm in MetaMask
- Check transaction on Amoy Scan - your wallet address is visible

### 3. Make Anonymous Donation
- Click on a campaign card
- Enter amount (e.g., 0.001 MATIC)
- Click "Private"
- Confirm payment to relayer in MetaMask
- Wait for proof generation (3-4 seconds)
- Transaction submitted automatically
- Check Amoy Scan - relayer address appears, NOT yours! ✅

### 4. View Receipts
- Go to "My Receipts" tab
- See your anonymous donation receipts
- Click "View Details" to see receipt info
- Click "View on Chain" to verify on block explorer
- Optionally click "Claim Receipt" to link it to your wallet

## 🎓 Educational Value

This project demonstrates:

1. **Zero-Knowledge Proofs** - Semaphore Protocol implementation
2. **Smart Contract Development** - Solidity, events, modifiers
3. **Relayer Pattern** - Meta-transactions for privacy
4. **Full-Stack Web3** - React + Node.js + Blockchain integration
5. **Wallet Integration** - wagmi, RainbowKit, MetaMask
6. **TypeScript Best Practices** - Type safety in Web3
7. **Privacy Engineering** - Selective disclosure, anonymity sets

## 🛡️ Security Considerations

### Implemented
- ✅ Relayer approval system
- ✅ Nullifier hash tracking (prevents double-spending)
- ✅ Smart contract access control
- ✅ Signature verification for receipt claiming

### Production Recommendations
- Use database instead of in-memory storage for receipts
- Implement rate limiting on relayer endpoints
- Add relayer balance monitoring and alerts
- Deploy to mainnet with proper key management
- Add multiple relayers for redundancy
- Implement proper logging and monitoring
- Add HTTPS for relayer server
- Conduct security audit of smart contracts

## 🐛 Known Limitations

- **Testnet Only:** Currently deployed on Polygon Amoy testnet
- **In-Memory Storage:** Receipts stored in memory (use database for production)
- **Single Relayer:** One relayer wallet (add redundancy for production)
- **Simplified ZK Proof:** Uses test Semaphore implementation (enhance for mainnet)
- **No Refund Privacy:** Refunds expose donor address (by design)

## 🤝 Contributing

This is a final year college project. Suggestions and improvements are welcome!

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Omely**
- CTO of Omely.ai
- Final Year College Student
- Web3 & Privacy Technology Enthusiast

## 🙏 Acknowledgments

- **Semaphore Protocol** - Privacy infrastructure
- **Polygon** - Scalable blockchain platform
- **Anthropic Claude** - Development assistance
- **Ethereum Foundation** - ZK research and tools

## 📞 Support

For issues or questions:
- Check existing documentation
- Review smart contract code in Remix
- Verify network configuration (Polygon Amoy)
- Ensure relayer server is running
- Check browser console for errors

## 🚀 Future Enhancements

- [ ] Deploy to Polygon mainnet
- [ ] Add database for receipt persistence
- [ ] Implement multi-relayer system
- [ ] Add campaign categories and search
- [ ] Social proof and verification badges
- [ ] Mobile app (React Native)
- [ ] Enhanced analytics dashboard
- [ ] Integration with traditional payment gateways
- [ ] DAO governance for platform decisions

---

**Built with ❤️ for privacy and transparency in charitable giving**