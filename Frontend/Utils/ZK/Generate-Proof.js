import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { generateProof } from "@semaphore-protocol/proof";

async function generateDonationProof() {
    console.log("🔐 Generating ZK Proof for Anonymous Donation");
    console.log("═══════════════════════════════════════\n");
    
    // YOUR CONTRACT DETAILS
    const SEMAPHORE_ADDRESS = "0x8c7Bd54Cf43E987e53dc6D2bC4b3BEbd2371e989";
    const CROWDFUNDING_ADDRESS = "0x930E08F5aFc553a4908C25ecb9Eb5EeDb0D4c40c";
    const GROUP_ID = 1;
    const CAMPAIGN_ID = 0;
    
    console.log("📋 Configuration:");
    console.log("   Semaphore:", SEMAPHORE_ADDRESS);
    console.log("   CrowdFunding:", CROWDFUNDING_ADDRESS);
    console.log("   Group ID:", GROUP_ID);
    console.log("   Campaign ID:", CAMPAIGN_ID);
    console.log("\n");
    
    // 1. Create donor identity
    const identity = new Identity();
    console.log("✅ Step 1: Identity Created");
    console.log("   Commitment:", identity.commitment.toString());
    console.log("\n⚠️  IMPORTANT: ADD THIS COMMITMENT TO YOUR SEMAPHORE GROUP!");
    console.log("   Go to Remix → Semaphore contract → addMember");
    console.log("   groupId: 1");
    console.log("   identityCommitment:", identity.commitment.toString());
    console.log("\n⏸  Press Ctrl+C if you need to add the commitment first");
    console.log("   Then run this script again after adding.\n");
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 2. Create group - V4 API
    const members = [identity.commitment];
    const group = new Group(members);
    
    console.log("✅ Step 2: Identity added to local group");
    console.log("   Group size:", group.size);
    console.log("\n");
    
    // 3. Donation parameters
    const donationAmount = 100000000000000000n; // 0.1 MATIC
    
    console.log("💰 Donation Details:");
    console.log("   Amount: 0.1 MATIC");
    console.log("   Campaign ID:", CAMPAIGN_ID);
    console.log("\n");
    
    console.log("🔄 Step 3: Generating ZK proof...");
    console.log("   (This takes 10-15 seconds, please wait...)\n");
    
    try {
        // 4. Generate the proof
        const startTime = Date.now();
        const fullProof = await generateProof(
            identity,
            group,
            donationAmount,
            CAMPAIGN_ID
        );
        const endTime = Date.now();
        
        console.log(`✅ Proof generated in ${(endTime - startTime) / 1000}s!\n`);
        
        // Debug: Show what we got
        console.log("🔍 Proof structure:");
        console.log(fullProof);
        console.log("\n");
        
        // V4 returns different format - let's handle it
        let merkleTreeRoot, nullifierHash, proof;
        
        // Check if it's the new format
        if (fullProof.merkleTreeRoot !== undefined) {
            merkleTreeRoot = fullProof.merkleTreeRoot;
            nullifierHash = fullProof.nullifier || fullProof.nullifierHash;
            proof = fullProof.proof;
        } else {
            // Might be returned as single object
            merkleTreeRoot = fullProof[0];
            nullifierHash = fullProof[1];
            proof = fullProof[2];
        }
        
        console.log("═══════════════════════════════════════");
        console.log("📋 COPY THESE VALUES TO REMIX:");
        console.log("═══════════════════════════════════════\n");
        
        console.log("Function: donateAnonymously\n");
        console.log("Parameters:");
        console.log(`  campaignId: ${CAMPAIGN_ID}`);
        console.log(`  merkleTreeRoot: ${merkleTreeRoot}`);
        console.log(`  nullifierHash: ${nullifierHash}`);
        
        // Handle proof array
        if (Array.isArray(proof)) {
            console.log(`  proof: [${proof.join(',')}]`);
        } else if (typeof proof === 'object') {
            // If proof is an object, extract values
            const proofArray = Object.values(proof);
            console.log(`  proof: [${proofArray.join(',')}]`);
        } else {
            console.log(`  proof: ${proof}`);
        }
        
        console.log(`  value: 0.1 MATIC`);
        console.log("\n═══════════════════════════════════════\n");
        
        // Save for later use
        const proofData = {
            identityCommitment: identity.commitment.toString(),
            campaignId: CAMPAIGN_ID,
            merkleTreeRoot: merkleTreeRoot?.toString(),
            nullifierHash: nullifierHash?.toString(),
            proof: Array.isArray(proof) ? proof.map(p => p.toString()) : proof,
            donationAmount: "0.1 MATIC",
            rawProof: fullProof
        };
        
        console.log("💾 Proof data saved below (for React integration):\n");
        console.log(JSON.stringify(proofData, null, 2));
        
        console.log("\n🎯 Next Steps:");
        console.log("1. Copy the identity commitment above");
        console.log("2. Add it to Semaphore group in Remix");
        console.log("3. Copy the proof parameters");
        console.log("4. Test donateAnonymously in Remix\n");
        
    } catch (error) {
        console.error("\n❌ Error generating proof:");
        console.error(error);
        console.error("\nStack trace:");
        console.error(error.stack);
    }
}

generateDonationProof().catch(console.error);