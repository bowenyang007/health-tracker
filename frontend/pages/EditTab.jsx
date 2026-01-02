import { useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { averageWeightsByDay, calculateWeightChange } from '../utils/dataProcessing.js'
import { dataService } from '../services/dataService.js'
import { useHealthData } from '../hooks/useHealthData.js'
import { WeightEntryRow, DailyEntryRow } from '../components/WeightEntryRow.jsx'
import { DATE_FORMATS } from '../utils/constants.js'

const EditTab = () => {
  const { weights, goal, isLoading, setWeights, setGoal } = useHealthData()
  const [showAllEntries, setShowAllEntries] = useState(false) // Toggle between daily average and all entries
  const [selectedDate, setSelectedDate] = useState(null) // For drilling down into a specific date

  // Load data
  // (Handled by useHealthData hook)

  const saveGoal = async (newGoal) => {
    try {
      await dataService.saveGoal(newGoal)
      setGoal(newGoal)
    } catch (error) {
      console.error('Error saving goal:', error)
      alert('Error saving goal. Please try again.')
    }
  }

  const deleteWeight = async (id) => {
    try {
      const updatedWeights = await dataService.deleteWeight(id)
      setWeights(updatedWeights)
    } catch (error) {
      console.error('Error deleting weight:', error)
      alert('Error deleting weight. Please try again.')
    }
  }

  const handleDailyEntryClick = (date, hasMultipleEntries) => {
    if (hasMultipleEntries) {
      // Drill down to show individual entries for this date
      setSelectedDate(selectedDate === date ? null : date)
    } else {
      // Single entry - find and delete it
      const entryToDelete = weights.find(w => format(new Date(w.timestamp), DATE_FORMATS.ISO) === date)
      if (entryToDelete && window.confirm(
        `⚠️ Delete weight entry for ${format(new Date(entryToDelete.timestamp), DATE_FORMATS.FULL)}?\n\n` +
        `Weight: ${entryToDelete.weight} lbs\n` +
        `This action cannot be undone.`
      )) {
        deleteWeight(entryToDelete.id)
      }
    }
  }

  const getEntriesForDate = (date) => {
    return weights.filter(w => format(new Date(w.timestamp), DATE_FORMATS.ISO) === date)
      .sort((a, b) => b.timestamp - a.timestamp)
  }



  // Calculate stats using averaged data
  const weightStats = calculateWeightChange(weights)
  const currentWeight = weightStats.current
  const totalChange = weightStats.change
  const goalWeight = parseFloat(goal) || 0
  const goalProgress = goalWeight ? currentWeight - goalWeight : 0

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Edit & Settings</h1>
        <p className="page-subtitle">Manage your entries and settings</p>
      </div>

      <div className="grid grid-2">
        {/* Stats */}
        <div className="card stat-card">
          <div className="stat-value">{currentWeight || '--'}</div>
          <div className="stat-label">Current Weight (lbs)</div>
          {totalChange !== 0 && (
            <div className={`stat-change ${totalChange > 0 ? 'negative' : 'positive'}`}>
              {totalChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(totalChange).toFixed(1)} lbs {totalChange > 0 ? 'gained' : 'lost'}
            </div>
          )}
        </div>

        <div className="card stat-card">
          <div className="stat-value">{goalWeight || '--'}</div>
          <div className="stat-label">Goal Weight (lbs)</div>
          {goalProgress !== 0 && goalWeight && (
            <div className={`stat-change ${goalProgress > 0 ? 'negative' : 'positive'}`}>
              {goalProgress > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(goalProgress).toFixed(1)} lbs {goalProgress > 0 ? 'above' : 'below'} goal
            </div>
          )}
        </div>
      </div>

      {/* Goal Weight Setting */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Goal Weight</h3>
        </div>
        <div className="form-group">
          <label className="form-label">Goal Weight (lbs)</label>
          <input
            type="number"
            step="0.1"
            className="form-input"
            value={goal}
            onChange={(e) => saveGoal(e.target.value)}
            placeholder="Set your goal weight"
          />
        </div>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
          Set your target weight to track progress on the dashboard chart.
        </p>
      </div>

      {/* Recent Entries */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">Recent Entries</h3>
          <button
            className={`btn ${showAllEntries ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowAllEntries(!showAllEntries)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            {showAllEntries ? 'Show Daily Avg' : 'Show All'}
          </button>
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {weights.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              No weight entries yet. Add your first entry on the Dashboard tab!
            </p>
          ) : (
            (() => {
              if (showAllEntries) {
                // Show all individual entries with time, newest first
                return [...weights].reverse().map((weight) => (
                  <WeightEntryRow 
                    key={weight.id}
                    weight={weight}
                    onDelete={deleteWeight}
                    isLoading={isLoading}
                  />
                ))
              } else {
                // Show daily list with delete/drill-down functionality
                const dailyEntries = [...averageWeightsByDay(weights)].reverse()
                
                return dailyEntries.map((weight) => {
                  const isExpanded = selectedDate === weight.date
                  
                  return (
                    <DailyEntryRow
                      key={weight.date}
                      weight={weight}
                      isExpanded={isExpanded}
                      onClick={() => handleDailyEntryClick(weight.date, weight.isAveraged)}
                      onDelete={deleteWeight}
                      isLoading={isLoading}
                      getEntriesForDate={getEntriesForDate}
                    />
                  )
                })
              }
            })()
          )}
        </div>
      </div>
    </div>
  )
}

export default EditTab
