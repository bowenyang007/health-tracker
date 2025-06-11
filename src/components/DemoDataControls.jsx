// ============================================================================
// DEMO DATA CONTROLS COMPONENT
// ============================================================================
// This component provides UI controls for loading/clearing demo data.
// Delete this entire file when you no longer need demo functionality.
// ============================================================================

import { Database, Trash2, AlertTriangle } from 'lucide-react'
import { loadFakeData, clearFakeData, clearAllData, hasDemoData } from '../utils/generateFakeData'
import { useState, useEffect } from 'react'

const DemoDataControls = ({ onDataChange, showAsCard = false, showAdvanced = false }) => {
  const [demoExists, setDemoExists] = useState(false)

  useEffect(() => {
    setDemoExists(hasDemoData())
  }, [])

  const handleLoadDemo = () => {
    const result = loadFakeData()
    setDemoExists(hasDemoData())
    if (onDataChange) onDataChange()

    // Show message if demo data already existed
    if (result.weightData.filter(w => w.isDemoData).length === 0) {
      alert('ℹ️ Demo data already exists. Use "Clear Demo Data" first if you want to reload.')
    }
  }

  const handleClearDemo = () => {
    clearFakeData()
    setDemoExists(hasDemoData())
    if (onDataChange) onDataChange()
  }

  const handleClearAll = () => {
    if (window.confirm('⚠️ This will delete ALL your data (demo + manual entries). Are you sure?')) {
      clearAllData()
      setDemoExists(false)
      if (onDataChange) onDataChange()
    }
  }

  const controls = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button
        className="btn btn-primary"
        onClick={handleLoadDemo}
      >
        <Database size={16} />
        {demoExists ? 'Demo Data Already Loaded' : 'Load Demo Data (90 days daily)'}
      </button>

      {demoExists && (
        <button
          className="btn btn-secondary"
          onClick={handleClearDemo}
          style={{ fontSize: '0.875rem' }}
        >
          <Trash2 size={16} />
          Clear Demo Data Only
        </button>
      )}

      {showAdvanced && (
        <button
          className="btn btn-secondary"
          onClick={handleClearAll}
          style={{
            fontSize: '0.875rem',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            borderColor: '#fecaca'
          }}
        >
          <AlertTriangle size={16} />
          Clear ALL Data (Demo + Manual)
        </button>
      )}

      <div style={{
        fontSize: '0.75rem',
        color: '#64748b',
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        {demoExists ? (
          <p style={{ margin: 0, fontSize: '0.7rem' }}>
            ✅ Demo data loaded (~70 daily entries). Your manual entries are preserved.
          </p>
        ) : (
          <>
            <p style={{ margin: '0 0 0.5rem 0', fontStyle: 'italic' }}>
              Demo: 90-day daily weight tracking (195→170 lbs)
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem' }}>
              Safe: Won't overwrite your existing data
            </p>
          </>
        )}
      </div>
    </div>
  )

  if (showAsCard) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h3>No data yet</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Load demo data to see how the tracker works, or go to Weight Tracker to add your first entry.
        </p>
        {controls}
      </div>
    )
  }

  return controls
}

export default DemoDataControls

// ============================================================================
// END OF DEMO DATA CONTROLS
// ============================================================================
