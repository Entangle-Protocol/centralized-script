import { Config } from './interfaces';

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
                    events: []
                },
                router: {
                    address: '',
                    events: []
                },
                factories: [],
                dexes: [],
                loan: {
                    address: '',
                    events: []
                },
                pool: {
                    address: '',
                    events: []
                }
            },
            opToken: {
                address: '',
                decimals: 18
            }
        },
        {
            pid: 67,
            chainId: 250,
            contracts: {
                chef: {
                    address: '',
                    events: []
                },
                router: {
                    address: '',
                    events: []
                },
                factories: [],
                dexes: [],
                loan: {
                    address: '',
                    events: []
                },
                pool: {
                    address: '',
                    events: []
                }
            },
            opToken: {
                address: '',
                decimals: 18
            }
        },
        {
            pid: 7,
            chainId: 56,
            contracts: {
                chef: {
                    address: '',
                    events: []
                },
                router: {
                    address: '',
                    events: []
                },
                factories: [],
                dexes: [],
                loan: {
                    address: '',
                    events: []
                },
                pool: {
                    address: '',
                    events: []
                }
            },
            opToken: {
                address: '',
                decimals: 18
            }
        },
        {
            pid: 26,
            chainId: 1,
            contracts: {
                chef: {
                    address: '',
                    events: []
                },
                router: {
                    address: '',
                    events: []
                },
                factories: [],
                dexes: [],
                loan: {
                    address: '',
                    events: []
                },
                pool: {
                    address: '',
                    events: []
                }
            },
            opToken: {
                address: '',
                decimals: 18
            }
        }
    ],
    networks: {
        56: {
            url: '',
            blockTime: 0
        },
        250: {
            url: '',
            blockTime: 0
        },
        43114: {
            url: '',
            blockTime: 0
        },
        1: {
            url: '',
            blockTime: 0
        }
    }
};
