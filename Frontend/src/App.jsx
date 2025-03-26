import { useState, useEffect } from "react";
import { createCampaign, donateToCampaign } from "./connection"; // ✅ Import connection functions
import initializeProviderAndSigner from "./connection"; // ✅ Import the wallet initialization function

function App() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    async function connectWallet() {
      try {
        const signer = await initializeProviderAndSigner(); // ✅ Use the function from connection.js
        const userAddress = await signer.getAddress();
        setAccount(userAddress);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    }
    connectWallet();
  }, []);

  return (
    <div>
      <h1>Crowdfunding DApp</h1>
      {account ? <p>Connected as: {account}</p> : <p>Connecting...</p>}
      <button onClick={() => createCampaign("0.1", "Help fund our project!", "https://via.placeholder.com/150")}>
        Create Campaign
      </button>
      <button onClick={() => donateToCampaign("0xOWNER_ADDRESS", "0.05")}>
        Donate
      </button>
    </div>
  );
}

export default App;
