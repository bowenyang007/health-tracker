// ============================================================================
// CUSTOM HOOK - useHealthData
// ============================================================================
// Shared hook for loading and managing health tracking data
// Eliminates duplicate data loading logic across components
// ============================================================================

import { useState, useEffect } from 'react'
import { dataService } from '../services/dataService'

/**
 * Custom hook for loading and managing health tracking data
 * @returns {Object} Health data and loading state
 */
export const useHealthData = () => {
  const [weights, setWeights] = useState([])
  const [goal, setGoal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [savedWeights, savedGoal] = await Promise.all([
        dataService.loadWeights(),
        dataService.loadGoal()
      ])
      
      setWeights(savedWeights)
      setGoal(savedGoal)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    weights,
    goal,
    isLoading,
    error,
    setWeights,
    setGoal,
    reload: loadData
  }
}

