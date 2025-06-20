module health_tracker::health_tracker {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use std::error;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_WEIGHT_NOT_FOUND: u64 = 3;
    const E_INVALID_INDEX: u64 = 4;

    /// Weight entry structure
    struct WeightEntry has copy, drop, store {
        weight: u64,        // Weight in grams (multiply by 1000 for precision)
        timestamp: u64,     // Unix timestamp
    }

    /// User's health data
    struct HealthData has key {
        weight_entries: vector<WeightEntry>,
    }

    /// Initialize health data for a user
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<HealthData>(account_addr), error::already_exists(E_ALREADY_INITIALIZED));
        
        move_to(account, HealthData {
            weight_entries: vector::empty<WeightEntry>(),
        });
    }

    /// Add a new weight entry
    public entry fun add_weight(
        account: &signer, 
        weight_kg: u64  // Weight in kilograms * 1000 (for precision)
    ) acquires HealthData {
        let account_addr = signer::address_of(account);
        assert!(exists<HealthData>(account_addr), error::not_found(E_NOT_INITIALIZED));
        
        let health_data = borrow_global_mut<HealthData>(account_addr);
        let current_time = timestamp::now_seconds();
        
        let weight_entry = WeightEntry {
            weight: weight_kg,
            timestamp: current_time,
        };
        
        vector::push_back(&mut health_data.weight_entries, weight_entry);
    }

    /// Remove a weight entry by index
    public entry fun remove_weight(
        account: &signer, 
        index: u64
    ) acquires HealthData {
        let account_addr = signer::address_of(account);
        assert!(exists<HealthData>(account_addr), error::not_found(E_NOT_INITIALIZED));
        
        let health_data = borrow_global_mut<HealthData>(account_addr);
        let length = vector::length(&health_data.weight_entries);
        
        assert!(index < length, error::out_of_range(E_INVALID_INDEX));
        
        vector::remove(&mut health_data.weight_entries, index);
    }

    /// Remove the most recent weight entry
    public entry fun remove_latest_weight(account: &signer) acquires HealthData {
        let account_addr = signer::address_of(account);
        assert!(exists<HealthData>(account_addr), error::not_found(E_NOT_INITIALIZED));
        
        let health_data = borrow_global_mut<HealthData>(account_addr);
        let length = vector::length(&health_data.weight_entries);
        
        assert!(length > 0, error::out_of_range(E_WEIGHT_NOT_FOUND));
        
        vector::pop_back(&mut health_data.weight_entries);
    }

    /// Get all weight entries for a user (view function)
    #[view]
    public fun get_weight_entries(account_addr: address): vector<WeightEntry> acquires HealthData {
        assert!(exists<HealthData>(account_addr), error::not_found(E_NOT_INITIALIZED));
        
        let health_data = borrow_global<HealthData>(account_addr);
        health_data.weight_entries
    }

    /// Get the latest weight entry (view function)
    #[view]
    public fun get_latest_weight(account_addr: address): WeightEntry acquires HealthData {
        assert!(exists<HealthData>(account_addr), error::not_found(E_NOT_INITIALIZED));
        
        let health_data = borrow_global<HealthData>(account_addr);
        let length = vector::length(&health_data.weight_entries);
        
        assert!(length > 0, error::out_of_range(E_WEIGHT_NOT_FOUND));
        
        *vector::borrow(&health_data.weight_entries, length - 1)
    }

    /// Get the number of weight entries (view function)
    #[view]
    public fun get_weight_count(account_addr: address): u64 acquires HealthData {
        if (!exists<HealthData>(account_addr)) {
            return 0
        };
        
        let health_data = borrow_global<HealthData>(account_addr);
        vector::length(&health_data.weight_entries)
    }

    /// Check if user has initialized health data (view function)
    #[view]
    public fun is_initialized(account_addr: address): bool {
        exists<HealthData>(account_addr)
    }

    // =============================== UNIT TESTS ===============================

    #[test(account = @0x1)]
    public fun test_initialize_success(account: &signer) acquires HealthData {
        let account_addr = signer::address_of(account);
        
        // Should not be initialized initially
        assert!(!is_initialized(account_addr), 0);
        assert!(get_weight_count(account_addr) == 0, 1);
        
        // Initialize health data
        initialize(account);
        
        // Should be initialized now
        assert!(is_initialized(account_addr), 2);
        assert!(get_weight_count(account_addr) == 0, 3);
    }

    #[test(account = @0x1)]
    #[expected_failure(abort_code = 0x80002, location = Self)] // E_ALREADY_INITIALIZED
    public fun test_initialize_twice_fails(account: &signer) {
        initialize(account);
        initialize(account); // Should fail
    }

    #[test(account = @0x1)]
    public fun test_add_weight_success(account: &signer) acquires HealthData {
        let account_addr = signer::address_of(account);
        
        // Initialize first
        initialize(account);
        
        // Set up timestamp for testing
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        timestamp::update_global_time_for_test_secs(1000);
        
        // Add weight entry
        add_weight(account, 70500); // 70.5 kg
        
        // Check count
        assert!(get_weight_count(account_addr) == 1, 0);
        
        // Check latest weight
        let latest = get_latest_weight(account_addr);
        assert!(latest.weight == 70500, 1);
        assert!(latest.timestamp == 1000, 2);
        
        // Check all entries
        let entries = get_weight_entries(account_addr);
        assert!(vector::length(&entries) == 1, 3);
        
        let first_entry = vector::borrow(&entries, 0);
        assert!(first_entry.weight == 70500, 4);
        assert!(first_entry.timestamp == 1000, 5);
    }

    #[test(account = @0x1)]
    #[expected_failure(abort_code = 0x60001, location = Self)] // E_NOT_INITIALIZED
    public fun test_add_weight_without_initialization_fails(account: &signer) acquires HealthData {
        add_weight(account, 70500); // Should fail
    }

    #[test(account = @0x1)]
    public fun test_add_multiple_weights(account: &signer) acquires HealthData {
        let account_addr = signer::address_of(account);
        
        // Initialize
        initialize(account);
        
        // Set up timestamp
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        timestamp::update_global_time_for_test_secs(1000);
        
        // Add first weight
        add_weight(account, 70500);
        
        // Update timestamp
        timestamp::update_global_time_for_test_secs(2000);
        
        // Add second weight
        add_weight(account, 71000);
        
        // Check count
        assert!(get_weight_count(account_addr) == 2, 0);
        
        // Check latest weight (should be the second one)
        let latest = get_latest_weight(account_addr);
        assert!(latest.weight == 71000, 1);
        assert!(latest.timestamp == 2000, 2);
        
        // Check all entries
        let entries = get_weight_entries(account_addr);
        assert!(vector::length(&entries) == 2, 3);
        
        let first_entry = vector::borrow(&entries, 0);
        assert!(first_entry.weight == 70500, 4);
        assert!(first_entry.timestamp == 1000, 5);
        
        let second_entry = vector::borrow(&entries, 1);
        assert!(second_entry.weight == 71000, 6);
        assert!(second_entry.timestamp == 2000, 7);
    }

    #[test(account = @0x1)]
    public fun test_remove_weight_by_index_success(account: &signer) acquires HealthData {
        let account_addr = signer::address_of(account);
        
        // Initialize and add weights
        initialize(account);
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        timestamp::update_global_time_for_test_secs(1000);
        
        add_weight(account, 70000);
        timestamp::update_global_time_for_test_secs(2000);
        add_weight(account, 71000);
        timestamp::update_global_time_for_test_secs(3000);
        add_weight(account, 72000);
        
        // Should have 3 entries
        assert!(get_weight_count(account_addr) == 3, 0);
        
        // Remove middle entry (index 1)
        remove_weight(account, 1);
        
        // Should have 2 entries now
        assert!(get_weight_count(account_addr) == 2, 1);
        
        // Check remaining entries
        let entries = get_weight_entries(account_addr);
        let first_entry = vector::borrow(&entries, 0);
        let second_entry = vector::borrow(&entries, 1);
        
        // First entry should be unchanged
        assert!(first_entry.weight == 70000, 2);
        assert!(first_entry.timestamp == 1000, 3);
        
        // Second entry should be the former third entry
        assert!(second_entry.weight == 72000, 4);
        assert!(second_entry.timestamp == 3000, 5);
    }

    #[test(account = @0x1)]
    #[expected_failure(abort_code = 0x60001, location = Self)] // E_NOT_INITIALIZED
    public fun test_remove_weight_without_initialization_fails(account: &signer) acquires HealthData {
        remove_weight(account, 0); // Should fail
    }

    #[test(account = @0x1)]
    #[expected_failure(abort_code = 0x20004, location = Self)] // E_INVALID_INDEX
    public fun test_remove_weight_invalid_index_fails(account: &signer) acquires HealthData {
        initialize(account);
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        timestamp::update_global_time_for_test_secs(1000);
        add_weight(account, 70000);
        
        remove_weight(account, 1); // Index 1 doesn't exist, should fail
    }

    #[test(account = @0x1)]
    public fun test_remove_latest_weight_success(account: &signer) acquires HealthData {
        let account_addr = signer::address_of(account);
        
        // Initialize and add weights
        initialize(account);
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        timestamp::update_global_time_for_test_secs(1000);
        
        add_weight(account, 70000);
        timestamp::update_global_time_for_test_secs(2000);
        add_weight(account, 71000);
        
        // Should have 2 entries
        assert!(get_weight_count(account_addr) == 2, 0);
        
        // Latest should be 71000
        let latest_before = get_latest_weight(account_addr);
        assert!(latest_before.weight == 71000, 1);
        
        // Remove latest
        remove_latest_weight(account);
        
        // Should have 1 entry now
        assert!(get_weight_count(account_addr) == 1, 2);
        
        // Latest should now be 70000
        let latest_after = get_latest_weight(account_addr);
        assert!(latest_after.weight == 70000, 3);
        assert!(latest_after.timestamp == 1000, 4);
    }

    #[test(account = @0x1)]
    #[expected_failure(abort_code = 0x60001, location = Self)] // E_NOT_INITIALIZED
    public fun test_remove_latest_weight_without_initialization_fails(account: &signer) acquires HealthData {
        remove_latest_weight(account); // Should fail
    }

    #[test(account = @0x1)]
    #[expected_failure(abort_code = 0x20003, location = Self)] // E_WEIGHT_NOT_FOUND
    public fun test_remove_latest_weight_empty_list_fails(account: &signer) acquires HealthData {
        initialize(account);
        remove_latest_weight(account); // Should fail - no entries to remove
    }

    #[test(account = @0x1)]
    #[expected_failure(abort_code = 0x60001, location = Self)] // E_NOT_INITIALIZED
    public fun test_get_weight_entries_without_initialization_fails(account: &signer) acquires HealthData {
        let account_addr = signer::address_of(account);
        get_weight_entries(account_addr); // Should fail
    }

    #[test(account = @0x1)]
    #[expected_failure(abort_code = 0x60001, location = Self)] // E_NOT_INITIALIZED
    public fun test_get_latest_weight_without_initialization_fails(account: &signer) acquires HealthData {
        let account_addr = signer::address_of(account);
        get_latest_weight(account_addr); // Should fail
    }

    #[test(account = @0x1)]
    #[expected_failure(abort_code = 0x20003, location = Self)] // E_WEIGHT_NOT_FOUND
    public fun test_get_latest_weight_empty_list_fails(account: &signer) acquires HealthData {
        let account_addr = signer::address_of(account);
        initialize(account);
        get_latest_weight(account_addr); // Should fail - no entries
    }

    #[test(account = @0x1)]
    public fun test_complete_workflow(account: &signer) acquires HealthData {
        let account_addr = signer::address_of(account);
        
        // 1. Check initial state
        assert!(!is_initialized(account_addr), 0);
        assert!(get_weight_count(account_addr) == 0, 1);
        
        // 2. Initialize
        initialize(account);
        assert!(is_initialized(account_addr), 2);
        assert!(get_weight_count(account_addr) == 0, 3);
        
        // 3. Set up timestamp
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        // 4. Add multiple weights over time
        timestamp::update_global_time_for_test_secs(1000);
        add_weight(account, 75000); // 75.0 kg
        
        timestamp::update_global_time_for_test_secs(2000);
        add_weight(account, 74500); // 74.5 kg
        
        timestamp::update_global_time_for_test_secs(3000);
        add_weight(account, 74000); // 74.0 kg
        
        // 5. Verify state
        assert!(get_weight_count(account_addr) == 3, 4);
        
        let latest = get_latest_weight(account_addr);
        assert!(latest.weight == 74000, 5);
        assert!(latest.timestamp == 3000, 6);
        
        // 6. Remove middle entry
        remove_weight(account, 1);
        assert!(get_weight_count(account_addr) == 2, 7);
        
        // 7. Verify remaining entries
        let entries = get_weight_entries(account_addr);
        let first = vector::borrow(&entries, 0);
        let second = vector::borrow(&entries, 1);
        
        assert!(first.weight == 75000, 8);
        assert!(first.timestamp == 1000, 9);
        assert!(second.weight == 74000, 10);
        assert!(second.timestamp == 3000, 11);
        
        // 8. Remove latest
        remove_latest_weight(account);
        assert!(get_weight_count(account_addr) == 1, 12);
        
        let final_latest = get_latest_weight(account_addr);
        assert!(final_latest.weight == 75000, 13);
        assert!(final_latest.timestamp == 1000, 14);
    }

    #[test]
    public fun test_weight_entry_precision() {
        // Test weight precision handling
        let weight_1 = 70500; // 70.5 kg
        let weight_2 = 70550; // 70.55 kg
        let weight_3 = 70000; // 70.0 kg
        
        // Verify precision is maintained
        assert!(weight_1 == 70500, 0);
        assert!(weight_2 == 70550, 1);
        assert!(weight_3 == 70000, 2);
        
        // Test conversion logic (would be used in frontend)
        assert!(weight_1 / 1000 == 70, 3); // Integer division
        assert!(weight_2 / 1000 == 70, 4); // Integer division
        assert!(weight_3 / 1000 == 70, 5); // Integer division
    }
} 