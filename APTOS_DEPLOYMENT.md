# Aptos Health Tracker Contract Deployment Guide

## Prerequisites

1. Install Aptos CLI:
```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

2. Initialize your Aptos account:
```bash
aptos init
```
Choose testnet when prompted, and it will create a new account or use an existing one.

## Deploy the Contract

1. Navigate to the contract directory:
```bash
cd contract
```

2. Compile the contract:
```bash
aptos move compile
```

3. Test the contract (optional):
```bash
aptos move test
```

4. Publish the contract to testnet:
```bash
aptos move publish --named-addresses health_tracker=YOUR_ADDRESS_HERE
```

Replace `YOUR_ADDRESS_HERE` with your actual account address from `aptos init`.

## Update Frontend Configuration

After deployment, update the CONTRACT_ADDRESS in `src/services/aptosService.js`:

```javascript
// Replace this line:
const CONTRACT_ADDRESS = "0x1"; // Placeholder

// With your deployed contract address:
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_ADDRESS_HERE";
```

## Testing

1. Start your React app:
```bash
npm run dev
```

2. Connect your wallet (make sure it's on testnet)
3. Try loading demo data or clearing data
4. Check the transaction hashes on [Aptos Explorer (Testnet)](https://explorer.aptoslabs.com/?network=testnet)

## Notes

- The contract is currently configured for testnet
- You'll need testnet APT tokens for gas fees
- Make sure your wallet is connected to the same network (testnet) as your contract
- The contract stores health data as JSON strings for flexibility

## Troubleshooting

- If you get "resource not found" errors, the user hasn't initialized their health data yet
- If transactions fail, check you have enough APT for gas fees
- Make sure the CONTRACT_ADDRESS matches your deployed contract address 