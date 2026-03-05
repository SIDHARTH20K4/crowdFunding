import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createWalletClient, createPublicClient, http, parseEther, formatEther, verifyMessage } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygonAmoy } from 'viem/chains';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for receipts (use MongoDB/PostgreSQL in production)
const donationReceipts = new Map();

// Viem clients setup
const account = privateKeyToAccount(`0x${process.env.RELAYER_PRIVATE_KEY}`);

const walletClient = createWalletClient({
  account,
  chain: polygonAmoy,
  transport: http(process.env.RPC_URL)
});

const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(process.env.RPC_URL)
});

// Contract ABI
const CROWDFUNDING_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "uint256", "name": "merkleTreeRoot", "type": "uint256" },
      { "internalType": "uint256", "name": "nullifierHash", "type": "uint256" },
      { "internalType": "uint256[8]", "name": "proof", "type": "uint256[8]" },
      { "internalType": "address", "name": "relayer", "type": "address" }
    ],
    "name": "donateAnonymously",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// ==================== HEALTH CHECK ====================

app.get('/health', async (req, res) => {
  try {
    const balance = await publicClient.getBalance({ 
      address: account.address 
    });
    
    res.json({
      status: 'healthy',
      relayerAddress: account.address,
      balance: formatEther(balance),
      network: 'Polygon Amoy',
      chainId: polygonAmoy.id,
      contractAddress: process.env.CONTRACT_ADDRESS,
      totalReceipts: donationReceipts.size
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// ==================== MAIN RELAY ENDPOINT ====================

app.post('/relay', async (req, res) => {
  try {
    const { campaignId, merkleTreeRoot, nullifierHash, proof, amount } = req.body;

    // Validation
    if (campaignId === undefined || !merkleTreeRoot || !nullifierHash || !proof || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: campaignId, merkleTreeRoot, nullifierHash, proof, amount'
      });
    }

    if (!Array.isArray(proof) || proof.length !== 8) {
      return res.status(400).json({
        success: false,
        error: 'Invalid proof format. Expected array of 8 elements.'
      });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    console.log('\n============================================');
    console.log('Processing anonymous donation...');
    console.log('Campaign ID:', campaignId);
    console.log('Amount:', amount, 'MATIC');
    console.log('Relayer Address:', account.address);
    console.log('Contract:', process.env.CONTRACT_ADDRESS);
    console.log('============================================\n');

    // Submit transaction using Viem
    const hash = await walletClient.writeContract({
      address: process.env.CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: 'donateAnonymously',
      args: [
        BigInt(campaignId),
        BigInt(merkleTreeRoot),
        BigInt(nullifierHash),
        proof.map(p => BigInt(p)),
        account.address // relayer parameter (self)
      ],
      value: parseEther(amount.toString()),
      gas: 500000n
    });

    console.log('✅ Transaction submitted:', hash);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log('✅ Transaction confirmed in block:', receipt.blockNumber.toString());

    // Generate unique receipt ID
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store receipt data
    const receiptData = {
      receiptId,
      campaignId: campaignId.toString(),
      amount,
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      timestamp: new Date().toISOString(),
      claimed: false,
      claimedBy: null,
      claimedAt: null
    };

    donationReceipts.set(receiptId, receiptData);

    console.log('✅ Receipt generated:', receiptId);
    console.log('============================================\n');

    res.json({
      success: true,
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      explorerUrl: `https://amoy.polygonscan.com/tx/${hash}`,
      receiptId,
      receiptUrl: `http://localhost:${process.env.PORT || 3001}/receipt/${receiptId}`,
      message: 'Donation successful! Save your receipt ID to claim it later.'
    });

  } catch (error) {
    console.error('❌ Relay error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.shortMessage || 'Transaction failed'
    });
  }
});

// ==================== RECEIPT ENDPOINTS ====================

// Get receipt by ID (public - anyone can view)
app.get('/receipt/:receiptId', (req, res) => {
  const receipt = donationReceipts.get(req.params.receiptId);
  
  if (!receipt) {
    return res.status(404).json({ 
      error: 'Receipt not found',
      message: 'This receipt ID does not exist or may have expired.'
    });
  }

  res.json({
    receiptId: receipt.receiptId,
    campaignId: receipt.campaignId,
    amount: receipt.amount,
    timestamp: receipt.timestamp,
    transactionHash: receipt.transactionHash,
    blockNumber: receipt.blockNumber,
    explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.transactionHash}`,
    claimed: receipt.claimed,
    claimedBy: receipt.claimed ? receipt.claimedBy : null,
    claimedAt: receipt.claimed ? receipt.claimedAt : null
  });
});

// Claim receipt (link to wallet address)
app.post('/claim-receipt', async (req, res) => {
  try {
    const { receiptId, walletAddress, signature, message } = req.body;

    // Validation
    if (!receiptId || !walletAddress || !signature || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['receiptId', 'walletAddress', 'signature', 'message']
      });
    }

    const receipt = donationReceipts.get(receiptId);
    
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    if (receipt.claimed) {
      return res.status(400).json({ 
        error: 'Receipt already claimed',
        claimedBy: receipt.claimedBy,
        claimedAt: receipt.claimedAt
      });
    }

    // Verify signature
    const expectedMessage = `I claim receipt ${receiptId}`;
    if (message !== expectedMessage) {
      return res.status(400).json({ 
        error: 'Invalid message format',
        expected: expectedMessage
      });
    }

    // Verify the signature matches the wallet address
    const isValid = await verifyMessage({
      address: walletAddress,
      message: message,
      signature: signature
    });

    if (!isValid) {
      return res.status(401).json({ 
        error: 'Invalid signature',
        message: 'Signature verification failed'
      });
    }

    // Mark as claimed
    receipt.claimed = true;
    receipt.claimedBy = walletAddress;
    receipt.claimedAt = new Date().toISOString();
    donationReceipts.set(receiptId, receipt);

    console.log(`✅ Receipt ${receiptId} claimed by ${walletAddress}`);

    res.json({
      success: true,
      message: 'Receipt claimed successfully! Your donation is now linked to your wallet.',
      receipt: {
        receiptId: receipt.receiptId,
        campaignId: receipt.campaignId,
        amount: receipt.amount,
        claimedBy: receipt.claimedBy,
        claimedAt: receipt.claimedAt,
        transactionHash: receipt.transactionHash
      }
    });

  } catch (error) {
    console.error('❌ Claim error:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Failed to claim receipt'
    });
  }
});

// Get all receipts claimed by a specific wallet
app.get('/receipts/wallet/:address', (req, res) => {
  const walletAddress = req.params.address.toLowerCase();
  
  const userReceipts = Array.from(donationReceipts.values())
    .filter(receipt => receipt.claimedBy?.toLowerCase() === walletAddress)
    .map(receipt => ({
      receiptId: receipt.receiptId,
      campaignId: receipt.campaignId,
      amount: receipt.amount,
      timestamp: receipt.timestamp,
      claimedAt: receipt.claimedAt,
      transactionHash: receipt.transactionHash,
      explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.transactionHash}`
    }));

  res.json({
    walletAddress: req.params.address,
    totalReceipts: userReceipts.length,
    receipts: userReceipts
  });
});

// ==================== UTILITY ENDPOINTS ====================

// Get relayer balance
app.get('/balance', async (req, res) => {
  try {
    const balance = await publicClient.getBalance({ 
      address: account.address 
    });
    
    res.json({
      address: account.address,
      balance: formatEther(balance),
      unit: 'MATIC',
      balanceWei: balance.toString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Get all receipts (admin/debug endpoint)
app.get('/receipts/all', (req, res) => {
  const allReceipts = Array.from(donationReceipts.values()).map(receipt => ({
    receiptId: receipt.receiptId,
    campaignId: receipt.campaignId,
    amount: receipt.amount,
    timestamp: receipt.timestamp,
    claimed: receipt.claimed,
    claimedBy: receipt.claimed ? receipt.claimedBy : null
  }));

  res.json({
    total: allReceipts.length,
    receipts: allReceipts
  });
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('\n🚀 ============================================');
  console.log('   RELAYER SERVER STARTED');
  console.log('============================================');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📍 Relayer address: ${account.address}`);
  console.log(`📝 Contract address: ${process.env.CONTRACT_ADDRESS}`);
  console.log(`🌐 Network: Polygon Amoy (Chain ID: ${polygonAmoy.id})`);
  console.log('\n📋 Available Endpoints:');
  console.log('   GET  /health                    - Server health check');
  console.log('   POST /relay                     - Submit anonymous donation');
  console.log('   GET  /balance                   - Check relayer balance');
  console.log('   GET  /receipt/:receiptId        - View specific receipt');
  console.log('   POST /claim-receipt             - Claim receipt to wallet');
  console.log('   GET  /receipts/wallet/:address  - Get receipts by wallet');
  console.log('   GET  /receipts/all              - View all receipts (debug)');
  console.log('============================================\n');
});