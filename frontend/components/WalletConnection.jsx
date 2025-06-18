import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "./WalletSelector";
import "./WalletConnection.css";

export function WalletConnection() {
  const { connected, account, disconnect } = useWallet();
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);

  const truncateAddress = (address) => {
    if (!address) return "";
    // Convert address to string in case it's an object
    const addressStr = typeof address === 'string' ? address : address.toString();
    return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  if (connected && account) {
    return (
      <div className="wallet-connection connected">
        <div className="wallet-info">
          <div className="wallet-status">
            <div className="status-indicator connected"></div>
            <span className="status-text">Connected</span>
          </div>
          <div className="wallet-address">
            {truncateAddress(account.address)}
          </div>
        </div>
        <button 
          className="wallet-button disconnect-button" 
          onClick={handleDisconnect}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="wallet-connection disconnected">
        <button 
          className="wallet-button connect-button" 
          onClick={() => setIsWalletSelectorOpen(true)}
        >
          Connect Wallet
        </button>
      </div>
      <WalletSelector 
        isOpen={isWalletSelectorOpen}
        onClose={() => setIsWalletSelectorOpen(false)}
      />
    </>
  );
} 