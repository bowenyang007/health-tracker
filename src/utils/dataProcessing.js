// ============================================================================
// DATA PROCESSING UTILITIES
// ============================================================================
// Functions for processing weight data, including handling multiple entries per day
// ============================================================================

/**
 * Groups weight entries by date and averages multiple entries per day
 * @param {Array} weights - Array of weight entries
 * @returns {Array} - Array with one entry per day (averaged if multiple)
 */
export const averageWeightsByDay = (weights) => {
  if (!weights || weights.length === 0) return []

  // Group entries by date
  const groupedByDate = weights.reduce((groups, entry) => {
    const date = entry.date
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

    // Create a list of times for display
    const times = entries.map(entry => entry.time || format(new Date(entry.timestamp), 'HH:mm')).sort()

    return {
      ...latestEntry,
      weight: Math.round(averageWeight * 10) / 10, // Round to 1 decimal
      isAveraged: entries.length > 1, // Flag to indicate this is an average
      originalEntries: entries.length, // Track how many entries were averaged
      times: times, // Array of times for this date
      timeRange: times.length > 1 ? `${times[0]}-${times[times.length - 1]}` : times[0] // Time range display
    }
  })

  // Sort by date
  return averagedWeights.sort((a, b) => new Date(a.date) - new Date(b.date))
}

/**
 * Prepares chart data with daily averages
 * @param {Array} weights - Raw weight entries
 * @param {number} days - Number of recent days to include
 * @param {string} dateFormat - Format for chart labels
 * @returns {Array} - Chart-ready data with averaged weights
 */
export const prepareChartData = (weights, days, dateFormat = 'MMM dd') => {
  const averagedWeights = averageWeightsByDay(weights)
  const recentWeights = averagedWeights.slice(-days)
  
  return recentWeights.map(entry => ({
    date: format(new Date(entry.date), dateFormat),
    weight: entry.weight,
    isAveraged: entry.isAveraged || false,
    originalEntries: entry.originalEntries || 1,
    timeRange: entry.timeRange || entry.time || null
  }))
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

// Import format function from date-fns
import { format } from 'date-fns'
