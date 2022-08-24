import { ContractNames, SupportedChainIds } from '@config/interface';
export interface IChainService {
    startEventLoop(): Promise<void>;
}
export interface ICore {
    getEvents(o: getEventsOptions): Promise<Partial<GetEventsReturn>>;
    getBlock(): Promise<number>;
    getBlockDelay(): number;
}

export interface IConnector {
    sendTx(o: SendTxOptions): Promise<void>;
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
    eventSignature: string[];
};

export type GetEventsReturn = {
    [key in ContractNames]: EventLog[] | EventLog[][];
};

export type SendTxOptions = {
    chainId: number;
};

export type EventLog = {
    address: string;
    data: string;
    topics: string[];
    logIndex: number;
    transactionIndex: number;
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
};
