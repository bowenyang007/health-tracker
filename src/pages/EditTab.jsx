import { useState, useEffect } from 'react'
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { averageWeightsByDay, calculateWeightChange } from '../utils/dataProcessing'

const EditTab = () => {
  const [weights, setWeights] = useState([])
  const [goal, setGoal] = useState('')
  const [showAllEntries, setShowAllEntries] = useState(false) // Toggle between daily average and all entries

  // Load data from localStorage
  useEffect(() => {
    const savedWeights = JSON.parse(localStorage.getItem('healthTracker_weight') || '[]')
    const savedGoal = localStorage.getItem('healthTracker_weightGoal') || ''
    setWeights(savedWeights)
    setGoal(savedGoal)
  }, [])

  // Save to localStorage
  const saveWeights = (newWeights) => {
    localStorage.setItem('healthTracker_weight', JSON.stringify(newWeights))
    setWeights(newWeights)
  }

  const saveGoal = (newGoal) => {
    localStorage.setItem('healthTracker_weightGoal', newGoal)
    setGoal(newGoal)
  }

  const deleteWeight = (id) => {
    const updatedWeights = weights.filter(weight => weight.id !== id)
    saveWeights(updatedWeights)
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
              const entriesToShow = showAllEntries
                ? [...weights].reverse() // Show all entries, newest first
                : [...averageWeightsByDay(weights)].reverse() // Show daily averages, newest first

              return entriesToShow.map((weight) => (
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
                    </div>
                  </div>
                  {showAllEntries && (
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
                  )}
                </div>
              ))
            })()
          )}
        </div>
      </div>
    </div>
  )
}

export default EditTab
