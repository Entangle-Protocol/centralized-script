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
#### Methods:
    bridgeToChain(
            address token,
            string memory to,
            uint256 amount,
            uint256 toChainID,
            string memory anycallProxy,
            bytes calldata data
        )
6. POOL: Deposit fires
7. Backend script catches event
8. Ask Router to deposit liquidity to SynthChef (send Tx to Router)  
#### Methods:
    depositFromPool(
            uint256 pid,
            uint256 amount,
            uint256 poolID
        )
9. ROUTER: Deposit fires
10. Backend script catches event
11. Ask SynthFactory to mint synths to IDEX (send Tx to SynthFactory or Router)  
#### Methods
    mint(
            uint256 _chainId,
            address _synthChef,
            uint256 _pid,
            uint256 _amount,
            address _to
        )

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
1. Router on chain X checks if it is enough liquidity on IDEX
2. It is enough liq to provide USDC for user, but after trade there wolud not be enough
3. ROUTER: EventA {type: 'Sell'} fires / Router recieves SynthLPs and freeze them.
4. Backend script catches event
5. Ask Router on chain X to withdraw USDC on chain Y  
#### Methods
    withdraw(
            uint256 pid,
            uint256 amountSynth,
            uint256 poolID
        )

6. SYNTHCHEF: Withdraw
7. 
- Ask Router on chain Y to bridge USDC to chain X 
- burn synths on chain X  
#### Methods
    bridgeToChain
    burn(
            uint256 _chainId,
            address _synthChef,
            uint256 _pid,
            uint256 _amount
            address _from,
        )
8. POOL chain X: Deposit
9. Backend catches event
10. Ask Pool to deposit IDEX  
#### Methods
    withdrawToken(uint256 amount, address to)

Rebalancing ends!  
### Events:
ROUTER:
- EventA {type: 'Sell'}

SYNTHCHEF:
- Withdraw

POOL:
- Deposit {type: 'DepositToDEX'}
---

### Event B Buy: 
1. User sends USDC to Router to lock them.
2. ROUTER: EventBC
3. Backend script catches event
4. Backend checks if we can loan somewhere, calculate amount of assets to loan
5. 
- Ask Router to loan USDC from IDEX and SynthChef? and deposit them to SynthChef (send tx to Router on chain Y) 
- Ask Router to freeze SynthLPs (send tx to Router on chain X) ?
#### Methods
    withdraw
    loan(uint256 amount, uint256 opId)
    freezeLps(uint256 amount)

6. SYNTHCHEF: Withdraw?, Deposit
7. Backend script catches events
8. 
- Ask SynthFactory to mint SynthLPs to user 
- Ask Router to bridge USDC to chain Y (send txs to SynthFactory, Router on chain X)
- Ask SynthFactory to burn SynthLps ?
#### Methods
    mint
    bridgeToChain
    burn

9. POOL: Deposit
10. Backend script catches event
11. 
- Ask Router to pay back loans 
- Ask Router to deposit USDC to SynthChef
#### Methods
    repay(uint256 amount, uint256 opId)
    depositFromPool

12. SYNTHCHEF: Deposit, ?Deposit
13. Backend script catches Events
14. 
- Ask SynthFactory to mint synth to IDEX  
- Ask SynthFactory to mint synth to lender IDEX ?
#### Methods
    mint
    mint

Rebalancing ends!
### Events
ROUTER:
- EventBC {type: 'Buy'}

SYNTHCHEF:
- Withdraw?
- Deposit

POOL:
- Deposit {type: 'Loan'}
___

### Event B Sell: 
1. User sends SynthLPs to Router to lock them.
2. ROUTER: EventBC
3. Backend script catches event
4. Backend checks if we can loan somewhere, calculate amount of assets to loan
5. 
- ? Ask Router to freeze SynthLPs (send tx to Router on chain Y) 
- Ask Router to loan USDC from IDEX and SynthChef? and send them to user (send tx to Router on chain X) 
- Ask Router to Withdraw LPs from SynthChef on chain Y (send tx to Router on chain Y)
#### Methods
    freezeLps(uint256 amount)
    loan
    withdraw
6. 
    - SYNTHCHEF chain X: Withdraw? 
    - SYNTHCHEF chain Y: Withdraw
