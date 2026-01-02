import { useState } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard.jsx'
import EditTab from './pages/EditTab.jsx'
import AdminTab from './pages/AdminTab.jsx'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="app">
      <main className="main-content-full">
        <div className="tab-container">
          <div className="tab-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button
                className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>
          </div>

          <div className="tab-content">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'details' && <EditTab />}
            {activeTab === 'settings' && <AdminTab />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
