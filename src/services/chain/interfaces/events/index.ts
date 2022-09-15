import { SupportedChainIds } from '@config/interfaces';
import { Handler, Param } from '..';

export type EventAEvent = {
    type: string;
    amount: bigint;
    pid: SupportedChainIds;
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

export interface EventASellHandler extends Handler {
    params: [];
}

export type DepositEvent = {
    amount: bigint;
    opId: number;
    type: string;
};

export interface DepositHandler extends Handler {
    params: [];
}

export type MintDepositEvent = {
    opId: number;
};

export interface MintDepositHandler extends Handler {
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
    DepositToDEX
}
