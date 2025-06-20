// ============================================================================
// DATA PROCESSING UTILITIES
// ============================================================================
// Functions for processing weight data, including handling multiple entries per day
// ============================================================================

// Import format function from date-fns
import { format, subDays } from 'date-fns'

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

    return {
      ...latestEntry,
      weight: Math.round(averageWeight * 10) / 10, // Round to 1 decimal
      isAveraged: entries.length > 1, // Flag to indicate this is an average
      originalEntries: entries.length // Track how many entries were averaged
    }
  })

  // Sort by date
  return averagedWeights.sort((a, b) => new Date(a.date) - new Date(b.date))
}

/**
 * Prepares chart data with consistent X-axis intervals
 * @param {Array} weights - Raw weight entries
 * @param {number} days - Number of recent days to include
 * @param {string} dateFormat - Format for chart labels
 * @returns {Array} - Chart-ready data with consistent spacing
 */
export const prepareChartData = (weights, days, dateFormat = 'MMM dd') => {
  const averagedWeights = averageWeightsByDay(weights)

  if (averagedWeights.length === 0) return []

  // Get the date range
  const endDate = new Date()
  const startDate = subDays(endDate, days - 1)

  // Determine appropriate interval based on period
  let interval
  let maxPoints

  if (days <= 7) {
    interval = 1 // Daily for 7 days
    maxPoints = 7
  } else if (days <= 30) {
    interval = 2 // Every 2 days for 30 days (15 points)
    maxPoints = 15
  } else {
    interval = 7 // Weekly for 90 days (13 points)
    maxPoints = 13
  }

  // Create evenly spaced date points
  const chartData = []
  const totalDays = days
  const step = Math.max(1, Math.floor(totalDays / maxPoints))

  for (let i = 0; i < totalDays; i += step) {
    const targetDate = format(subDays(endDate, totalDays - 1 - i), 'yyyy-MM-dd')

    // Find the closest weight entry to this date
    const exactMatch = averagedWeights.find(w => w.date === targetDate)

    if (exactMatch) {
      chartData.push({
        date: format(new Date(exactMatch.date), dateFormat),
        weight: exactMatch.weight,
        isAveraged: exactMatch.isAveraged || false,
        originalEntries: exactMatch.originalEntries || 1
      })
    } else {
      // Find nearest weight entry (within 3 days)
      const targetDateTime = new Date(targetDate).getTime()
      const nearestEntry = averagedWeights
        .filter(w => Math.abs(new Date(w.date).getTime() - targetDateTime) <= 3 * 24 * 60 * 60 * 1000)
        .sort((a, b) => Math.abs(new Date(a.date).getTime() - targetDateTime) - Math.abs(new Date(b.date).getTime()))[0]

      if (nearestEntry) {
        chartData.push({
          date: format(new Date(targetDate), dateFormat),
          weight: nearestEntry.weight,
          isAveraged: nearestEntry.isAveraged || false,
          originalEntries: nearestEntry.originalEntries || 1
        })
      }
    }
  }

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


