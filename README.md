# Health Tracker Aptos DApp

A decentralized health tracking application built on the Aptos blockchain. Track your weight measurements on-chain with privacy and data ownership.

## 🏗️ Project Structure

This project follows the Aptos DApp architecture:

```
health-tracker/
├── frontend/              # React frontend application
│   ├── components/       # React components
│   ├── pages/           # Main pages (Dashboard, EditTab, etc.)
│   ├── services/        # Data services (localStorage & Aptos)
│   ├── utils/           # Utility functions
│   └── main.jsx         # React entry point
├── contract/            # Move smart contracts
│   ├── sources/         # Move source files
│   │   └── health_tracker.move
│   ├── Move.toml        # Move package configuration
│   └── README.md        # Contract documentation
├── public/              # Static assets
└── package.json         # Node.js dependencies
```

## 🚀 Features

### Frontend Features
- **Modern React UI**: Built with Vite and React 19
- **Weight Tracking**: Add, edit, and remove weight entries
- **Data Visualization**: Interactive charts powered by Recharts
- **Time-based History**: View weight entries with timestamps
- **Demo Data**: Generate sample data for testing
- **Responsive Design**: Works on desktop and mobile

### Blockchain Features
- **Decentralized Storage**: Weight data stored on Aptos blockchain
- **Data Ownership**: Users fully own their health data
- **Privacy**: Data only accessible to the user
- **Timestamp Integrity**: Automatic blockchain timestamps
- **Gas Efficient**: Optimized Move smart contract

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **Recharts** - Data visualization library
- **Lucide React** - Icon library
- **date-fns** - Date manipulation utilities

### Blockchain
- **Aptos Blockchain** - Layer 1 blockchain for smart contracts
- **Move Language** - Safe and efficient smart contract language
- **Aptos TypeScript SDK** - Client library for Aptos interaction
- **Wallet Adapter** - Multi-wallet connection support

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🔗 Smart Contract Integration

### Contract Deployment

1. **Install Aptos CLI**
   ```bash
   # macOS
   brew install aptos
   
   # Or download from: https://github.com/aptos-labs/aptos-core/releases
   ```

2. **Initialize Aptos account**
   ```bash
   aptos init
   ```

3. **Compile and deploy contract**
   ```bash
   cd contract
   aptos move compile
   aptos move publish
   ```

4. **Update frontend with contract address**
   ```javascript
   // In your frontend code
   import { aptosService } from './frontend/services/aptosService.js';
   aptosService.setContractAddress('YOUR_CONTRACT_ADDRESS');
   ```

### Smart Contract Functions

The health tracker smart contract provides:

- **`initialize()`** - Set up health tracking for a user
- **`add_weight(weight_kg)`** - Add a weight entry with timestamp
- **`remove_weight(index)`** - Remove entry by index
- **`remove_latest_weight()`** - Remove most recent entry
- **`get_weight_entries(address)`** - View all entries (no gas)
- **`get_latest_weight(address)`** - View latest entry (no gas)

See `contract/README.md` for detailed API documentation.

## 🔧 Configuration

### Network Configuration

By default, the app connects to Aptos testnet. To change networks:

```javascript
// frontend/services/aptosService.js
const aptosConfig = new AptosConfig({ 
  network: Network.MAINNET  // or Network.DEVNET
});
```

### Wallet Integration

The app supports multiple Aptos wallets through the wallet adapter:
- Petra Wallet
- Martian Wallet  
- Fewcha Wallet
- And more...

## 🧪 Demo Data

The application includes demo data generation for testing:
- Generate realistic weight progression data
- Configurable date ranges and trends
- Perfect for development and demos

## 📱 Usage

### Basic Usage (Local Storage)
1. Open the application
2. Add weight entries using the input form
3. View progress in the dashboard chart
4. Edit history in the "History" tab

### Blockchain Usage (Coming Soon)
1. Connect your Aptos wallet
2. Initialize your health data on-chain
3. Add weight entries (requires small gas fee)
4. View your data from any device with your wallet

## 🏃‍♂️ Development

### Project Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Features
1. Frontend components go in `frontend/components/`
2. New pages go in `frontend/pages/`
3. Smart contract functions go in `contract/sources/`
4. Update services in `frontend/services/`

## 🔒 Privacy & Security

- **Data Ownership**: Your health data belongs to you
- **On-chain Storage**: Data stored on decentralized blockchain
- **Wallet Security**: Private keys never leave your device
- **View Functions**: Read data without gas fees

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (both frontend and contracts)
5. Submit a pull request

## 📜 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Check the contract documentation in `contract/README.md`
- Review the data service documentation in `frontend/services/README.md`
- Open an issue on GitHub

## 🗺️ Roadmap

- [x] React frontend with weight tracking
- [x] Data visualization and history
- [x] Local storage data service
- [x] Move smart contract development
- [x] Aptos service integration layer
- [ ] Wallet connection UI
- [ ] Smart contract deployment
- [ ] Blockchain data synchronization
- [ ] Multi-device data sync
- [ ] Enhanced privacy features
- [ ] Mobile app development

---

Built with ❤️ on the Aptos blockchain
