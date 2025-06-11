import { useState, useEffect } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import DemoDataControls from '../components/DemoDataControls'
import { averageWeightsByDay, prepareChartData, calculateWeightChange } from '../utils/dataProcessing'

const WeightTracker = () => {
  const [weights, setWeights] = useState([])
  const [newWeight, setNewWeight] = useState('')
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [newTime, setNewTime] = useState(format(new Date(), 'HH:mm'))
  const [goal, setGoal] = useState('')
  const [chartPeriod, setChartPeriod] = useState(30) // 7, 30, or 90 days
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

  const addWeight = (e) => {
    e.preventDefault()
    if (!newWeight || !newDate || !newTime) return

    // Combine date and time into a proper timestamp
    const dateTimeString = `${newDate}T${newTime}:00`
    const timestamp = new Date(dateTimeString).toISOString()

    const weightEntry = {
      id: Date.now(),
      weight: parseFloat(newWeight),
      date: newDate,
      time: newTime,
      timestamp: timestamp
    }

    const updatedWeights = [...weights, weightEntry].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    saveWeights(updatedWeights)
    setNewWeight('')
    setNewDate(format(new Date(), 'yyyy-MM-dd'))
    setNewTime(format(new Date(), 'HH:mm'))
  }

  const deleteWeight = (id) => {
    const updatedWeights = weights.filter(weight => weight.id !== id)
    saveWeights(updatedWeights)
  }

  const handleDataChange = () => {
    // Reload data from localStorage when demo data changes
    const savedWeights = JSON.parse(localStorage.getItem('healthTracker_weight') || '[]')
    const savedGoal = localStorage.getItem('healthTracker_weightGoal') || ''
    setWeights(savedWeights)
    setGoal(savedGoal)
  }

  // Calculate stats using averaged data
  const weightStats = calculateWeightChange(weights)
  const currentWeight = weightStats.current
  const startWeight = weightStats.start
  const totalChange = weightStats.change
  const goalWeight = parseFloat(goal) || 0
  const goalProgress = goalWeight ? currentWeight - goalWeight : 0

  // Prepare chart data based on selected period (with daily averaging)
  const getChartData = () => {
    const dateFormat = chartPeriod <= 7 ? 'MMM dd' : 'MM/dd'
    const chartData = prepareChartData(weights, chartPeriod, dateFormat)

    // Add goal line to each data point
    return chartData.map(entry => ({
      ...entry,
      goal: goalWeight || undefined
    }))
  }

  const chartData = getChartData()

  // Calculate Y-axis domain for better chart scaling
  const getYAxisDomain = () => {
    if (chartData.length === 0) return ['auto', 'auto']

    const weights = chartData.map(d => d.weight)
    const minWeight = Math.min(...weights)
    const maxWeight = Math.max(...weights)

    // Add some padding (5% of the range, minimum 2 lbs)
    const range = maxWeight - minWeight
    const padding = Math.max(range * 0.1, 2)

    const yMin = Math.max(0, minWeight - padding)
    const yMax = maxWeight + padding

    // Round to nice numbers
    return [Math.floor(yMin), Math.ceil(yMax)]
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Weight Tracker</h1>
        <p className="page-subtitle">Monitor your weight progress over time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-2">
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
          {goalWeight && (
            <div className={`stat-change ${goalProgress > 0 ? 'negative' : 'positive'}`}>
              {Math.abs(goalProgress).toFixed(1)} lbs {goalProgress > 0 ? 'to lose' : 'below goal'}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        {/* Add Weight Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Log Weight</h3>
          </div>
          <form onSubmit={addWeight}>
            <div className="form-group">
              <label className="form-label">Weight (lbs)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Enter weight"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                className="form-input"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              Add Weight
            </button>
          </form>

          <div style={{ marginTop: '2rem' }}>
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

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
              <DemoDataControls onDataChange={handleDataChange} showAdvanced={true} />
            </div>
          </div>
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
                No weight entries yet. Add your first entry to get started!
              </p>
            ) : (
              (() => {
                const entriesToShow = showAllEntries
                  ? weights.slice(-20).reverse() // Show last 20 individual entries
                  : averageWeightsByDay(weights).slice(-10).reverse() // Show last 10 daily averages

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
                        {showAllEntries && weight.time && (
                          <span style={{ marginLeft: '0.5rem' }}>
                            at {weight.time}
                          </span>
                        )}
                        {!showAllEntries && weight.timeRange && (
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                            ({weight.timeRange})
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteWeight(weight.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem' }}
                      disabled={weight.isAveraged} // Can't delete averaged entries
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              })()
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      {weights.length > 0 && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 className="card-title">Weight Progress</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn ${chartPeriod === 7 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setChartPeriod(7)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                7 days
              </button>
              <button
                className={`btn ${chartPeriod === 30 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setChartPeriod(30)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                30 days
              </button>
              <button
                className={`btn ${chartPeriod === 90 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setChartPeriod(90)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                90 days
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                domain={getYAxisDomain()}
                tickFormatter={(value) => `${value} lbs`}
              />
              <Tooltip
                formatter={(value, name, props) => {
                  const isAveraged = props.payload?.isAveraged
                  const originalEntries = props.payload?.originalEntries
                  const timeRange = props.payload?.timeRange

                  let suffix = ''
                  if (isAveraged) {
                    suffix = ` (avg of ${originalEntries} entries`
                    if (timeRange) suffix += ` from ${timeRange}`
                    suffix += ')'
                  }

                  return [`${value} lbs${suffix}`, name]
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
                name="Weight"
              />
              {goalWeight && (
                <Line
                  type="monotone"
                  dataKey="goal"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Goal"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default WeightTracker
