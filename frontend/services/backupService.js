// ============================================================================
// BACKUP SERVICE
// ============================================================================
// Service for handling data backup and restore operations
// Separates business logic from UI components
// ============================================================================

import { dataService } from './dataService'
import { MESSAGES } from '../utils/constants'

/**
 * Creates and downloads a backup of all health tracking data
 * @returns {Promise<Object>} Result with success status
 */
export const createBackup = async () => {
  try {
    const weights = await dataService.loadWeights()
    const goal = await dataService.loadGoal()
    
    if (weights.length === 0) {
      return {
        success: false,
        message: 'No data to backup'
      }
    }

    const backup = {
      weights,
      goal,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const json = JSON.stringify(backup, null, 2)
    
    // Check if File System Access API is supported
    if ('showSaveFilePicker' in window) {
      try {
        const filename = `health-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
        
        // Show save file dialog
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'JSON Backup File',
            accept: { 'application/json': ['.json'] }
          }]
        })
        
        // Write the file
        const writable = await handle.createWritable()
        await writable.write(json)
        await writable.close()
        
        return {
          success: true,
          message: MESSAGES.SUCCESS_BACKUP
        }
      } catch (err) {
        // User cancelled the dialog
        if (err.name === 'AbortError') {
          return { success: false, message: null } // Don't show error for cancel
        }
        throw err
      }
    }
    
    // Fallback for browsers that don't support File System Access API
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const filename = `health-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
    
    return {
      success: true,
      message: MESSAGES.SUCCESS_BACKUP
    }
  } catch (error) {
    console.error('Error creating backup:', error)
    return {
      success: false,
      message: MESSAGES.ERROR_BACKUP
    }
  }
}

/**
 * Restores data from a backup file
 * @param {File} file - The backup file to restore from
 * @returns {Promise<Object>} Result with success status and entry count
 */
export const restoreBackup = (file) => {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ success: false, message: 'No file provided' })
      return
    }

    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result)
        
        if (!backup.weights || !Array.isArray(backup.weights)) {
          throw new Error('Invalid backup file format')
        }

        await dataService.saveWeights(backup.weights)
        
        if (backup.goal) {
          await dataService.saveGoal(backup.goal)
        }

        resolve({
          success: true,
          message: MESSAGES.SUCCESS_RESTORE(backup.weights.length),
          entryCount: backup.weights.length,
          exportDate: backup.exportDate
        })
      } catch (error) {
        console.error('Error restoring backup:', error)
        resolve({
          success: false,
          message: MESSAGES.ERROR_RESTORE
        })
      }
    }

    reader.onerror = () => {
      resolve({
        success: false,
        message: '❌ Error reading backup file.'
      })
    }

    reader.readAsText(file)
  })
}

