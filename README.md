# Health Tracker

A modern, responsive web application for tracking weight progress with interactive charts and data visualization.

## ✨ Features

### 📊 Weight Tracking
- **Add weight entries** with date
- **Set goal weight** as a one-time setting
- **Multiple entries per day** automatically averaged
- **Individual entry management** with granular deletion

### 📈 Data Visualization
- **Interactive charts** with 7, 30, and 90-day views
- **Responsive Y-axis** that scales to your data range
- **Daily averaging** for clean chart visualization
- **Detailed tooltips** showing entry information

### � Data Management
- **Demo data** with realistic 90-day weight loss journey
- **Data export** to JSON for backup and portability
- **Safe demo data removal** (preserves manual entries)
- **Complete data overview** with entry statistics

### �📱 Mobile-Friendly Design
- **Responsive layout** that works on all devices
- **Touch-friendly** buttons and form inputs
- **Optimized navigation** with collapsible sidebar
- **Clean, modern UI** with professional styling

### 🎯 Demo Data
- **90-day weight loss journey** demo data (195→170 lbs)
- **Realistic daily entries** with natural fluctuations
- **Safe demo management** - preserves your real data
- **Easy removal** when no longer needed

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/health-tracker.git
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

## 🛠️ Built With

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Recharts** - Chart library for data visualization
- **date-fns** - Date manipulation and formatting
- **Lucide React** - Modern icon library
- **CSS3** - Custom styling with responsive design

## 📊 Usage

### Adding Weight Entries
1. Use the **Dashboard** tab
2. Enter your weight and date
3. Click **Add Weight**

### Viewing Progress
- **Dashboard** shows weight logging form and progress chart
- **Edit** tab shows recent entries, stats, and goal weight settings
- **Demo Data** tab for managing demo data and exporting information
- Toggle between **7, 30, and 90-day** chart views on Dashboard

### Managing Data
- **Edit tab** for managing entries and goal weight settings
- **Demo Data tab** for demo data management and data export
- **Show All** / **Show Daily Avg** toggle in Recent Entries
- **Delete individual entries** in "Show All" mode
- **Set goal weight** in Edit tab settings
- **Load demo data** to see how the app works
- **Clear demo data** safely (preserves manual entries)
- **Export all data** as JSON for backup

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI components
│   └── DemoDataControls.jsx  # Demo data management
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # Weight logging and progress chart
│   ├── EditTab.jsx     # Entry management and settings
│   └── DemoDataTab.jsx # Demo data management and export
├── utils/              # Utility functions
│   ├── dataProcessing.js   # Data averaging and processing
│   └── generateFakeData.js # Demo data generation
└── styles/             # CSS styling
    └── App.css         # Main application styles
```

## 🎯 Data Management

### Local Storage
- All data stored in browser's localStorage
- Automatic saving and loading
- No external dependencies required

### Data Processing
- **Daily averaging** for multiple entries per day
- **Timestamp preservation** for all entries
- **Smart sorting** by date and time
- **Safe deletion** with individual entry control

## 🧹 Removing Demo Data

When ready to use only your real data:

1. **Safe removal**: Use "Clear Demo Data Only" button
2. **Complete removal**: Delete demo-related files (see `DEMO_DATA_REMOVAL.md`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎉 Acknowledgments

- Built with modern React best practices
- Responsive design principles
- Clean, maintainable code structure
- User-focused feature development
