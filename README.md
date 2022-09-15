# Centralized script
____
## Description
Centralized script for Entangle Synth rebalancing system.

## Folder overview

### src/services/
main script services

### src/services/config/
all services configuration

### src/services/eth/
Ethereum module

### src/services/elrond/
Elrond module

### src/services/core/
Main rebalancing logic

```
/**
     * Event A Buy:
     * 1. Router checks if it is enough liquidity on IDEX
     * 2. It is enough liq to provide synths for user, but after trade there would not be enough
     * 3. ROUTER: EventA fires
     * 4. Backend script catches event
     * 5. Sends USDC from IDEX on chain X via Bridge protocol to Liquidity pool on chain Y (send Tx to Router to start bridging)
     * 6. POOL: Deposit fires
     * 7. Backend script catches event
     * 8. Ask Router to deposit liquidity to SynthChef (send Tx to Router)
     * 9. ROUTER: MintDepositEvent fires
     * 10. Backend script catches event
     * 11. Ask SynthChef to mint synths to IDEX (send Tx to SynthChef or Router)
     * Rebalancing ends!
     * Events:
     *  ROUTER:
     *      EventA
     *      MintDepositEvent
     *  POOL:
     *      Deposit {type: 'DepositToChef'}
     *
     * Event A Sell:
     * 1. Router on chain X checks if it is enough liquidite on IDEX
     * 2. It is enough liq to provide USDC for user, but after trade there wolud not be enough
     * 3. ROUTER: DexRebalancingEvent fires
     * 4. Backend script catches event
     * 5. Ask Router on chain X to burn synth lps and withdraw USDC
     * 6. ROUTER/SYNTHCHEF: WithdrawEvent
     * 7. Ask Router on chain Y to withdraw USDC to Pool and bridge to chain X and burn synths on chain X (1 external function call)
     * 8. ROUTER chain Y: BurnSynth event
     * 9. POOL chain X: Deposit, and deposit USDC to IDEX
     * 9a. Backend catches event
     * 10a. Ask Pool to deposit IDEX
     * Rebalancing ends!
     * Events:
     *      ROUTER:
     *          DexRebalancingEvent
     *          WithdrawEvent?
     *          BurnSynth
     *      SYNTHCHEF:
     *          WithdrawEvent?
     *      POOL:
     *          Deposit {type: 'DepositToDEX'}
     *
     * Event С Buy:
     * 1. Router on chain X checks if its enough liquidity on IDEX
     *
     * 2. ROUTE/IDEX: eventC/BridgeEvent
     * 2.1. Backend script catches event
     * 2.2. Ask Router to move USDC to bridging protocol (send Tx to Router)
     *
     * 2a. Router moves USDC to bridging protocol
     * 3. POOL: BridgeDepositEvent fires
     * 4. Backend script catches event
     * 5. Ask Router to deposit liquidity to SynthChef (send Tx to Router)
     * 6. ROUTER: MintDepositEvent fires
     * 7. Backend script catches event
     * 8. Ask SynthChef to mint synths to IDEX (send Tx to SynthChef or Router)
     * Events:
     *      ROUTER:
     *          eventC/BridgeEvent?
     *          MintDepositEvent
     *      IDEX:
     *          eventC/BridgeEvent?
     *      POOL:
     *          Deposit {type: 'DepositToChef'}
     *
     * Event C Sell:
     * 1. Router on chain X checks if its enough liquidity on IDEX
     * 2. ROUTE/IDEX: eventC/WithdrawEvent
     * 3. Backend script catches event, calculates how much liquidity to withdraw
     * 4. Ask Router on chain Y to withdraw liquidity from SynthChef (send Tx to Router on chain Y)
     * 5. ROUTER: BurnWithdrawEvent, BridgeEvent
     * 6. Backend script catches events
     * 7. Ask SynthFactory on chain Y to burn synth from wallet / Ask Router on chain Y to bridge USDC
     * 8. SynthFactory burns lps / USDC bridges to Pool on chain X
     * 9. POOL: DepositTransferEvent
     * 10. Backend script catches event
     * 11. Backend script waits until SynthFactory burns lps
     * 12. Ask Pool to send USDC to user wallet
     * 10. User gets USDC
     * Events:
     *      ROUTER:
     *          eventC/WithdrawEvent
     *          BurnWithdrawEvent, BridgeEvent
     *      IDEX: eventC/WithdrawEvent
     *      POOL:
     *          DepositTransferEvent
     */
```
## Contract events

### Router
- DexRebalancingEvent - Event fires when IDEX is needed rebalancing.
- MintDepositEvent - Event fires when SynthChef successfuly deposits USDC on farm.
- eventC/BridgeEvent - Event fires when there is no options to get liq for user and we need to bridge user's USDC to mint synths..
- eventC/WithdrawEvent - Event fires when there is no options to get liq for user and we need to withdraw USDC to burn synths
```js
IEventA {
    type: string | bytes32[] //type of event: Buy || Sell
    amount: number | uint256 //amount of USDC/SynhLp to rebalance
    pid: number | uint256 //pid of farm which rebalance
}

IEventB {
    type: string | bytes32[] //type of event: Buy || Sell

}

IEventC {
    type: string | bytes32[]; //type of event: Buy || Sell
    user: address; //address to delivery USDC or SynthLPs
    amount: uint256; //amount token to exchange (USDC or SynthLP)
}
```
### Pool
<!-- - BridgeDepositEvent - Event fires when USDC came to the contract. -->
- Deposit - Event fires when USDC came to the contract.
```js
IDeposit {
    amount: number | uint256; //amount of USDC 
    opId: number | uint256; //unique Operation id;
    type: string | bytes32; //type of deposit
}
```
