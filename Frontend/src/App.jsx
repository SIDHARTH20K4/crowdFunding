import { useState, useEffect } from "react";
import { createCampaign, donateToCampaign, initializeProviderAndSigner } from "./Connection";

function App() {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [campaignOwner, setCampaignOwner] = useState("");

  const connectWallet = async () => {
    setLoading(true);
    setError("");
    try {
      const { signer } = await initializeProviderAndSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (err) {
      console.error("Connection error:", err);
      setError(err.message.includes("already pending") 
        ? "Please complete the pending wallet request first" 
        : "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if already connected
    if (window.ethereum?.isConnected()) {
      connectWallet();
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Crowdfunding DApp</h1>
      
      {account ? (
        <p>Connected: {account}</p>
      ) : (
        <button onClick={connectWallet} disabled={loading}>
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: 20 }}>
        <button onClick={() => createCampaign("0.1", "Test", "https://example.com")}>
          Create Campaign
        </button>
        <input
          value={campaignOwner}
          onChange={(e) => setCampaignOwner(e.target.value)}
          placeholder="Campaign Owner Address"
        />
        <button 
          onClick={() => donateToCampaign(campaignOwner, "0.05")}
          disabled={!campaignOwner}
        >
          Donate
        </button>
      </div>
    </div>
  );
}

export default App;