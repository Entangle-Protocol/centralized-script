import { ChainContracts } from '../../../../config/interface';
import { Contract, EventData } from 'web3-eth-contract';
import {
    Config,
    Network,
    SupportedChainIds,
    Farm,
    ContractNames
} from '../../../../config/interface';

export type ContractsKeys = keyof ChainContracts;

export type CompiledFarm = {
    pid: number;
    chainId: SupportedChainIds;
    contracts: Partial<CompiledContracts>;
};
export type CompiledContracts = {
    [key in ContractsKeys]: Contract | Contract[];
};

export type Handler = {
    handler: () => Promise<void>;
    contractName: ContractNames;
};

export type EventHandler = {
    [key: string]: Handler;
};

export type ChainEvents = {
    [key in ContractNames]?: EventData[] | EventData[][];
};

export { Config, Network, SupportedChainIds, Farm, ContractNames, Contract };
