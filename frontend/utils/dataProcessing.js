// ============================================================================
// DATA PROCESSING UTILITIES
// ============================================================================
// Functions for processing weight data, including handling multiple entries per day
// ============================================================================

import { format, subDays } from 'date-fns'
import { DATE_FORMATS } from './constants'

/**
 * Groups weight entries by date and averages multiple entries per day
 * @param {Array} weights - Array of weight entries
 * @returns {Array} - Array with one entry per day (averaged if multiple)
 */
export const averageWeightsByDay = (weights) => {
  if (!weights || weights.length === 0) return []

  // Group entries by date (convert timestamp to YYYY-MM-DD)
  const groupedByDate = weights.reduce((groups, entry) => {
    const date = format(new Date(entry.timestamp), DATE_FORMATS.ISO)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {})

  // Average weights for each date
  const averagedWeights = Object.entries(groupedByDate).map(([date, entries]) => {
    if (entries.length === 1) {
      // Single entry for this date
      return entries[0]
    }

    // Multiple entries - calculate average
    const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0)
    const averageWeight = totalWeight / entries.length

    // Use the latest entry as the base, but with averaged weight
    const latestEntry = entries.reduce((latest, entry) =>
      new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest
    )

    return {
      ...latestEntry,
      weight: Math.round(averageWeight * 10) / 10, // Round to 1 decimal
      isAveraged: entries.length > 1, // Flag to indicate this is an average
      originalEntries: entries.length // Track how many entries were averaged
    }
  })

  // Sort by timestamp
  return averagedWeights.sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Prepares chart data - shows only actual data points
 * @param {Array} weights - Raw weight entries
 * @param {number} days - Number of recent days to include
 * @param {string} dateFormat - Format for chart labels
 * @returns {Array} - Chart-ready data with only real entries
 */
export const prepareChartData = (weights, days, dateFormat = 'MMM dd') => {
  const averagedWeights = averageWeightsByDay(weights)

  if (averagedWeights.length === 0) return []

  // Get the date range
  const endDate = new Date()
  const startDate = subDays(endDate, days - 1)

  // Filter weights within the date range and format for chart
  const chartData = averagedWeights
    .filter(w => {
      const entryDate = new Date(w.timestamp)
      return entryDate >= startDate && entryDate <= endDate
    })
    .map(w => ({
      date: format(new Date(w.timestamp), dateFormat),
      weight: w.weight,
      isAveraged: w.isAveraged || false,
      originalEntries: w.originalEntries || 1
    }))

  return chartData
}



/**
 * Gets the most recent weight (averaged if multiple entries on the same day)
 * @param {Array} weights - Array of weight entries
 * @returns {Object} - Latest weight entry (averaged if needed)
 */
export const getLatestWeight = (weights) => {
  if (!weights || weights.length === 0) return null
  
  const averagedWeights = averageWeightsByDay(weights)
  return averagedWeights[averagedWeights.length - 1]
}

/**
 * Calculates weight change between two periods
 * @param {Array} weights - Array of weight entries
 * @returns {Object} - Current weight, start weight, and change
 */
export const calculateWeightChange = (weights) => {
  if (!weights || weights.length === 0) {
    return { current: 0, start: 0, change: 0 }
  }

  const averagedWeights = averageWeightsByDay(weights)
  const current = averagedWeights[averagedWeights.length - 1]?.weight || 0
  const start = averagedWeights[0]?.weight || 0
  
  return {
    current,
    start,
    change: current - start
  }
}


