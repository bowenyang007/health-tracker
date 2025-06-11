import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import DemoDataControls from '../components/DemoDataControls'
import { prepareChartData, calculateWeightChange } from '../utils/dataProcessing'

const Dashboard = () => {
  const [weights, setWeights] = useState([])
  const [goal, setGoal] = useState('')

  // Load data from localStorage
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const weightData = JSON.parse(localStorage.getItem('healthTracker_weight') || '[]')
    const goalData = localStorage.getItem('healthTracker_weightGoal') || ''
    setWeights(weightData)
    setGoal(goalData)
  }

  const handleDataChange = () => {
    loadData() // Reload data when demo data changes
  }

  // Get recent stats using averaged data
  const weightStats = calculateWeightChange(weights)
  const currentWeight = weightStats.current
  const totalChange = weightStats.change
  const goalWeight = parseFloat(goal) || 0
  const goalProgress = goalWeight ? currentWeight - goalWeight : 0

  // Prepare chart data with daily averaging
  const chartData = prepareChartData(weights, 30, 'MMM dd')

  const getYAxisDomain = () => {
    if (chartData.length === 0) return ['auto', 'auto']

    const weights = chartData.map(d => d.weight)
    const minWeight = Math.min(...weights)
    const maxWeight = Math.max(...weights)

    // Add some padding (10% of the range, minimum 2 lbs)
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
        <h1 className="page-title">Health Tracker</h1>
        <p className="page-subtitle">Track your weight progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-2">
        <div className="card stat-card">
          <div className="stat-value">{currentWeight || '--'}</div>
          <div className="stat-label">Current Weight (lbs)</div>
          {totalChange !== 0 && (
            <div className={`stat-change ${totalChange > 0 ? 'negative' : 'positive'}`}>
              {totalChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(totalChange).toFixed(1)} lbs total
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

      {/* Demo Data Controls */}
      {weights.length === 0 && (
        <DemoDataControls onDataChange={handleDataChange} showAsCard={true} />
      )}

      {/* Chart - only show if we have data */}
      {weights.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Weight Progress</h3>
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
                  const timeRange = props.payload?.timeRange

                  let suffix = ''
                  if (isAveraged) {
                    suffix = ` (avg of ${originalEntries}`
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default Dashboard
