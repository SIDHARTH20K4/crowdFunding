export function ConnectWallet({ connectWallet, account }) {
    return (
      <div className="connect-wallet">
        {account ? (
          <button className="btn btn-success" disabled>
            Connected: {account.substring(0, 6)}...{account.substring(38)}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    );
  }