module voysa::token_events {
    use sui::event;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};

    // Event emitted when a new token is launched
    struct TokenLaunchEvent has copy, drop {
        token_name: String,
        token_symbol: String,
        contract_address: address,
        launch_time: u64,
        token_type: String, // "DeFi", "NFT", "Gaming", etc.
    }

    // Event emitted when a new protocol is deployed
    struct ProtocolDeployEvent has copy, drop {
        protocol_name: String,
        contract_address: address,
        deploy_time: u64,
        protocol_type: String, // "DEX", "Lending", "Yield", etc.
    }

    // Registry to keep track of platform state
    struct Registry has key {
        id: UID,
        token_count: u64,
        protocol_count: u64,
    }

    // Initialize the registry
    fun init(ctx: &mut TxContext) {
        let registry = Registry {
            id: object::new(ctx),
            token_count: 0,
            protocol_count: 0,
        };
        
        sui::transfer::share_object(registry);
    }

    // Function to emit a token launch event
    public entry fun emit_token_launch(
        registry: &mut Registry,
        token_name: vector<u8>,
        token_symbol: vector<u8>,
        token_type: vector<u8>,
        ctx: &mut TxContext
    ) {
        registry.token_count = registry.token_count + 1;

        event::emit(TokenLaunchEvent {
            token_name: string::utf8(token_name),
            token_symbol: string::utf8(token_symbol),
            contract_address: tx_context::sender(ctx),
            launch_time: tx_context::epoch(ctx),
            token_type: string::utf8(token_type),
        });
    }

    // Function to emit a protocol deployment event
    public entry fun emit_protocol_deploy(
        registry: &mut Registry,
        protocol_name: vector<u8>,
        protocol_type: vector<u8>,
        ctx: &mut TxContext
    ) {
        registry.protocol_count = registry.protocol_count + 1;

        event::emit(ProtocolDeployEvent {
            protocol_name: string::utf8(protocol_name),
            contract_address: tx_context::sender(ctx),
            deploy_time: tx_context::epoch(ctx),
            protocol_type: string::utf8(protocol_type),
        });
    }
}