module health_tracker::health_tracker {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NO_DATA: u64 = 3;

    /// Health data entry structure
    struct HealthEntry has copy, drop, store {
        weight: u64,        // Weight in grams (multiply by 10 for 1 decimal place)
        date: u64,          // Unix timestamp
        data_json: String,  // Additional data as JSON string
    }

    /// User's health data resource
    struct HealthData has key {
        entries: vector<HealthEntry>,
    }

    /// Initialize health data storage for a user
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<HealthData>(account_addr), E_ALREADY_INITIALIZED);
        
        move_to(account, HealthData {
            entries: vector::empty<HealthEntry>(),
        });
    }

    /// Store a single health data entry
    public entry fun store_health_data(
        account: &signer,
        weight: u64,
        date: u64,
        data_json: String
    ) acquires HealthData {
        let account_addr = signer::address_of(account);
        
        // Initialize if not exists
        if (!exists<HealthData>(account_addr)) {
            initialize(account);
        };

        let health_data = borrow_global_mut<HealthData>(account_addr);
        let entry = HealthEntry {
            weight,
            date,
            data_json,
        };
        
        vector::push_back(&mut health_data.entries, entry);
    }

    /// Load demo data (90 days of weight tracking)
    public entry fun load_demo_data(
        account: &signer,
        demo_data_json: String
    ) acquires HealthData {
        let account_addr = signer::address_of(account);
        
        // Initialize if not exists
        if (!exists<HealthData>(account_addr)) {
            initialize(account);
        };

        let health_data = borrow_global_mut<HealthData>(account_addr);
        
        // For simplicity, we'll store the demo data as a single entry
        // In a real implementation, you might parse the JSON and create individual entries
        let demo_entry = HealthEntry {
            weight: 17000, // 170.0 lbs in grams * 10
            date: timestamp::now_microseconds() / 1000000, // Convert to seconds
            data_json: demo_data_json,
        };
        
        vector::push_back(&mut health_data.entries, demo_entry);
    }

    /// Clear all health data
    public entry fun clear_health_data(account: &signer) acquires HealthData {
        let account_addr = signer::address_of(account);
        assert!(exists<HealthData>(account_addr), E_NOT_INITIALIZED);
        
        let health_data = borrow_global_mut<HealthData>(account_addr);
        health_data.entries = vector::empty<HealthEntry>();
    }

    /// Get the number of health entries
    #[view]
    public fun get_entry_count(account_addr: address): u64 acquires HealthData {
        if (!exists<HealthData>(account_addr)) {
            return 0
        };
        
        let health_data = borrow_global<HealthData>(account_addr);
        vector::length(&health_data.entries)
    }

    /// Get a health entry by index
    #[view]
    public fun get_health_entry(account_addr: address, index: u64): (u64, u64, String) acquires HealthData {
        assert!(exists<HealthData>(account_addr), E_NOT_INITIALIZED);
        
        let health_data = borrow_global<HealthData>(account_addr);
        assert!(index < vector::length(&health_data.entries), E_NO_DATA);
        
        let entry = vector::borrow(&health_data.entries, index);
        (entry.weight, entry.date, entry.data_json)
    }

    /// Check if user has health data
    #[view]
    public fun has_health_data(account_addr: address): bool acquires HealthData {
        if (!exists<HealthData>(account_addr)) {
            return false
        };
        
        let health_data = borrow_global<HealthData>(account_addr);
        vector::length(&health_data.entries) > 0
    }

    #[test_only]
    use aptos_framework::account;

    #[test(account = @0x1)]
    public entry fun test_initialize(account: signer) {
        initialize(&account);
        assert!(exists<HealthData>(signer::address_of(&account)), 0);
    }

    #[test(account = @0x1)]
    public entry fun test_store_and_retrieve(account: signer) acquires HealthData {
        let account_addr = signer::address_of(&account);
        
        store_health_data(&account, 17500, 1234567890, string::utf8(b"test data"));
        
        assert!(get_entry_count(account_addr) == 1, 0);
        let (weight, date, data) = get_health_entry(account_addr, 0);
        assert!(weight == 17500, 1);
        assert!(date == 1234567890, 2);
        assert!(data == string::utf8(b"test data"), 3);
    }
} 