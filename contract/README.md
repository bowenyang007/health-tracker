# Health Tracker Smart Contract

A Move smart contract for tracking weight entries on the Aptos blockchain.

## Features

- **Initialize Health Data**: Set up health tracking for a user account
- **Add Weight Entries**: Record weight measurements with automatic timestamps
- **Remove Weight Entries**: Delete specific entries by index or remove the latest entry
- **View Functions**: Query weight data without gas costs

## Contract Functions

### Entry Functions (Require Gas)

1. **`initialize(account: &signer)`**
   - Initializes health data for a user
   - Must be called once per account before adding weight entries

2. **`add_weight(account: &signer, weight_kg: u64)`**
   - Adds a new weight entry with current timestamp
   - `weight_kg`: Weight in kilograms * 1000 (for precision, e.g., 70.5kg = 70500)

3. **`remove_weight(account: &signer, index: u64)`**
   - Removes a weight entry at the specified index
   - Index is 0-based (first entry = 0)

4. **`remove_latest_weight(account: &signer)`**
   - Removes the most recent weight entry

### View Functions (No Gas Required)

1. **`get_weight_entries(account_addr: address): vector<WeightEntry>`**
   - Returns all weight entries for a user

2. **`get_latest_weight(account_addr: address): WeightEntry`**
   - Returns the most recent weight entry

3. **`get_weight_count(account_addr: address): u64`**
   - Returns the number of weight entries

4. **`is_initialized(account_addr: address): bool`**
   - Checks if a user has initialized health data

## Data Structure

```move
struct WeightEntry has copy, drop, store {
    weight: u64,        // Weight in grams (multiply by 1000 for precision)
    timestamp: u64,     // Unix timestamp in seconds
}
```

## Usage Example

```typescript
// Initialize health data (once per account)
await aptosClient.transaction.build.simple({
    sender: account.address,
    data: {
        function: "health_tracker::health_tracker::initialize",
        functionArguments: []
    }
});

// Add weight entry (70.5 kg)
await aptosClient.transaction.build.simple({
    sender: account.address,
    data: {
        function: "health_tracker::health_tracker::add_weight",
        functionArguments: [70500]  // 70.5 kg * 1000
    }
});

// Get all weight entries (view function)
const entries = await aptosClient.view({
    payload: {
        function: "health_tracker::health_tracker::get_weight_entries",
        functionArguments: [account.address]
    }
});
```

## Deployment

1. Install the Aptos CLI
2. Initialize an Aptos account
3. Compile and deploy the contract:

```bash
aptos move compile
aptos move publish
```

## Error Codes

- `E_NOT_INITIALIZED (1)`: Health data not initialized for user
- `E_ALREADY_INITIALIZED (2)`: Health data already initialized
- `E_WEIGHT_NOT_FOUND (3)`: No weight entries found
- `E_INVALID_INDEX (4)`: Invalid index for weight entry 