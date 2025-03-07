module voysa_contract::voysa_token {
    use std::string;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID};

    /// The type identifier for our coin
    struct VOYSA has drop {}

    /// Capability that grants permission to mint and burn coins
    struct AdminCap has key { id: UID }

    /// Initialize the coin
    fun init(witness: VOYSA, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency<VOYSA>(
            witness, 
            9, // decimals
            b"VOYSA", // symbol
            b"Voysa Token", // name
            b"Voysa platform token", // description
            option::none(), // icon_url
            ctx
        );
        
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
        transfer::public_transfer(metadata, tx_context::sender(ctx));
        
        // Create and transfer AdminCap to the contract deployer
        transfer::transfer(AdminCap { 
            id: object::new(ctx) 
        }, tx_context::sender(ctx));
    }

    /// Mint new coins
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<VOYSA>, 
        amount: u64, 
        recipient: address, 
        _: &AdminCap,
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }
}

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions


