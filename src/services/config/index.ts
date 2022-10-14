import { Config } from './interfaces';

/**
 * This is fake contracts that uses only for tests
 */
import chainC1 from './bsc_addresses.json';
import chainC2 from './avax_addresses.json';
const chain1 = chainC1;
const chain2 = chainC2;

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
                    events: [
                        {
                            signature: 'Deposit',
                            parameters: [
                                {
                                    amount: 'uint256'
                                },
                                {
                                    opId: 'uint256'
                                }
                            ]
                        },
                        {
                            signature: 'Withdraw',
                            parameters: [
                                {
                                    amount: 'uint256'
                                },
                                {
                                    opId: 'uint256'
                                }
                            ]
                        }
                    ]
                },
                router: {
                    address: chain1.router,
                    events: [
                        {
                            signature: 'EventA',
                            parameters: [
                                {
                                    eventType: 'bytes'
                                },
                                {
                                    amount: 'uint256'
                                },
                                {
                                    pid: 'uint256'
                                }
                            ]
                        }
                        // {
                        //     signature: 'EventBC',
                        //     parameters: [
                        //         {
                        //             eventType: 'bytes'
                        //         },
                        //         {
                        //             amount: 'uint256'
                        //         },
                        //         {
                        //             pid: 'uint256'
                        //         },
                        //         {
                        //             user: 'address'
                        //         }
                        //     ]
                        // }
                    ]
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
                    events: [
                        {
                            signature: 'Deposit',
                            parameters: [
                                {
                                    amount: 'uint256'
                                },
                                {
                                    opId: 'uint256'
                                }
                            ]
                        }
                    ]
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
                    events: [
                        {
                            signature: 'Deposit',
                            parameters: [
                                {
                                    amount: 'uint256'
                                },
                                {
                                    opId: 'uint256'
                                }
                            ]
                        },
                        {
                            signature: 'Withdraw',
                            parameters: [
                                {
                                    amount: 'uint256'
                                },
                                {
                                    opId: 'uint256'
                                }
                            ]
                        }
                    ]
                },
                router: {
                    address: chain2.router,
                    events: [
                        {
                            signature: 'EventA',
                            parameters: [
                                {
                                    eventType: 'bytes'
                                },
                                {
                                    amount: 'uint256'
                                },
                                {
                                    pid: 'uint256'
                                }
                            ]
                        },
                        {
                            signature: 'EventBC',
                            parameters: [
                                {
                                    eventType: 'bytes'
                                },
                                {
                                    amount: 'uint256'
                                },
                                {
                                    pid: 'uint256'
                                },
                                {
                                    user: 'address'
                                }
                            ]
                        }
                    ]
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
                    events: [
                        {
                            signature: 'Deposit',
                            parameters: [
                                {
                                    amount: 'uint256'
                                },
                                {
                                    opId: 'uint256'
                                }
                            ]
                        }
                    ]
                }
            },
            opToken: {
                address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
                decimals: 6
            }
        }
    ],
    networks: {
        56: {
            url: 'https://data-seed-prebsc-1-s3.binance.org:8545',
            blockTime: 15
        },
        250: {
            url: 'https://fantom-testnet.public.blastapi.io',
            blockTime: 15
        },
        43114: {
            url: 'https://api.avax-test.network/ext/bc/C/rpc',
            blockTime: 15
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
