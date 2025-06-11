import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { prepareChartData } from '../utils/dataProcessing'

const Dashboard = () => {
  const [weights, setWeights] = useState([])
  const [newWeight, setNewWeight] = useState('')
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [goal, setGoal] = useState('')
  const [chartPeriod, setChartPeriod] = useState(30) // 7, 30, or 90 days

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

  const addWeight = (e) => {
    e.preventDefault()
    if (!newWeight || !newDate) return

    // Create timestamp using just the date (set to noon to avoid timezone issues)
    const dateTimeString = `${newDate}T12:00:00`
    const timestamp = new Date(dateTimeString).toISOString()

    const weightEntry = {
      id: Date.now(),
      weight: parseFloat(newWeight),
      date: newDate,
      timestamp: timestamp
    }

    const updatedWeights = [...weights, weightEntry].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    saveWeights(updatedWeights)
    setNewWeight('')
    setNewDate(format(new Date(), 'yyyy-MM-dd'))
  }

  // Prepare chart data based on selected period (with daily averaging)
  const getChartData = () => {
    const dateFormat = chartPeriod <= 7 ? 'MMM dd' : 'MM/dd'
    const chartData = prepareChartData(weights, chartPeriod, dateFormat)

    // Add goal line to each data point
    const goalWeight = parseFloat(goal) || 0
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
    const goalWeight = parseFloat(goal) || 0
    
    if (goalWeight > 0) {
      weights.push(goalWeight)
    }
    
    const minWeight = Math.min(...weights)
    const maxWeight = Math.max(...weights)
    const range = maxWeight - minWeight
    const padding = Math.max(range * 0.1, 5) // 10% padding or 5 lbs minimum
    
    return [
      Math.max(0, Math.floor(minWeight - padding)),
      Math.ceil(maxWeight + padding)
    ]
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Health Tracker</h1>
        <p className="page-subtitle">Track your weight progress</p>
      </div>

      <div className="grid grid-2">
        {/* Log Weight Form */}
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
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              Add Weight
            </button>
          </form>
        </div>

        {/* Chart */}
        {weights.length > 0 && (
          <div className="card">
            <div className="card-header" style={{ marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>Weight Progress</h3>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  className={`btn ${chartPeriod === 7 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setChartPeriod(7)}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', minWidth: '60px' }}
                >
                  7d
                </button>
                <button
                  className={`btn ${chartPeriod === 30 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setChartPeriod(30)}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', minWidth: '60px' }}
                >
                  30d
                </button>
                <button
                  className={`btn ${chartPeriod === 90 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setChartPeriod(90)}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', minWidth: '60px' }}
                >
                  90d
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
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

                    if (name === 'weight') {
                      let label = `${value} lbs`
                      if (isAveraged && originalEntries > 1) {
                        label += ` (avg of ${originalEntries} entries)`
                      }
                      return [label, 'Weight']
                    }
                    if (name === 'goal') {
                      return [`${value} lbs`, 'Goal']
                    }
                    return [value, name]
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
                {goal && (
                  <Line
                    type="monotone"
                    dataKey="goal"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
