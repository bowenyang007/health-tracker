import { useState } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import EditTab from './pages/EditTab'
import DemoDataTab from './pages/DemoDataTab'
import WalletProvider from './components/WalletProvider'
import WalletConnect from './components/WalletSelector'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <WalletProvider>
      <div className="app">
        <main className="main-content-full">
          <div className="tab-container">
            <div className="tab-nav">
              <button
                className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`}
                onClick={() => setActiveTab('edit')}
              >
                Edit
              </button>
              <button
                className={`tab-button ${activeTab === 'demo' ? 'active' : ''}`}
                onClick={() => setActiveTab('demo')}
              >
                Demo Data
              </button>
            </div>

            <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
              <WalletConnect />
            </div>

            <div className="tab-content">
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'edit' && <EditTab />}
              {activeTab === 'demo' && <DemoDataTab />}
            </div>
          </div>
        </main>
      </div>
    </WalletProvider>
  )
}

export default App
