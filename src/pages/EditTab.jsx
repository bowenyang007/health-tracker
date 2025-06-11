import { useState, useEffect } from 'react'
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { averageWeightsByDay, calculateWeightChange } from '../utils/dataProcessing'
import { dataService } from '../services/dataService'

const EditTab = () => {
  const [weights, setWeights] = useState([])
  const [goal, setGoal] = useState('')
  const [showAllEntries, setShowAllEntries] = useState(false) // Toggle between daily average and all entries
  const [selectedDate, setSelectedDate] = useState(null) // For drilling down into a specific date

  // Load data using data service
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedWeights, savedGoal] = await Promise.all([
          dataService.loadWeights(),
          dataService.loadGoal()
        ])
        setWeights(savedWeights)
        setGoal(savedGoal)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    
    loadData()
  }, [])

  const saveGoal = async (newGoal) => {
    try {
      await dataService.saveGoal(newGoal)
      setGoal(newGoal)
    } catch (error) {
      console.error('Error saving goal:', error)
    }
  }

  const deleteWeight = async (id) => {
    try {
      const updatedWeights = await dataService.deleteWeight(id)
      setWeights(updatedWeights)
    } catch (error) {
      console.error('Error deleting weight:', error)
    }
  }

  const handleDailyEntryClick = (date, hasMultipleEntries) => {
    if (hasMultipleEntries) {
      // Drill down to show individual entries for this date
      setSelectedDate(selectedDate === date ? null : date)
    } else {
      // Single entry - find and delete it
      const entryToDelete = weights.find(w => w.date === date)
      if (entryToDelete && window.confirm(`⚠️ Delete weight entry for ${format(new Date(date), 'MMM dd, yyyy')}?\n\nWeight: ${entryToDelete.weight} lbs\nThis action cannot be undone.`)) {
        deleteWeight(entryToDelete.id)
      }
    }
  }

  const getEntriesForDate = (date) => {
    return weights.filter(w => w.date === date).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
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
                  <div key={weight.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>
                        {weight.weight} lbs
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {format(new Date(weight.timestamp), 'MMM dd, yyyy')} at {format(new Date(weight.timestamp), 'h:mm a')}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteWeight(weight.id)}
                      className="btn btn-danger"
                      style={{
                        padding: '0.5rem',
                        minWidth: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              } else {
                // Show daily list with delete/drill-down functionality
                const dailyEntries = [...averageWeightsByDay(weights)].reverse()
                
                return (
                  <>
                    {dailyEntries.map((weight) => {
                      const hasMultipleEntries = weight.isAveraged
                      const isExpanded = selectedDate === weight.date
                      
                      return (
                        <div key={weight.date}>
                          {/* Daily entry row */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0',
                            borderBottom: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            backgroundColor: isExpanded ? '#f8fafc' : 'transparent'
                          }}
                          onClick={() => handleDailyEntryClick(weight.date, hasMultipleEntries)}
                          >
                                                         <div>
                               <div style={{ fontWeight: '600' }}>
                                 {weight.weight} lbs
                                 {weight.isAveraged && (
                                   <span style={{
                                     fontSize: '0.75rem',
                                     color: '#3b82f6',
                                     marginLeft: '0.5rem',
                                     fontWeight: '400'
                                   }}>
                                     (avg of {weight.originalEntries})
                                   </span>
                                 )}
                               </div>
                               <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                 {format(new Date(weight.date), 'MMM dd, yyyy')}
                                 {weight.isAveraged ? (
                                   // For averaged entries, show time range of all entries for that date
                                   (() => {
                                     const dayEntries = getEntriesForDate(weight.date)
                                     const times = dayEntries.map(entry => format(new Date(entry.timestamp), 'h:mm a'))
                                     const earliestTime = times[times.length - 1] // entries are sorted newest first
                                     const latestTime = times[0]
                                     return earliestTime === latestTime 
                                       ? ` at ${latestTime}`
                                       : ` (${earliestTime} - ${latestTime})`
                                   })()
                                 ) : (
                                   // For single entries, show the actual time
                                   ` at ${format(new Date(weight.timestamp), 'h:mm a')}`
                                 )}
                               </div>
                             </div>
                            <button
                              className={`btn ${hasMultipleEntries ? 'btn-secondary' : 'btn-danger'}`}
                              style={{
                                padding: '0.5rem',
                                minWidth: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title={hasMultipleEntries ? 'View entries' : 'Delete entry'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDailyEntryClick(weight.date, hasMultipleEntries)
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          {/* Expanded individual entries */}
                          {isExpanded && (
                            <div style={{ marginLeft: '1rem', backgroundColor: '#f8fafc' }}>
                              {getEntriesForDate(weight.date).map((entry) => (
                                <div key={entry.id} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '0.5rem 0',
                                  borderBottom: '1px solid #e2e8f0'
                                }}>
                                  <div>
                                    <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                                      {entry.weight} lbs
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                      {format(new Date(entry.timestamp), 'h:mm a')}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`⚠️ Delete weight entry?\n\nWeight: ${entry.weight} lbs\nTime: ${format(new Date(entry.timestamp), 'h:mm a')}\nThis action cannot be undone.`)) {
                                        deleteWeight(entry.id)
                                      }
                                    }}
                                    className="btn btn-danger"
                                    style={{
                                      padding: '0.25rem',
                                      minWidth: 'auto',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.8rem'
                                    }}
                                    title="Delete entry"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </>
                )
              }
            })()
          )}
        </div>
      </div>
    </div>
  )
}

export default EditTab
