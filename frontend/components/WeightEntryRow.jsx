// ============================================================================
// WEIGHT ENTRY ROW COMPONENT
// ============================================================================
// Reusable component for displaying weight entries with delete functionality
// ============================================================================

import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { DATE_FORMATS } from '../utils/constants'

/**
 * Component for displaying a single weight entry
 */
export const WeightEntryRow = ({ weight, onDelete, isLoading }) => {
  const handleDelete = () => {
    if (window.confirm(
      `⚠️ Delete weight entry for ${format(new Date(weight.timestamp), DATE_FORMATS.FULL)}?\n\n` +
      `Weight: ${weight.weight} lbs\n` +
      `This action cannot be undone.`
    )) {
      onDelete(weight.id)
    }
  }

  return (
    <div className="entry-row">
      <div>
        <div className="entry-weight">
          {weight.weight} lbs
        </div>
        <div className="entry-date">
          {format(new Date(weight.timestamp), DATE_FORMATS.FULL)} at {format(new Date(weight.timestamp), DATE_FORMATS.TIME)}
        </div>
      </div>
      <button
        onClick={handleDelete}
        className="btn btn-danger btn-icon-only"
        disabled={isLoading}
        title="Delete entry"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

/**
 * Component for displaying a daily average entry (clickable to expand)
 */
export const DailyEntryRow = ({ 
  weight, 
  isExpanded, 
  onClick, 
  onDelete,
  isLoading,
  getEntriesForDate 
}) => {
  const hasMultipleEntries = weight.isAveraged

  return (
    <div>
      {/* Daily entry row */}
      <div 
        className={`entry-row ${isExpanded ? 'expanded' : ''}`}
        style={{ cursor: hasMultipleEntries ? 'pointer' : 'default' }}
      >
        <div onClick={hasMultipleEntries ? onClick : undefined}>
          <div className="entry-weight">
            {weight.weight} lbs
            {weight.isAveraged && (
              <span className="entry-badge">
                (avg of {weight.originalEntries})
              </span>
            )}
          </div>
          <div className="entry-date">
            {format(new Date(weight.timestamp), DATE_FORMATS.FULL)}
            {weight.isAveraged ? (
              (() => {
                const dateStr = format(new Date(weight.timestamp), DATE_FORMATS.ISO)
                const dayEntries = getEntriesForDate(dateStr)
                const times = dayEntries.map(entry => format(new Date(entry.timestamp), DATE_FORMATS.TIME))
                const earliestTime = times[times.length - 1]
                const latestTime = times[0]
                return earliestTime === latestTime 
                  ? ` at ${latestTime}`
                  : ` (${earliestTime} - ${latestTime})`
              })()
            ) : (
              ` at ${format(new Date(weight.timestamp), DATE_FORMATS.TIME)}`
            )}
          </div>
        </div>
        <button
          className={`btn btn-icon-only ${hasMultipleEntries ? 'btn-secondary' : 'btn-danger'}`}
          title={hasMultipleEntries ? 'View entries' : 'Delete entry'}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      {/* Expanded individual entries */}
      {isExpanded && (
        <div className="nested-entry-list">
          {getEntriesForDate(weight.date).map((entry) => (
            <div key={entry.id} className="nested-entry-row">
              <div>
                <div className="nested-entry-weight">
                  {entry.weight} lbs
                </div>
                <div className="nested-entry-time">
                  {format(new Date(entry.timestamp), DATE_FORMATS.TIME)}
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.confirm(
                    `⚠️ Delete weight entry?\n\n` +
                    `Weight: ${entry.weight} lbs\n` +
                    `Time: ${format(new Date(entry.timestamp), DATE_FORMATS.TIME)}\n` +
                    `This action cannot be undone.`
                  )) {
                    onDelete(entry.id)
                  }
                }}
                className="btn btn-danger"
                disabled={isLoading}
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
}

