import { Config } from './interface';
import { AbiItem } from 'web3-utils';
import { None } from 'option.ts';

export const ElrondConfig: Config = {
    farms: [
        {
            pid: 100,
            chainId: 1,
            contracts: {
                chef: {
                    address: '',
                    abi: '' as unknown as AbiItem
                },
                router: None,
                factory: None,
                dexes: [],
                loan: None,
                pool: None
            }
        }
    ],
    networks: {
        1: {
            url: '',
            chainId: 1,
            type: 'elrond'
        }
    }
};

export const ETHConfig: Config = {
    farms: [
        {
            pid: 8,
            chainId: 43114,
            contracts: {
                chef: {
                    address: '',
                    abi: '' as unknown as AbiItem
                },
                router: None,
                factory: None,
                dexes: [],
                loan: None,
                pool: None
            }
        },
        {
            pid: 67,
            chainId: 250,
            contracts: {
                chef: {
                    address: '',
                    abi: '' as unknown as AbiItem
                },
                router: None,
                factory: None,
                dexes: [],
                loan: None,
                pool: None
            }
        },
        {
            pid: 7,
            chainId: 56,
            contracts: {
                chef: {
                    address: '',
                    abi: '' as unknown as AbiItem
                },
                router: None,
                factory: None,
                dexes: [],
                loan: None,
                pool: None
            }
        },
        {
            pid: 26,
            chainId: 1,
            contracts: {
                chef: {
                    address: '',
                    abi: '' as unknown as AbiItem
                },
                router: None,
                factory: None,
                dexes: [],
                loan: None,
                pool: None
            }
        }
    ],
    networks: {
        56: {
            url: '',
            chainId: 56,
            type: 'evm'
        },
        250: {
            url: '',
            chainId: 250,
            type: 'evm'
        },
        43114: {
            url: '',
            chainId: 43114,
            type: 'evm'
        },
        1: {
            url: '',
            chainId: 1,
            type: 'evm'
        }
    }
};
