export type SupportedChainIds = 250 | 1 | 56 | 43114;
export type ChainType = 'evm' | 'elrond';
export type ContractNames = 'chef' | 'factory' | 'dex' | 'router' | 'loan' | 'pool';

export type Config = {
    farms: Farm[];
    networks: {
        [key in SupportedChainIds]: Network;
    };
};

export type ChainContracts = {
    [key in ContractNames]: ContractInfo;
};

export type Farm = {
    pid: number;
    chainId: SupportedChainIds;
    contracts: Partial<ChainContracts>;
    opToken: TokenInfo;
};

export type Network = {
    url: string;
    blockTime: number;
};

export type ContractInfo = {
    address: string;
    events: EventInfo[];
    chainId?: SupportedChainIds;
};

export type TokenInfo = {
    address: string;
    decimals: number;
};

export type EventInfo = {
    signature: string;
    parameters: {
        [key: string]: string; //from: address; amount: uint256
    }[];
};
