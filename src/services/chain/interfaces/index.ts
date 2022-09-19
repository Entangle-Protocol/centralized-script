import { ContractNames, EventInfo, SupportedChainIds, TokenInfo } from '@config/interfaces';

export * from './events';
export interface IChainService {
    startEventLoop(): Promise<void>;
}
export interface ICore {
    getFarmChainId(pid: SupportedChainIds): SupportedChainIds;
    getFarmId(pid: SupportedChainIds): number;
    getEvents(o: getEventsOptions): Promise<Partial<GetEventsReturn>>;
    getBlock(): Promise<number>;
    getBlockDelay(): number;
    getContractAddress(contract: ContractNames, chainId?: SupportedChainIds, i?: number): string;
    sendTx(o: SendTxOptions): Promise<SendTxReturn>;
    getChainId(): SupportedChainIds;
    getOpToken(chainId?: SupportedChainIds): TokenInfo;
}

export interface IConnector {
    sendTxRaw(o: SendTxRawOptions): Promise<SendTxRawReturn>;
    getContractEvents(o: GetContractEventsOptions): Promise<EventLog[]>;
    getBlock(chainId: SupportedChainIds): Promise<number>;
}

export type getEventsOptions = {
    fromBlock: number | string;
    toBlock: number | string;
};

export type GetContractEventsOptions = {
    fromBlock: number | string;
    toBlock: number | string;
    address: string;
    chainId: SupportedChainIds;
    eventInfo: EventInfo[];
};

export type GetEventsReturn = {
    [key in ContractNames]: EventLog[] | EventLog[][];
};

export type SendTxOptions = {
    chainId: SupportedChainIds;
    address: string;
    data: Handler;
};

export type SendTxRawOptions = {
    chainId: SupportedChainIds;
    address: string;
    data: Handler;
};

type anyObject = {
    [key: string]: SupportedTypes;
};

type ParamArray = Param<SupportedTypes>[];

export type EventLog<T = anyObject> = {
    eventSignature: string;
    parameters: T;
    chainParametersTypes: {
        [key: string]: string;
    }[];
    address: string;
    data: string;
    topics: string[];
    logIndex: number;
    transactionIndex: number;
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
};

export type SendTxReturn = {
    status: boolean;
    gas?: number;
    hash?: string;
    error?: string;
};

export type SendTxRawReturn = {
    hash: string;
    gas: number;
};

export type Handler = {
    method: string;
    params: Param<SupportedTypes | ParamArray>[];
};

export type Param<T> = {
    name: string;
    chainParamType: string;
    value: T;
};

type SupportedTypes = number | string | bigint;
