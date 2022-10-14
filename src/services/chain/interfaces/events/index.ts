import { SupportedChainIds } from '@config/interfaces';
import { Handler, Param, ParamArray } from '..';

export type EventAEvent = {
    eventType: string; //Buy Sell
    amount: bigint; //amoun op token
    pid: SupportedChainIds; //farmPid
};

export type EventBCEvent = {
    eventType: string; //Buy Sell
    amount: bigint; //amoun op token
    pid: SupportedChainIds; //farmPid
    user: string; //User address
};

export type EventBPossibilty = {
    possible: boolean;
    lender?: string;
    farmId?: number;
};

export interface LoanHandler<T extends ParamArray = LoanData> extends Handler {
    params: [
        Param<number>, //amount
        Param<string>, //token
        Param<string>, //lender
        Param<T> //data
    ];
}

type LoanData = [
    Param<number> //opId
];

export interface FreezeHandler<T extends ParamArray = FreezeData> extends Handler {
    params: [
        Param<number>, //amount
        Param<T> //data
    ];
}

type FreezeData = [
    Param<number> //opId
];

export interface BridgeHandler<T extends ParamArray = BridgeData> extends Handler {
    params: [
        Param<string>, //token
        Param<string>, //to
        Param<bigint>, //amount
        Param<SupportedChainIds>, //toChainId
        Param<string>, //anycallProxy
        Param<T> //data
    ];
}

type BridgeData = [
    Param<number> //opId
];

export interface WithdrawHandler<T extends ParamArray = WithdrawData> extends Handler {
    params: [
        Param<number>, //pid
        Param<string>, //tokenFrom
        Param<bigint>, //amount
        Param<T>
    ];
}

type WithdrawData = [
    Param<number> //opid
];

export type DepositEvent = {
    amount: bigint;
    opId: number;
    type: string;
};

export interface DepositToChefHandler extends Handler {
    params: [
        Param<number>, //pid
        Param<string>, //tokenFrom
        Param<bigint>, //amount
        Param<DepositToChefData> //data
    ];
}

type DepositToChefData = [
    Param<number> //opId
];

export interface DepositToDEXHandler extends Handler {
    params: [
        Param<DepositToDEXData> //data
    ];
}

type DepositToDEXData = [
    Param<number> //opId
];

export type MintDepositEvent = {
    opId: number;
    amount: bigint;
};

export interface MintHandler extends Handler {
    params: [
        Param<SupportedChainIds>, //farm chainId
        Param<string>, //farm synthChef address
        Param<number>, // farm pid
        Param<bigint>, //amount
        Param<string> //to
    ];
}

export type BurnWithdrawEvent = {
    opId: number;
    amount: bigint;
};

export interface BurnHandler extends Handler {
    params: [
        Param<SupportedChainIds>, //farm chainId
        Param<string>, //farm synthChef address
        Param<number>, // farm pid
        Param<bigint>, //amount
        Param<string> //to
    ];
}

export enum RebalancingEventType {
    Buy = 'BUY',
    Sell = 'SELL'
}

export enum RebalancingEvent {
    A = 'A',
    B = 'B',
    C = 'C'
}

export enum DepositEventType {
    DepositToChef,
    DepositToDEX,
    DepositToWallet
}

export interface BalanceOfHandler extends Handler {
    params: [
        Param<string> //address
    ];
}
