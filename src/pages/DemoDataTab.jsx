import { useState, useEffect } from 'react'
import { Database, Download, Trash2, AlertTriangle } from 'lucide-react'
import DemoDataControls from '../components/DemoDataControls'
import { hasDemoData, clearAllData } from '../utils/generateFakeData'

const DemoDataTab = () => {
  const [weights, setWeights] = useState([])
  const [goal, setGoal] = useState('')
  const [demoExists, setDemoExists] = useState(false)

  // Load data from localStorage
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const savedWeights = JSON.parse(localStorage.getItem('healthTracker_weight') || '[]')
    const savedGoal = localStorage.getItem('healthTracker_weightGoal') || ''
    setWeights(savedWeights)
    setGoal(savedGoal)
    setDemoExists(hasDemoData())
  }

  const handleDataChange = () => {
    // Reload data when demo data changes
    loadData()
  }

  const handleClearAll = () => {
    if (window.confirm('⚠️ This will delete ALL data (including your manual entries). Are you sure?')) {
      clearAllData()
      loadData()
    }
  }

  const exportData = () => {
    const data = {
      weights: weights,
      goal: goal,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `health-tracker-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const manualEntries = weights.filter(entry => !entry.isDemoData)
  const demoEntries = weights.filter(entry => entry.isDemoData)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Demo Data</h1>
        <p className="page-subtitle">Manage demo data and export your information</p>
      </div>

      {/* Data Overview */}
      <div className="grid grid-3">
        <div className="card stat-card">
          <div className="stat-value">{weights.length}</div>
          <div className="stat-label">Total Entries</div>
        </div>

        <div className="card stat-card">
          <div className="stat-value">{manualEntries.length}</div>
          <div className="stat-label">Manual Entries</div>
        </div>

        <div className="card stat-card">
          <div className="stat-value">{demoEntries.length}</div>
          <div className="stat-label">Demo Entries</div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Demo Data Controls */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Database size={20} style={{ marginRight: '0.5rem' }} />
              Demo Data Management
            </h3>
          </div>
          <DemoDataControls onDataChange={handleDataChange} showAdvanced={true} />
          
          {demoExists && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              backgroundColor: '#f0f9ff', 
              border: '1px solid #0ea5e9',
              borderRadius: '8px'
            }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#0369a1' }}>
                <strong>Demo data is currently loaded.</strong> This includes ~70 daily weight entries 
                showing a realistic weight loss journey from 195 to 170 lbs over 90 days.
              </p>
            </div>
          )}
        </div>

        {/* Data Export */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Download size={20} style={{ marginRight: '0.5rem' }} />
              Export Data
            </h3>
          </div>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Download your weight tracking data as a JSON file for backup or transfer to another device.
          </p>
          <button 
            onClick={exportData}
            className="btn btn-primary"
            disabled={weights.length === 0}
            style={{ width: '100%' }}
          >
            <Download size={16} />
            Export All Data
          </button>
          {weights.length === 0 && (
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'center' }}>
              No data to export
            </p>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ borderColor: '#ef4444', borderWidth: '2px' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color: '#ef4444' }}>
            <AlertTriangle size={20} style={{ marginRight: '0.5rem' }} />
            Danger Zone
          </h3>
        </div>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          <strong>Warning:</strong> This action will permanently delete ALL your data, including both 
          manual entries and demo data. This cannot be undone.
        </p>
        <button 
          onClick={handleClearAll}
          className="btn btn-danger"
          disabled={weights.length === 0}
        >
          <Trash2 size={16} />
          Delete All Data
        </button>
        {weights.length === 0 && (
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            No data to delete
          </p>
        )}
      </div>

      {/* Data Details */}
      {weights.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Data Summary</h3>
          </div>
          <div className="grid grid-2">
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Manual Entries</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                {manualEntries.length > 0 
                  ? `${manualEntries.length} entries you've added manually`
                  : 'No manual entries yet'
                }
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Demo Entries</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                {demoEntries.length > 0 
                  ? `${demoEntries.length} demo entries for testing`
                  : 'No demo data loaded'
                }
              </p>
            </div>
          </div>
          
          {goal && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Goal Weight</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Current goal: <strong>{goal} lbs</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DemoDataTab
