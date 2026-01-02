// ============================================================================
// DATA SERVICE
// ============================================================================
// Abstraction layer for data persistence operations
// Can be easily swapped from localStorage to database implementation
// Includes demo data generation and management
// ============================================================================

import { format, subDays } from 'date-fns'
import { STORAGE_KEYS, DEMO_DATA_CONFIG, DATE_FORMATS } from '../utils/constants'

/**
 * Data service interface for weight tracking data
 * This abstraction allows easy swapping between localStorage and database
 */
class DataService {
  constructor() {
    // Future: This could be configured to use different storage backends
    this.storageType = 'localStorage' // Could be 'database', 'api', etc.
  }

  /**
   * Load all weight entries
   * @returns {Promise<Array>} Array of weight entries
   */
  async loadWeights() {
    try {
      if (this.storageType === 'localStorage') {
        const data = localStorage.getItem(STORAGE_KEYS.WEIGHTS)
        return JSON.parse(data || '[]')
      }
      // Future database implementation would go here
      // return await this.databaseClient.getWeights()
    } catch (error) {
      console.error('Error loading weights:', error)
      return []
    }
  }

  /**
   * Save weight entries
   * @param {Array} weights - Array of weight entries to save
   * @returns {Promise<boolean>} Success status
   */
  async saveWeights(weights) {
    try {
      if (this.storageType === 'localStorage') {
        localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights))
        return true
      }
      // Future database implementation would go here
      // return await this.databaseClient.saveWeights(weights)
    } catch (error) {
      console.error('Error saving weights:', error)
      return false
    }
  }

  /**
   * Add a single weight entry
   * @param {Object} weightEntry - Weight entry to add
   * @returns {Promise<Array>} Updated array of all weight entries
   */
  async addWeight(weightEntry) {
    try {
      const currentWeights = await this.loadWeights()
      const updatedWeights = [...currentWeights, weightEntry].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      )
      await this.saveWeights(updatedWeights)
      return updatedWeights
    } catch (error) {
      console.error('Error adding weight:', error)
      throw error
    }
  }

  /**
   * Delete a weight entry by ID
   * @param {number} id - ID of weight entry to delete
   * @returns {Promise<Array>} Updated array of all weight entries
   */
  async deleteWeight(id) {
    try {
      const currentWeights = await this.loadWeights()
      const updatedWeights = currentWeights.filter(weight => weight.id !== id)
      await this.saveWeights(updatedWeights)
      return updatedWeights
    } catch (error) {
      console.error('Error deleting weight:', error)
      throw error
    }
  }

  /**
   * Load goal weight
   * @returns {Promise<string>} Goal weight value
   */
  async loadGoal() {
    try {
      if (this.storageType === 'localStorage') {
        return localStorage.getItem(STORAGE_KEYS.GOAL) || ''
      }
      // Future database implementation would go here
      // return await this.databaseClient.getGoal()
    } catch (error) {
      console.error('Error loading goal:', error)
      return ''
    }
  }

  /**
   * Save goal weight
   * @param {string} goal - Goal weight value to save
   * @returns {Promise<boolean>} Success status
   */
  async saveGoal(goal) {
    try {
      if (this.storageType === 'localStorage') {
        localStorage.setItem(STORAGE_KEYS.GOAL, goal)
        return true
      }
      // Future database implementation would go here
      // return await this.databaseClient.saveGoal(goal)
    } catch (error) {
      console.error('Error saving goal:', error)
      return false
    }
  }

  /**
   * Clear all data (demo + manual) - Nuclear option!
   * @returns {Promise<Object>} Result with success status
   */
  async clearAllData() {
    try {
      console.log('💥 CLEARING ALL DATA (demo + manual)...')
      
      if (this.storageType === 'localStorage') {
        localStorage.removeItem(STORAGE_KEYS.WEIGHTS)
        localStorage.removeItem(STORAGE_KEYS.GOAL)
        localStorage.removeItem(STORAGE_KEYS.IS_DEMO_GOAL)
      }
      // Future database implementation would go here
      // await this.databaseClient.clearAllData()
      
      console.log('✅ All data cleared')
      
      return {
        success: true,
        message: 'All data cleared successfully'
      }
    } catch (error) {
      console.error('Error clearing data:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * Configure the storage backend
   * @param {string} type - Storage type ('localStorage', 'database', etc.)
   * @param {Object} config - Configuration options for the storage backend
   */
  configure(type, config = {}) {
    this.storageType = type
    this.config = config
    // Future: Initialize database connections, API clients, etc.
  }

  /**
   * Generate realistic weight loss demo data
   * @returns {Array} Array of demo weight entries
   */
  generateWeightLossData() {
    console.log('🎯 Generating 90-day daily weight loss demo data...')

    const data = []
    const { START_WEIGHT, END_WEIGHT, TOTAL_DAYS, SKIP_PROBABILITY, MORNING_PROBABILITY, DAILY_FLUCTUATION, WEEKEND_EFFECT } = DEMO_DATA_CONFIG
    const totalWeightLoss = START_WEIGHT - END_WEIGHT // 25 lbs

    // Create realistic daily weight loss with fluctuations
    for (let day = 0; day <= TOTAL_DAYS; day++) {
      const date = format(subDays(new Date(), TOTAL_DAYS - day), DATE_FORMATS.ISO)

      // Base weight loss progression (not linear, faster at start)
      const progressRatio = day / TOTAL_DAYS
      const baseWeight = START_WEIGHT - (totalWeightLoss * Math.pow(progressRatio, 0.7))

      // Add realistic daily fluctuations
      const fluctuation = (Math.random() - 0.5) * DAILY_FLUCTUATION // ±1.25 lbs daily variation

      // Add weekly patterns (slightly higher on weekends)
      const dayOfWeek = (TOTAL_DAYS - day) % 7
      const weekendEffect = (dayOfWeek === 0 || dayOfWeek === 6) ? WEEKEND_EFFECT : 0

      // Add some plateaus and whooshes (common in weight loss)
      let plateauEffect = 0
      if (day >= 20 && day <= 30) plateauEffect = 1.5 // plateau around day 20-30
      if (day >= 50 && day <= 55) plateauEffect = 1.0 // smaller plateau
      if (day === 31) plateauEffect = -1.5 // whoosh after plateau
      if (day === 56) plateauEffect = -1.0 // whoosh after plateau

      // Add some random good/bad days
      if (Math.random() < 0.1) plateauEffect += (Math.random() - 0.5) * 1.5

      const finalWeight = Math.round((baseWeight + fluctuation + weekendEffect + plateauEffect) * 10) / 10

      // Skip some days randomly to make it more realistic (people don't weigh daily)
      const shouldInclude = day === 0 || day === TOTAL_DAYS || Math.random() > SKIP_PROBABILITY

      if (shouldInclude) {
        // Generate realistic weigh-in times (mostly morning, some evening)
        const isMorning = Math.random() > (1 - MORNING_PROBABILITY)
        const hour = isMorning
          ? Math.floor(Math.random() * 3) + 6  // 6-8 AM
          : Math.floor(Math.random() * 3) + 19 // 7-9 PM
        const minute = Math.floor(Math.random() * 60)
        const second = Math.floor(Math.random() * 60)

        // Create date object and get Unix timestamp
        const dateObj = subDays(new Date(), TOTAL_DAYS - day)
        dateObj.setHours(hour, minute, second, 0)
        const timestamp = dateObj.getTime()

        data.push({
          id: timestamp + Math.floor(Math.random() * 1000), // Ensure unique IDs
          weight: Math.max(finalWeight, END_WEIGHT - 2), // Don't go below target
          timestamp: timestamp,
          isDemoData: true // Mark as demo data
        })
      }
    }

    const sortedData = data.sort((a, b) => a.timestamp - b.timestamp)
    console.log(`✅ Generated ${sortedData.length} weight entries (${sortedData[0].weight} → ${sortedData[sortedData.length - 1].weight} lbs)`)
    return sortedData
  }

  /**
   * Check if demo data exists
   * @returns {Promise<boolean>} Whether demo data exists
   */
  async hasDemoData() {
    try {
      const weights = await this.loadWeights()
      return weights.some(entry => entry.isDemoData)
    } catch (error) {
      console.error('Error checking demo data:', error)
      return false
    }
  }

  /**
   * Load demo data and merge with existing data
   * @param {boolean} generateNew - Whether to generate new demo data or use provided data
   * @param {Array} customDemoWeights - Optional custom demo weight entries
   * @param {string} customDemoGoal - Optional custom demo goal weight
   * @returns {Promise<Object>} Result with success status and data summary
   */
  async loadDemoData(generateNew = true, customDemoWeights = null, customDemoGoal = null) {
    try {
      console.log('📊 Loading demo data into app...')

      // Check if demo data already exists
      if (await this.hasDemoData()) {
        console.log('⚠️ Demo data already exists. Use "Clear Demo Data" first if you want to reload.')
        const weights = await this.loadWeights()
        const goal = await this.loadGoal()
        return {
          success: false,
          message: 'Demo data already exists',
          weightData: weights,
          goalWeight: parseFloat(goal || '0')
        }
      }

      // Get existing data first
      const existingWeights = await this.loadWeights()
      const existingGoal = await this.loadGoal()
      const hasExistingGoal = existingGoal !== ''

      console.log(`📋 Found ${existingWeights.length} existing weight entries`)

      // Generate or use provided demo data
      const demoWeights = generateNew ? this.generateWeightLossData() : customDemoWeights
      const demoGoal = customDemoGoal || DEMO_DATA_CONFIG.DEFAULT_GOAL

      if (!demoWeights || demoWeights.length === 0) {
        throw new Error('No demo data to load')
      }

      // Merge existing data with demo data, sort by date
      const allWeights = [...existingWeights, ...demoWeights].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      )
      
      await this.saveWeights(allWeights)
      
      // Only set goal if user doesn't have one already
      if (!hasExistingGoal && demoGoal) {
        await this.saveGoal(demoGoal)
        // Mark that goal is from demo data
        if (this.storageType === 'localStorage') {
          localStorage.setItem(STORAGE_KEYS.IS_DEMO_GOAL, 'true')
        }
        console.log(`🎯 Demo goal set to: ${demoGoal} lbs`)
      } else if (hasExistingGoal) {
        console.log(`🎯 Keeping your existing goal: ${existingGoal} lbs`)
      }

      console.log(`💾 Demo data merged: ${existingWeights.length} existing + ${demoWeights.length} demo = ${allWeights.length} total entries`)
      
      return {
        success: true,
        message: 'Demo data loaded successfully',
        weightData: allWeights,
        goalWeight: hasExistingGoal ? parseFloat(existingGoal) : parseFloat(demoGoal)
      }
    } catch (error) {
      console.error('Error loading demo data:', error)
      return {
        success: false,
        message: error.message,
        weightData: [],
        goalWeight: 0
      }
    }
  }

  /**
   * Clear only demo data, keeping manual entries
   * @returns {Promise<Object>} Result with success status and summary
   */
  async clearDemoData() {
    try {
      console.log('🗑️ Clearing demo data (preserving manual entries)...')

      const existingWeights = await this.loadWeights()
      const manualWeights = existingWeights.filter(entry => !entry.isDemoData)
      const demoCount = existingWeights.length - manualWeights.length
      
      await this.saveWeights(manualWeights)
      
      // Clear demo goal if it exists
      let goalCleared = false
      if (this.storageType === 'localStorage') {
        const isDemoGoal = localStorage.getItem(STORAGE_KEYS.IS_DEMO_GOAL) === 'true'
        if (isDemoGoal) {
          localStorage.removeItem(STORAGE_KEYS.GOAL)
          localStorage.removeItem(STORAGE_KEYS.IS_DEMO_GOAL)
          goalCleared = true
          console.log('🎯 Demo goal cleared')
        }
      }
      
      console.log(`✅ Demo data cleared. Preserved ${manualWeights.length} manual entries, removed ${demoCount} demo entries.`)
      
      return {
        success: true,
        message: 'Demo data cleared successfully',
        manualEntriesPreserved: manualWeights.length,
        demoEntriesRemoved: demoCount,
        goalCleared
      }
    } catch (error) {
      console.error('Error clearing demo data:', error)
      return {
        success: false,
        message: error.message,
        manualEntriesPreserved: 0,
        demoEntriesRemoved: 0,
        goalCleared: false
      }
    }
  }
}

// Export singleton instance
export const dataService = new DataService()

// Export class for testing or custom instances
export { DataService } 