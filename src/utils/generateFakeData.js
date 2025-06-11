// ============================================================================
// FAKE DATA GENERATOR FOR DEMO PURPOSES
// ============================================================================
// This file contains all fake data generation logic.
// Delete this entire file when you no longer need demo data.
// ============================================================================

import { format, subDays } from 'date-fns'

/**
 * Generates realistic weight loss data spanning 90 days
 * From 195 lbs to ~170 lbs with natural daily fluctuations
 */
export const generateWeightLossData = () => {
  console.log('🎯 Generating 90-day daily weight loss demo data...')

  const data = []
  const startWeight = 195
  const endWeight = 170
  const totalDays = 90
  const totalWeightLoss = startWeight - endWeight // 25 lbs

  // Create realistic daily weight loss with fluctuations
  for (let day = 0; day <= totalDays; day++) {
    const date = format(subDays(new Date(), totalDays - day), 'yyyy-MM-dd')

    // Base weight loss progression (not linear, faster at start)
    const progressRatio = day / totalDays
    const baseWeight = startWeight - (totalWeightLoss * Math.pow(progressRatio, 0.7))

    // Add realistic daily fluctuations
    const fluctuation = (Math.random() - 0.5) * 2.5 // ±1.25 lbs daily variation

    // Add weekly patterns (slightly higher on weekends)
    const dayOfWeek = (totalDays - day) % 7
    const weekendEffect = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.3 : 0

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
    const shouldInclude = day === 0 || day === totalDays || Math.random() > 0.25 // Skip ~25% of days

    if (shouldInclude) {
      // Generate realistic weigh-in times (mostly morning, some evening)
      const isMorning = Math.random() > 0.3 // 70% morning weigh-ins
      const hour = isMorning
        ? Math.floor(Math.random() * 3) + 6  // 6-8 AM
        : Math.floor(Math.random() * 3) + 19 // 7-9 PM
      const minute = Math.floor(Math.random() * 60)
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

      const timestamp = new Date(`${date}T${time}:00`).toISOString()

      data.push({
        id: Date.now() + day,
        weight: Math.max(finalWeight, endWeight - 2), // Don't go below target
        date: date,
        time: time,
        timestamp: timestamp
      })
    }
  }

  const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date))
  console.log(`✅ Generated ${sortedData.length} weight entries (${sortedData[0].weight} → ${sortedData[sortedData.length - 1].weight} lbs)`)
  return sortedData
}

/**
 * Checks if demo data already exists
 */
export const hasDemoData = () => {
  const existingWeights = JSON.parse(localStorage.getItem('healthTracker_weight') || '[]')
  return existingWeights.some(entry => entry.isDemoData)
}

/**
 * Loads fake data into localStorage
 * SAFELY merges with existing data - does not overwrite your manual entries
 * Marks data as demo data for safe removal later
 */
export const loadFakeData = () => {
  console.log('📊 Loading demo data into app...')

  // Check if demo data already exists
  if (hasDemoData()) {
    console.log('⚠️ Demo data already exists. Use "Clear Demo Data" first if you want to reload.')
    return {
      weightData: JSON.parse(localStorage.getItem('healthTracker_weight') || '[]'),
      goalWeight: parseFloat(localStorage.getItem('healthTracker_weightGoal') || '0')
    }
  }

  // Get existing data first
  const existingWeights = JSON.parse(localStorage.getItem('healthTracker_weight') || '[]')
  const existingGoal = localStorage.getItem('healthTracker_weightGoal') || ''
  const hasExistingGoal = existingGoal !== ''

  console.log(`📋 Found ${existingWeights.length} existing weight entries`)

  // Generate demo data
  const fakeWeightData = generateWeightLossData()
  const demoGoalWeight = 165

  // Mark each demo entry
  const markedFakeData = fakeWeightData.map(entry => ({
    ...entry,
    isDemoData: true // Flag to identify demo entries
  }))

  // Merge existing data with demo data, sort by date
  const allWeightData = [...existingWeights, ...markedFakeData]
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // Save merged data
  localStorage.setItem('healthTracker_weight', JSON.stringify(allWeightData))

  // Only set goal if user doesn't have one already
  if (!hasExistingGoal) {
    localStorage.setItem('healthTracker_weightGoal', demoGoalWeight.toString())
    localStorage.setItem('healthTracker_isDemoGoal', 'true')
    console.log(`🎯 Demo goal set to: ${demoGoalWeight} lbs`)
  } else {
    console.log(`🎯 Keeping your existing goal: ${existingGoal} lbs`)
  }

  console.log(`💾 Demo data merged: ${existingWeights.length} existing + ${markedFakeData.length} demo = ${allWeightData.length} total entries`)

  return {
    weightData: allWeightData,
    goalWeight: hasExistingGoal ? parseFloat(existingGoal) : demoGoalWeight
  }
}

/**
 * Safely clears only demo data from localStorage
 * Preserves any manually entered data
 */
export const clearFakeData = () => {
  console.log('🗑️ Clearing demo data (preserving manual entries)...')

  // Get existing data
  const existingWeights = JSON.parse(localStorage.getItem('healthTracker_weight') || '[]')
  const isDemoGoal = localStorage.getItem('healthTracker_isDemoGoal') === 'true'

  // Filter out only demo data, keep manual entries
  const manualWeights = existingWeights.filter(entry => !entry.isDemoData)

  // Save back only the manual data
  localStorage.setItem('healthTracker_weight', JSON.stringify(manualWeights))

  // Clear goal only if it was set by demo
  if (isDemoGoal) {
    localStorage.removeItem('healthTracker_weightGoal')
    localStorage.removeItem('healthTracker_isDemoGoal')
    console.log('🎯 Demo goal cleared')
  }

  console.log(`✅ Demo data cleared. Preserved ${manualWeights.length} manual entries.`)
}

/**
 * Nuclear option: Clears ALL data (demo + manual)
 * Use with caution - this will delete everything!
 */
export const clearAllData = () => {
  console.log('💥 CLEARING ALL DATA (demo + manual)...')
  localStorage.removeItem('healthTracker_weight')
  localStorage.removeItem('healthTracker_weightGoal')
  localStorage.removeItem('healthTracker_isDemoGoal')
  console.log('✅ All data cleared')
}

// ============================================================================
// END OF FAKE DATA GENERATOR
// ============================================================================
