# Data Service Layer

This directory contains the data persistence abstraction layer for the Health Tracker application. The data service provides a clean interface that allows easy swapping between different storage backends (localStorage, database, API, etc.).

## Architecture

The data service follows the **Repository Pattern**, abstracting data storage operations behind a consistent interface. This allows the UI components to remain unchanged while the underlying storage mechanism can be easily swapped.

## Current Implementation

### LocalStorage (Default)
- File: `dataService.js`
- Uses browser localStorage for data persistence
- No external dependencies
- Perfect for prototyping and local development

### Database (Example)
- File: `databaseDataService.js` 
- Example implementation showing database integration
- Currently falls back to localStorage but includes commented examples
- Shows the pattern for implementing real database operations

## Usage

### Using LocalStorage (Current Default)
```javascript
import { dataService } from '../services/dataService'

// Load data
const weights = await dataService.loadWeights()
const goal = await dataService.loadGoal()

// Save data
await dataService.addWeight(weightEntry)
await dataService.saveGoal('150')
await dataService.deleteWeight(123)
```

### Switching to Database
To switch to database storage, you would:

1. Implement the database methods in `databaseDataService.js`
2. Update your imports:
```javascript
// Instead of:
import { dataService } from '../services/dataService'

// Use:
import { DatabaseDataService } from '../services/databaseDataService'
const dataService = new DatabaseDataService(config)
await dataService.initialize()
```

3. Or create a configuration system:
```javascript
// In your app initialization
import { dataService } from '../services/dataService'

// Configure for database use
dataService.configure('database', {
  host: 'localhost',
  database: 'health_tracker',
  // ... other config
})
```

## API Methods

### Core Data Operations
- `loadWeights()` - Load all weight entries
- `saveWeights(weights)` - Save weight entries array
- `addWeight(weightEntry)` - Add single weight entry
- `deleteWeight(id)` - Delete weight entry by ID
- `loadGoal()` - Load goal weight
- `saveGoal(goal)` - Save goal weight

### Demo Data Operations
- `hasDemoData()` - Check if demo data exists
- `generateWeightLossData()` - Generate realistic 90-day weight loss demo data
- `loadDemoData(generateNew, customWeights, customGoal)` - Load demo data (auto-generates by default)
- `clearDemoData()` - Clear only demo data, preserve manual entries
- `clearAllData()` - Clear all data (nuclear option)

### Configuration
- `configure(type, config)` - Configure storage backend

## Benefits of This Architecture

1. **Easy Migration**: Switch from localStorage to database with minimal code changes
2. **Testing**: Easy to mock data service for unit tests
3. **Multiple Environments**: Different storage for dev/staging/production
4. **Offline Support**: Can implement caching layers
5. **Error Handling**: Centralized error handling for all data operations
6. **Performance**: Can add caching, batching, etc. in the service layer

## Future Storage Options

This architecture makes it easy to implement:

- **PostgreSQL/MySQL**: Traditional relational database
- **MongoDB**: Document database
- **Supabase**: Backend-as-a-service
- **Firebase**: Google's backend platform  
- **REST API**: External API endpoints
- **IndexedDB**: Browser-based database for offline support
- **Hybrid**: localStorage + cloud sync

## Example Database Schema

```sql
-- Weight entries table
CREATE TABLE weight_entries (
  id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL,
  weight DECIMAL(5,1) NOT NULL,
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  is_demo_data BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY,
  goal_weight DECIMAL(5,1),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Migration Guide

When you're ready to move from localStorage to a database:

1. Set up your database and tables
2. Implement the database methods in `DatabaseDataService`
3. Test with existing data
4. Update your app to use the new service
5. Optionally: implement a migration script to move localStorage data to database

The beauty of this architecture is that your React components don't need to change at all!

## Demo Data Integration

The data service includes comprehensive demo data functionality:

### Realistic Demo Data Generation
```javascript
// Generate 90 days of realistic weight loss data (195 → 170 lbs)
const demoData = dataService.generateWeightLossData()

// Load demo data (generates automatically)
const result = await dataService.loadDemoData()

// Load custom demo data
const result = await dataService.loadDemoData(false, customWeights, '150')
```

### Features:
- **Realistic patterns**: Natural daily fluctuations, plateaus, and "whoosh" effects
- **Variable timing**: Morning and evening weigh-ins with realistic times
- **Safe merging**: Preserves existing manual entries
- **Smart goal handling**: Only sets demo goal if user doesn't have one
- **Clear identification**: All demo entries marked with `isDemoData: true`

### Demo Data Management
```javascript
// Check if demo data exists
const hasDemo = await dataService.hasDemoData()

// Clear only demo data (safe)
const result = await dataService.clearDemoData()
console.log(`Preserved ${result.manualEntriesPreserved} manual entries`)

// Clear everything (nuclear option)
await dataService.clearAllData()
```

This makes the app immediately useful for demos and testing while keeping the data layer clean and organized. 