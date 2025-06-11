import { useState } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import WeightTracker from './pages/WeightTracker'
import Navigation from './components/Navigation'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'weight':
        return <WeightTracker />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
