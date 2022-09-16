# Centralized script
____
## Description
Centralized script for Entangle Synth rebalancing system.
___
## Folder overview

### src/services/
Main script services

### src/services/config/
All services configuration

### src/services/chain/
Chain worker logic
### src/services/rebalancer/
Rebalancing data overviewer
___
## Rebalancing events
### Event A Buy:
1. Router checks if it is enough liquidity on IDEX
2. It is enough liq to provide synths for user, but after trade there would not be enough
3. ROUTER: EventA {type: 'Buy'} fires
4. Backend script catches event
5. Sends USDC from IDEX on chain X via Bridge protocol to Liquidity pool on chain Y (send Tx to Router to start bridging)
6. POOL: Deposit fires
7. Backend script catches event
8. Ask Router to deposit liquidity to SynthChef (send Tx to Router)
9. ROUTER: Deposit fires
10. Backend script catches event
11. Ask SynthFactory to mint synths to IDEX (send Tx to SynthFactory or Router)  
Rebalancing ends!  
### Events:  
ROUTER:  
- EventA {type: 'Buy'}

SYNTHCHEF:  
- Deposit

POOL:
- Deposit {type: 'DepositToChef'}  
---
### Event A Sell:
0. IDEX sends synths to Router to lock them.
1. Router on chain X checks if it is enough liquidite on IDEX
2. It is enough liq to provide USDC for user, but after trade there wolud not be enough
3. ROUTER: EventA {type: 'Sell'} fires
4. Backend script catches event
5. Ask Router on chain X to withdraw USDC on chain Y
6. SYNTHCHEF: Withdraw
7. Ask Router on chain Y to bridge USDC to chain X / burn synths on chain X 
8. POOL chain X: Deposit
9. Backend catches event
10. Ask Pool to deposit IDEX
Rebalancing ends!  
### Events:
ROUTER:
- EventA {type: 'Sell'}

SYNTHCHEF:
- Withdraw

POOL:
- Deposit {type: 'DepositToDEX'}
---
### Event С Buy:
1. Router on chain X checks if its enough liquidity on IDEX
2. ROUTER: EventC
3. Backend script catches event
4. Ask Router to move USDC to bridging protocol (send Tx to Router)
5. POOL: Deposit fires
6. Backend script catches event
7. Ask Router to deposit liquidity to SynthChef (send Tx to Router)
8. SYNTHCHEF: Deposit fires
9. Backend script catches event
10. Ask SynthFactory to mint synths to IDEX (send Tx to SynthFactory or Router)

### Events:
ROUTER:
- EventC {type: 'Buy'}

SYNTHCHEF:
- Deposit

POOL:
- Deposit {type: 'DepositToChef'}
---
### Event C Sell:
0. User sends synths to Router
1. Router on chain X checks if its enough liquidity on IDEX
2. ROUTER: EventC
3. Backend script catches event, calculates how much liquidity to withdraw
4. Ask Router on chain Y to withdraw liquidity from SynthChef (send Tx to Router on chain Y)
5. SYNTHCHEF: Withdraw
6. Backend script catches events
7. Ask SynthFactory on chain Y to burn synth from Router / Ask Router on chain Y to bridge USDC
8. SynthFactory burns lps / USDC bridges to Pool on chain X
9. POOL: Deposit {type: 'DepositToWallet'}
10. Backend script catches event
11. Ask Pool to send USDC to user wallet
12. User gets USDC
### Events:
ROUTER:
- EventC {type: 'Sell'}

SYNTHCHEF: 
- Withdraw

POOL:
- Deposit {type: 'DepositToWallet'}
---

## Contract events

### Router
- EventA - Event fires when IDEX is needed rebalancing scenario A.
- EventBC - Event fires when IDEX is needed rebalancing scenario B or C.
```js
IEventA {
    type: string | bytes32[] //type of event: Buy || Sell
    amount: number | uint256 //amount of USDC/SynhLp to rebalance
    pid: number | uint256 //pid of farm which rebalance
}

IEventBC {
    type: string | bytes32[]; //type of event: Buy || Sell
    user: address; //address to delivery USDC or SynthLPs
    amount: uint256; //amount token to exchange (USDC or SynthLP)
    pid: number | uint256 //pid of farm which rebalance
}
```
### Pool
<!-- - BridgeDepositEvent - Event fires when USDC came to the contract. -->
- Deposit - Event fires when USDC came to the contract.
```js
IDeposit {
    amount: number | uint256; //amount of USDC 
    opId: number | uint256; //unique Operation id;
}
```
### SynthChef
- Deposit - Event fires when USDC was successfuly deposited to farm.
- Withdraw - Event fires when USDC was successfuly withdrawed from farm.
```js
IDeposit {
    opId: number | uint256; //unique Operation id;
    amount: number | uint256; //amount of USDC 
}
IWithdraw {
    opId: number | uint256; //unique Operation id;
    amount: number | uint256; //amount of USDC 
}
```
