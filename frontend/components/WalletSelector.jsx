import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import "./WalletSelector.css";

export function WalletSelector({ isOpen, onClose }) {
  const { wallets, connect } = useWallet();

  const handleWalletConnect = async (walletName) => {
    try {
      await connect(walletName);
      onClose();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wallet-modal-header">
          <h2>Connect Wallet</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="wallet-modal-content">
          <p className="wallet-modal-description">
            Choose a wallet to connect to this dapp:
          </p>
          <div className="wallet-list">
            {wallets?.map((wallet) => (
              <WalletRow
                key={wallet.name}
                wallet={wallet}
                onConnect={() => handleWalletConnect(wallet.name)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletRow({ wallet, onConnect }) {
  return (
    <div className="wallet-row" onClick={onConnect}>
      <div className="wallet-info">
        <img
          src={wallet.icon}
          alt={wallet.name}
          className="wallet-icon"
        />
        <div className="wallet-details">
          <div className="wallet-name">{wallet.name}</div>
          <div className="wallet-description">
            {wallet.readyState === "Installed"
              ? "Detected"
              : "Not Detected"}
          </div>
        </div>
      </div>
      <div className="wallet-connect-button">
        {wallet.readyState === "Installed" ? "Connect" : "Install"}
      </div>
    </div>
  );
} 