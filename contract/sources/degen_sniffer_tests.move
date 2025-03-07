#[test_only]
module suidegen_sniffer::degen_sniffer_tests {
    use suidegen_sniffer::degen_sniffer::{Self, SnifferAdmin, SnifferStorage};
    use sui::test_scenario;
    use sui::test_utils::assert_eq;

    #[test]
    fun test_basic_analysis() {
        let admin = @0xA;
        let user = @0xB;
        let token_address = @0xC;

        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;
        
        // Initialize the module
        {
            degen_sniffer::init(test_scenario::ctx(scenario));
        };
        
        // Check that the admin and storage were created
        test_scenario::next_tx(scenario, admin);
        {
            assert!(test_scenario::has_most_recent_for_sender<SnifferAdmin>(scenario), 0);
            assert!(test_scenario::has_most_recent_shared<SnifferStorage>(), 1);
        };
        
        // Analyze a token
        test_scenario::next_tx(scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<SnifferAdmin>(scenario);
            let storage = test_scenario::take_shared<SnifferStorage>(scenario);
            
            degen_sniffer::analyze_token(&admin_cap, &mut storage, token_address, test_scenario::ctx(scenario));
            
            test_scenario::return_to_sender(scenario, admin_cap);
            test_scenario::return_shared(storage);
        };
        
        // Get and verify the analysis
        test_scenario::next_tx(scenario, user);
        {
            let storage = test_scenario::take_shared<SnifferStorage>(scenario);
            let (fraud, cook, _, _) = degen_sniffer::get_token_analysis(&storage, token_address);
            
            // Just verify that the scores are within the valid range
            assert!(fraud <= 100, 2);
            assert!(cook <= 100, 3);
            
            test_scenario::return_shared(storage);
        };

        test_scenario::end(scenario_val);
    }
}