import { SupportedChainIds } from '@config/interfaces';
import { Handler, Param } from '..';

export type EventAEvent = {
    type: string; //Buy Sell
    amount: bigint; //amoun op token
    pid: SupportedChainIds; //farmPid
};

export interface EventABuyHandler extends Handler {
    params: [
        Param<string>, //token
        Param<string>, //to
        Param<bigint>, //amount
        Param<SupportedChainIds>, //toChainId
        Param<string>, //anycallProxy
        Param<EventABuyData> //data
    ];
}

type EventABuyData = [
    Param<number> //opId
];

export interface EventASellFreezeHandler extends Handler {
    params: [
        Param<number>, //opId
        Param<bigint> //amount
    ];
}

export interface EventASellWithdrawHandler extends Handler {
    params: [
        Param<number>, //pid
        Param<string>, //tokenFrom
        Param<bigint>, //amount
        Param<EventASellWithdrawData>
    ];
}

type EventASellWithdrawData = [
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

export interface MintDepositHandler extends Handler {
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
};

export interface BurnWithdrawHandler extends Handler {
    params: [];
}

export enum RebalancingEventType {
    Buy = 'Buy',
    Sell = 'Sell'
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
