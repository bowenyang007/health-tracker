import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

export const WalletProvider = ({ children }) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: Network.TESTNET }} // Using testnet for development
      onError={(error) => {
        console.log("Wallet connection error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export default WalletProvider; 