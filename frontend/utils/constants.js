// ============================================================================
// APPLICATION CONSTANTS
// ============================================================================
// Centralized constants to avoid magic numbers and strings throughout the app
// ============================================================================

// Chart periods
export const CHART_PERIODS = {
  WEEK: 7,
  MONTH: 30,
  QUARTER: 90
}

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd',
  MEDIUM: 'MM/dd',
  FULL: 'MMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  TIME: 'h:mm a'
}

// Local storage keys
export const STORAGE_KEYS = {
  WEIGHTS: 'healthTracker_weight',
  GOAL: 'healthTracker_weightGoal',
  IS_DEMO_GOAL: 'healthTracker_isDemoGoal'
}

// Demo data configuration
export const DEMO_DATA_CONFIG = {
  START_WEIGHT: 195,
  END_WEIGHT: 170,
  TOTAL_DAYS: 90,
  DEFAULT_GOAL: '165',
  SKIP_PROBABILITY: 0.25, // 25% of days skipped
  MORNING_PROBABILITY: 0.7, // 70% morning weigh-ins
  DAILY_FLUCTUATION: 2.5, // ±1.25 lbs
  WEEKEND_EFFECT: 0.3
}

// UI Messages
export const MESSAGES = {
  CONFIRM_DELETE_ALL: '⚠️ This will delete ALL data (including your manual entries). Are you sure?',
  CONFIRM_RESTORE: (date, count) => 
    `Restore backup from ${date}?\n\nThis will replace all current data with ${count} entries.\n\nContinue?`,
  CONFIRM_REMOVE_DEMO: 'Remove all test data? Your manual entries will be preserved.',
  ERROR_LOADING: 'Error loading data. Please try again.',
  ERROR_SAVING: 'Error saving data. Please try again.',
  ERROR_BACKUP: '❌ Error creating backup.',
  ERROR_RESTORE: '❌ Error restoring backup. Please check the file format.',
  SUCCESS_BACKUP: '✅ Backup downloaded successfully!',
  SUCCESS_RESTORE: (count) => `✅ Data restored! ${count} entries loaded.`,
  SUCCESS_DEMO_ADDED: '✅ Test data added successfully!',
  SUCCESS_DEMO_REMOVED: (count) => `✅ Test data removed! Preserved ${count} manual entries.`,
  WARNING_DEMO_EXISTS: '⚠️ Test data already exists. Remove it first to reload.',
  NO_DATA: 'No data yet. Add your first weight entry to see the chart!'
}

