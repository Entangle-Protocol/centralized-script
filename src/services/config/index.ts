import { Config } from './interface';
import { AbiItem } from 'web3-utils';
import * as abis from './ABI';

export const ETHConfig: Config = {
    /**
     * networks - [key: chainId]: {
     *      url - rpc provider
     * }
     *
     * farms.pid - unique identifier of farm
     * farm.chainId - chainId where farm located
     * farm.contracts - contracts for farm interacting
     *  contracts.chef - SynthChef to deposit/withdraw farm
     *  contracts.router - Router contract to track activity on chain with farm.chainId
     *  contracts.factories - Array of factories on all chains
     *  contracts.dexes - Array of Internal DEXes on all chains
     *  contracts.loan - Loan&Borrower contract for event B on chain with farm.chainId
     *  contracts.pool - Liquidity Pool contract to aggregate all free liquidity on chain with farm.chainId
     */
    farms: [
        {
            pid: 8,
            chainId: 43114,
            contracts: {
                chef: {
                    address: '',
                    abi: abis.eth_synthChef as unknown as AbiItem, //example of ABI import
                    chainId: 43114
                },
                router: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 43114
                },
                factories: [],
                dexes: [],
                loan: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 43114
                },
                pool: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 43114
                }
            }
        },
        {
            pid: 67,
            chainId: 250,
            contracts: {
                chef: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 1
                },
                router: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 1
                },
                factories: [],
                dexes: [],
                loan: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 1
                },
                pool: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 1
                }
            }
        },
        {
            pid: 7,
            chainId: 56,
            contracts: {
                chef: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 1
                },
                router: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 1
                },
                factories: [],
                dexes: [],
                loan: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 1
                },
                pool: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 1
                }
            }
        },
        {
            pid: 26,
            chainId: 1,
            contracts: {
                chef: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 1
                },
                router: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 1
                },
                factories: [],
                dexes: [],
                loan: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 1
                },
                pool: {
                    address: '',
                    abi: '' as unknown as AbiItem,
                    chainId: 1
                }
            }
        }
    ],
    networks: {
        56: {
            url: ''
        },
        250: {
            url: ''
        },
        43114: {
            url: ''
        },
        1: {
            url: ''
        }
    }
};
