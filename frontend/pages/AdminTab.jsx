import { useState, useEffect } from 'react'
import { Database, Trash2, Download, Upload } from 'lucide-react'
import { dataService } from '../services/dataService'
import { createBackup, restoreBackup } from '../services/backupService'
import { MESSAGES, APP_VERSION } from '../utils/constants'

const AdminTab = () => {
  const [testDataExists, setTestDataExists] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkTestData()
  }, [])

  const checkTestData = async () => {
    setTestDataExists(await dataService.hasDemoData())
  }

  const handleAddTestData = async () => {
    setIsLoading(true)
    const result = await dataService.loadDemoData()
    
    if (result.success) {
      alert(MESSAGES.SUCCESS_DEMO_ADDED)
      await checkTestData()
    } else {
      alert(MESSAGES.WARNING_DEMO_EXISTS)
    }
    setIsLoading(false)
  }

  const handleRemoveTestData = async () => {
    if (!window.confirm(MESSAGES.CONFIRM_REMOVE_DEMO)) {
      return
    }

    setIsLoading(true)
    const result = await dataService.clearDemoData()
    
    if (result.success) {
      alert(MESSAGES.SUCCESS_DEMO_REMOVED(result.manualEntriesPreserved))
      await checkTestData()
    } else {
      alert('❌ Error removing test data.')
    }
    setIsLoading(false)
  }

  const handleBackup = async () => {
    const result = await createBackup()
    if (result.message) {
      alert(result.message)
    }
  }

  const handleRestore = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    const result = await restoreBackup(file)
    
    if (result.success) {
      const exportDate = result.exportDate ? new Date(result.exportDate).toLocaleDateString() : 'unknown date'
      if (window.confirm(MESSAGES.CONFIRM_RESTORE(exportDate, result.entryCount))) {
        alert(result.message)
        await checkTestData()
      }
    } else {
      alert(result.message)
    }
    
    setIsLoading(false)
    event.target.value = ''
  }

  return (
    <div>
      <div className="page-header" style={{ position: 'relative' }}>
        <h1 className="page-title">Settings</h1>
        <div style={{ 
          position: 'absolute', 
          top: '0', 
          right: '0', 
          fontSize: '0.75rem', 
          color: '#9ca3af',
          fontFamily: 'monospace'
        }}>
          v{APP_VERSION}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {/* Add Test Data */}
        <button
          onClick={handleAddTestData}
          disabled={isLoading || testDataExists}
          className="settings-list-button"
        >
          <Database size={20} color="#3b82f6" />
          <span>{testDataExists ? 'Test Data Loaded' : 'Add Test Data'}</span>
        </button>

        {/* Remove Test Data */}
        <button
          onClick={handleRemoveTestData}
          disabled={isLoading || !testDataExists}
          className="settings-list-button"
        >
          <Trash2 size={20} color="#ef4444" />
          <span>Remove Test Data</span>
        </button>

        {/* Backup */}
        <button
          onClick={handleBackup}
          disabled={isLoading}
          className="settings-list-button"
        >
          <Download size={20} color="#10b981" />
          <span>Backup</span>
        </button>

        {/* Restore */}
        <label className="settings-list-button" style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}>
          <Upload size={20} color="#8b5cf6" />
          <span>Restore</span>
          <input
            type="file"
            accept=".json"
            onChange={handleRestore}
            disabled={isLoading}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  )
}

export default AdminTab