7. Backend script catches events

8. 
- Ask SynthFactory to burn synthLPs (send tx to Factory on chain X)
- Ask Router to bridge USDC (send tx to Router on chain Y)
#### Methods
    burn
    bridgeToChain
    
9. POOL: Deposit
10. Backend script catches Events
11. 
- Ask Pool to deposit IDEX
- Ask Router to pay back loan
#### Methods
    withdrawToken
    repay

12. SYNTHCHEF: Deposit?
13. Backend script catches Events
14. Ask SynthFactory to mint SynhLPs to IDEX
#### Methods
    mint

Rebalancing ends!
### Events
ROUTER:
- EventBC {type: 'Sell'}

SYNTHCHEF:
- Withdraw?
- Deposit

POOL:
- Deposit {type: 'DepositToDEX & Loan'}
___
### Event С Buy:
1. Router on chain X checks if its enough liquidity on IDEX
2. ROUTER: EventBC
3. Backend script catches event
4. Ask Router to move USDC to bridging protocol (send Tx to Router on chain X)  
#### Methods
    bridgeToChain

5. POOL: Deposit fires
6. Backend script catches event
7. Ask Router to deposit liquidity to SynthChef (send Tx to Router on chain Y)  
#### Methods
    depositFromPool

8. SYNTHCHEF: Deposit fires
9. Backend script catches event
10. Ask SynthFactory to mint synths to IDEX (send Tx to SynthFactory or Router on chain X)  
#### Methods
    mint

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
#### Methods
    withdraw

5. SYNTHCHEF: Withdraw
6. Backend script catches events
7. Ask SynthFactory on chain Y to burn synth from Router / Ask Router on chain Y to bridge USDC  
#### Methods
    burn
    bridgeToChain

8. SynthFactory burns lps / USDC bridges to Pool on chain X
9. POOL: Deposit {type: 'DepositToWallet'}
10. Backend script catches event
11. Ask Pool to send USDC to user wallet  
#### Methods
    withdrawToken

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
IRouter {
    IEventA {
        type: string | bytes32[] //type of event: Buy || Sell
        amount: number | uint256 //amount of USDC/SynhLp to rebalance
        pid: number | uint256 //pid of farm which rebalance
    }
    
    IEventBC {
        type: string | bytes32[]; //type of event: Buy || Sell
        amount: uint256; //amount token to exchange (USDC or SynthLP)
        pid: number | uint256 //pid of farm which rebalance
        user: address; //address to delivery USDC or SynthLPs
    }

    bridgeToChain(
        address token,
        string memory to,
        uint256 amount,
        uint256 toChainID,
        string memory anycallProxy,
        bytes calldata data
    )

    depositFromPool(
        uint256 pid,
        uint256 amount,
        uint256 poolID
    )

    repay(uint256 amount, uint256 opId)

    loan(uint256 amount, uint256 opId)

}
```
### Pool
<!-- - BridgeDepositEvent - Event fires when USDC came to the contract. -->
- Deposit - Event fires when USDC came to the contract.
```js
IPool {
    IDeposit {
        amount: number | uint256; //amount of USDC 
        opId: number | uint256; //unique Operation id;
        type: string | bytes32; //type of deposit
    }

    withdrawToken(uint256 amount, address to)
}
```
### SynthChef
- Deposit - Event fires when USDC was successfuly deposited to farm.
- Withdraw - Event fires when USDC was successfuly withdrawed from farm.
```js
ISynthChef {
    IDeposit {
        opId: number | uint256; //unique Operation id;
        amount: number | uint256; //amount of USDC 
    }
    IWithdraw {
        opId: number | uint256; //unique Operation id;
        amount: number | uint256; //amount of USDC 
    }

    deposit(
        uint256 pid,
        uint256 amountUSDC,
        uint256 poolID
    )

    withdraw(
        uint256 pid,
        uint256 amountSynth,
        uint256 poolID
    )
}
```
### SynthFactory
```js
IFactory {
    mint(
        uint256 _chainId,
        address _synthChef,
        uint256 _pid,
        uint256 _amount,
        address _to
    )

    burn(
        uint256 _chainId,
        address _synthChef,
        uint256 _pid,
        uint256 _amount
        address _from,
    )
}
```