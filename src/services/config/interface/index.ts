import { AbiItem } from 'web3-utils';

export type SupportedChainIds = 250 | 1 | 56 | 43114;
export type ChainType = 'evm' | 'elrond';
export type ContractNames = 'chef' | 'factories' | 'dexes' | 'router' | 'loan' | 'pool';

export type Config = {
    farms: Farm[];
    networks: {
        [key in SupportedChainIds]?: Network;
    };
};

export type ChainContracts = {
    [key in ContractNames]: ContractInfo | ContractInfo[];
};

export type Farm = {
    pid: number;
    chainId: SupportedChainIds;
    contracts: Partial<ChainContracts>;
};

export type Network = {
    url: string;
    blockTime: number;
};

export type ContractInfo = {
    address: string;
    abi: AbiItem;
    chainId: SupportedChainIds;
};
