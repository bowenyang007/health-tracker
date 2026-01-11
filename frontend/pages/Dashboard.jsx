import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, LabelList } from 'recharts'
import { format } from 'date-fns'
import { prepareChartData } from '../utils/dataProcessing.js'
import { dataService } from '../services/dataService.js'
import { CHART_PERIODS, DATE_FORMATS } from '../utils/constants.js'

const Dashboard = () => {
  const [weights, setWeights] = useState([])
  const [newWeight, setNewWeight] = useState('')
  const [newDate, setNewDate] = useState(format(new Date(), DATE_FORMATS.ISO))
  const [goal, setGoal] = useState('')
  const [chartPeriod, setChartPeriod] = useState(CHART_PERIODS.WEEK) // 7, 30, or 90 days
  const [isLoading, setIsLoading] = useState(false)

  // Custom label component for weight differences
  const renderWeightDiffLabel = (props) => {
    const { x, y, index, value } = props
    
    if (index === 0 || value === null || value === undefined) {
      return null
    }

    const diff = parseFloat(value)
    const displayValue = Math.abs(diff).toFixed(1)
    const sign = diff > 0 ? '+' : '-'
    const color = diff > 0 ? '#ef4444' : '#10b981' // red for gain, green for loss
    
    return (
      <text
        x={x}
        y={y - 15}
        fill={color}
        fontSize="11"
        fontWeight="600"
        textAnchor="middle"
      >
        {sign}{displayValue}
      </text>
    )
  }

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      const [savedWeights, savedGoal] = await Promise.all([
        dataService.loadWeights(),
        dataService.loadGoal()
      ])
      
      setWeights(savedWeights)
      setGoal(savedGoal)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addWeight = async (e) => {
    e.preventDefault()
    if (!newWeight || !newDate) return

    try {
      setIsLoading(true)
      
      // Parse the date and combine with current time
      const [year, month, day] = newDate.split('-').map(Number)
      const now = new Date()
      
      // Create date in local timezone and get Unix timestamp
      const localDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds())
      const timestamp = localDate.getTime() // Unix timestamp in milliseconds
      
      const weightEntry = {
        id: timestamp,
        weight: parseFloat(newWeight),
        timestamp: timestamp
      }

      const updatedWeights = await dataService.addWeight(weightEntry)
      setWeights(updatedWeights)
      setNewWeight('') // Clear the form
      setNewDate(format(new Date(), DATE_FORMATS.ISO))
    } catch (error) {
      console.error('Error adding weight:', error)
      alert('Error adding weight. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Prepare chart data based on selected period (with daily averaging)
  const getChartData = () => {
    const dateFormat = chartPeriod <= CHART_PERIODS.WEEK ? DATE_FORMATS.SHORT : DATE_FORMATS.MEDIUM
    const chartData = prepareChartData(weights, chartPeriod, dateFormat)

    // Determine label intervals based on data density
    // For 7 days: show all labels
    // For 30 days: show every ~3rd label
    // For 90 days: show every ~7th label
    const labelInterval = chartPeriod === CHART_PERIODS.WEEK ? 1 : 
                         chartPeriod === CHART_PERIODS.MONTH ? 3 : 7

    // Add goal line and weight differences to each data point
    const goalWeight = parseFloat(goal) || 0
    let lastLabelIndex = 0
    
    return chartData.map((entry, index) => {
      let weightDiff = null
      let showLabel = false
      
      // Show label at strategic intervals
      if (index > 0 && (index % labelInterval === 0 || index === chartData.length - 1)) {
        // Calculate difference from last labeled point, not just previous point
        const diff = entry.weight - chartData[lastLabelIndex].weight
        weightDiff = diff
        showLabel = true
        lastLabelIndex = index
      }
      
      return {
        ...entry,
        goal: goalWeight || undefined,
        weightDiff: showLabel ? weightDiff : null
      }
    })
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
                autoComplete="off"
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
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              <Plus size={16} />
              {isLoading ? 'Adding...' : 'Add Weight'}
            </button>
          </form>
        </div>

        {/* Chart */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <div className="period-button-group">
              <button
                className={`btn period-button ${chartPeriod === CHART_PERIODS.WEEK ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setChartPeriod(CHART_PERIODS.WEEK)}
              >
                7d
              </button>
              <button
                className={`btn period-button ${chartPeriod === CHART_PERIODS.MONTH ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setChartPeriod(CHART_PERIODS.MONTH)}
              >
                30d
              </button>
              <button
                className={`btn period-button ${chartPeriod === CHART_PERIODS.QUARTER ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setChartPeriod(CHART_PERIODS.QUARTER)}
              >
                90d
              </button>
            </div>
          </div>
          {weights.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                >
                  <LabelList
                    dataKey="weightDiff"
                    content={renderWeightDiffLabel}
                  />
                </Line>
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
          ) : (
            <div style={{ 
              height: '250px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              No data yet. Add your first weight entry to see the chart!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
