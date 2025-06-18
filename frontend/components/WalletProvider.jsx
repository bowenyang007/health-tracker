import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

// Using the built-in wallet support from the adapter
const wallets = [];

export function WalletProvider({ children }) {
  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      dappConfig={{
        network: "testnet", // Change to "mainnet" for production
        mizuwallet: {
          manifestURL: "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json",
        },
      }}
      onError={(error) => {
        console.log("Wallet Adapter Error: ", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
} 