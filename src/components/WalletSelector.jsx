import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const WalletConnect = () => {
  const { account, connected } = useWallet();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <WalletSelector />
      {connected && account && (
        <div style={{ 
          fontSize: '0.875rem', 
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>✅ Connected:</span>
          <code>{account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}</code>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 