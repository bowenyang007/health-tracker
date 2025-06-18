import { useState } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import EditTab from './pages/EditTab'
import DemoDataTab from './pages/DemoDataTab'
import { WalletConnection } from './components/WalletConnection'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Health Tracker DApp</h1>
        <WalletConnection />
      </header>
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

          <div className="tab-content">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'edit' && <EditTab />}
            {activeTab === 'demo' && <DemoDataTab />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
