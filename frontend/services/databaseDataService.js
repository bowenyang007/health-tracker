// ============================================================================
// DATABASE DATA SERVICE IMPLEMENTATION
// ============================================================================
// Example implementation showing how to swap localStorage for a database
// This demonstrates the power of the abstraction layer
// ============================================================================

import { DataService } from './dataService'

/**
 * Database implementation of the data service
 * This example shows how you could implement database storage
 */
export class DatabaseDataService extends DataService {
  constructor(databaseConfig) {
    super()
    this.storageType = 'database'
    this.config = databaseConfig
    this.db = null // Would be your database connection
  }

  /**
   * Initialize database connection
   */
  async initialize() {
    // Example: Initialize your database connection
    // this.db = await connectToDatabase(this.config)
    console.log('Database connection initialized')
  }

  /**
   * Load all weight entries from database
   * @returns {Promise<Array>} Array of weight entries
   */
  async loadWeights() {
    try {
      // Example database query:
      // const result = await this.db.query('SELECT * FROM weight_entries ORDER BY timestamp')
      // return result.rows.map(row => ({
      //   id: row.id,
      //   weight: parseFloat(row.weight),
      //   date: row.date,
      //   timestamp: row.timestamp,
      //   isDemoData: row.is_demo_data
      // }))
      
      // For now, fall back to localStorage for demo purposes
      return super.loadWeights()
    } catch (error) {
      console.error('Database error loading weights:', error)
      throw error
    }
  }

  /**
   * Save weight entries to database
   * @param {Array} weights - Array of weight entries to save
   * @returns {Promise<boolean>} Success status
   */
  async saveWeights(weights) {
    try {
      // Example database operations:
      // await this.db.query('DELETE FROM weight_entries')
      // for (const weight of weights) {
      //   await this.db.query(
      //     'INSERT INTO weight_entries (id, weight, date, timestamp, is_demo_data) VALUES (?, ?, ?, ?, ?)',
      //     [weight.id, weight.weight, weight.date, weight.timestamp, weight.isDemoData || false]
      //   )
      // }
      
      // For now, fall back to localStorage for demo purposes
      return super.saveWeights(weights)
    } catch (error) {
      console.error('Database error saving weights:', error)
      throw error
    }
  }

  /**
   * Add a single weight entry to database
   * @param {Object} weightEntry - Weight entry to add
   * @returns {Promise<Array>} Updated array of all weight entries
   */
  async addWeight(weightEntry) {
    try {
      // Example database insert:
      // await this.db.query(
      //   'INSERT INTO weight_entries (id, weight, date, timestamp, is_demo_data) VALUES (?, ?, ?, ?, ?)',
      //   [weightEntry.id, weightEntry.weight, weightEntry.date, weightEntry.timestamp, weightEntry.isDemoData || false]
      // )
      // return await this.loadWeights()
      
      // For now, fall back to localStorage for demo purposes
      return super.addWeight(weightEntry)
    } catch (error) {
      console.error('Database error adding weight:', error)
      throw error
    }
  }

  /**
   * Delete a weight entry from database
   * @param {number} id - ID of weight entry to delete
   * @returns {Promise<Array>} Updated array of all weight entries
   */
  async deleteWeight(id) {
    try {
      // Example database delete:
      // await this.db.query('DELETE FROM weight_entries WHERE id = ?', [id])
      // return await this.loadWeights()
      
      // For now, fall back to localStorage for demo purposes
      return super.deleteWeight(id)
    } catch (error) {
      console.error('Database error deleting weight:', error)
      throw error
    }
  }

  /**
   * Load goal weight from database
   * @returns {Promise<string>} Goal weight value
   */
  async loadGoal() {
    try {
      // Example database query:
      // const result = await this.db.query('SELECT goal_weight FROM user_settings WHERE user_id = ?', [this.userId])
      // return result.rows[0]?.goal_weight || ''
      
      // For now, fall back to localStorage for demo purposes
      return super.loadGoal()
    } catch (error) {
      console.error('Database error loading goal:', error)
      throw error
    }
  }

  /**
   * Save goal weight to database
   * @param {string} goal - Goal weight value to save
   * @returns {Promise<boolean>} Success status
   */
  async saveGoal(goal) {
    try {
      // Example database upsert:
      // await this.db.query(
      //   'INSERT INTO user_settings (user_id, goal_weight) VALUES (?, ?) ON CONFLICT (user_id) DO UPDATE SET goal_weight = ?',
      //   [this.userId, goal, goal]
      // )
      
      // For now, fall back to localStorage for demo purposes
      return super.saveGoal(goal)
    } catch (error) {
      console.error('Database error saving goal:', error)
      throw error
    }
  }
}

// Example usage:
// const databaseService = new DatabaseDataService({
//   host: 'localhost',
//   port: 5432,
//   database: 'health_tracker',
//   user: 'your_user',
//   password: 'your_password'
// })
// await databaseService.initialize()
// 
// // Then in your main app:
// import { databaseService as dataService } from './services/databaseDataService' 