import { Config } from './interfaces';

/**
 * This is fake contracts that uses only for tests
 */
const chain1 = {
    router: '0x9DDc21C09d63546BE6897c84485aECCc916C7CA6',
    chef: '0xc0E767eD5338beB960EE5069ba97fDCcd1d1Af7f',
    pool: '0x3baEF661F30a9c6E3a454B82086F60dA3399853F',
    factory: '0x04F7C1850c545788bA729fE6b7ad40Dc0D88af90'
};
const chain2 = {
    router: '0x3479D7445271CF0763a7aAe2a47385dc0A029F78',
    chef: '0xfC3C1113E2faB05c60396FFA6721aAA528a1FAC5',
    pool: '0x543031d83d9EDA23A96eeEfcc7d5Bd3d0E4f88d6',
    factory: '0x21c957D49F76f0A3B420bb854199af98688e856b'
};

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
            chainId: 1,
            contracts: {
                chef: {
                    address: chain1.chef,
                    events: []
                },
                router: {
                    address: chain1.router,
                    events: []
                },
                factory: {
                    address: chain1.factory,
                    events: []
                },
                dex: {
                    address: '0x0000000000000000000000000000000000000000',
                    events: []
                },
                loan: {
                    address: '0x0000000000000000000000000000000000000000',
                    events: []
                },
                pool: {
                    address: chain1.pool,
                    events: []
                }
            },
            opToken: {
                address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                decimals: 18
            }
        },
        {
            pid: 9,
            chainId: 3,
            contracts: {
                chef: {
                    address: chain2.chef,
                    events: []
                },
                router: {
                    address: chain2.router,
                    events: []
                },
                factory: {
                    address: chain2.factory,
                    events: []
                },
                dex: {
                    address: '0x0000000000000000000000000000000000000000',
                    events: []
                },
                loan: {
                    address: '0x0000000000000000000000000000000000000000',
                    events: []
                },
                pool: {
                    address: chain2.pool,
                    events: []
                }
            },
            opToken: {
                address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
                decimals: 6
            }
        }
        // {
        //     pid: 7,
        //     chainId: 56,
        //     contracts: {
        //         chef: {
        //             address: '',
        //             events: []
        //         },
        //         router: {
        //             address: '',
        //             events: []
        //         },
        //         factories: [],
        //         dexes: [],
        //         loan: {
        //             address: '',
        //             events: []
        //         },
        //         pool: {
        //             address: '',
        //             events: []
        //         }
        //     },
        //     opToken: {
        //         address: '',
        //         decimals: 18
        //     }
        // },
        // {
        //     pid: 26,
        //     chainId: 1,
        //     contracts: {
        //         chef: {
        //             address: '',
        //             events: []
        //         },
        //         router: {
        //             address: '',
        //             events: []
        //         },
        //         factories: [],
        //         dexes: [],
        //         loan: {
        //             address: '',
        //             events: []
        //         },
        //         pool: {
        //             address: '',
        //             events: []
        //         }
        //     },
        //     opToken: {
        //         address: '',
        //         decimals: 18
        //     }
        // }
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
            url: 'http://127.0.0.1:8541',
            blockTime: 5
        },
        2: {
            url: 'http://127.0.0.1:8542',
            blockTime: 15
        },
        3: {
            url: 'http://127.0.0.1:8543',
            blockTime: 5
        },
        4: {
            url: 'http://127.0.0.1:8544',
            blockTime: 15
        }
    }
};
