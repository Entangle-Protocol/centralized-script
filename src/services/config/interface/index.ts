import { AbiItem } from 'web3-utils';
import type { Option } from 'option.ts';

export type SupportedChainIds = 250 | 1 | 56 | 43114;
export type ChainType = 'evm' | 'elrond';

export type Config = {
    farms: Farm[];
    networks: {
        [key in SupportedChainIds]?: Network;
    };
};

export type ChainContracts = {
    chef: ContractInfo;
    factory: Option<ContractInfo>;
    dexes: ContractInfo[];
    router: Option<ContractInfo>;
    loan: Option<ContractInfo>;
    pool: Option<ContractInfo>;
};

export type Farm = {
    pid: number;
    chainId: SupportedChainIds;
    contracts: ChainContracts;
};

export type Network = {
    url: string;
    chainId: SupportedChainIds;
    type: ChainType;
};

export type ContractInfo = {
    address: string;
    abi: AbiItem;
};
