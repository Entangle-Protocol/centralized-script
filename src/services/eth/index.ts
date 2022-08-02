import Web3 from 'web3';
import { ContractInfo, SupportedChainIds } from '../config/interface';
import {
    Config,
    Farm,
    ContractNames,
    EventHandler,
    Contract,
    CompiledFarm,
    ChainEvents
} from './interface';

export default class ETHService {
    private handlers: EventHandler;
    public compiledFarmsContracts: CompiledFarm[];

    constructor(private config: Config) {
        this.compiledFarmsContracts = this.compileContracts(config.farms);

        /**
         * [key: EventName]: {
         *      contractName - contract name, that fires event,
         *      handler - function that should be done after getting event
         * }
         * example:
         * this.handlers = {
         *     RebalancingEventA: {
         *         contractName: 'router',
         *         handler: this.eventAHandler
         *     }
         * };
         */
        this.handlers = {
            RebalancingEventA: {
                contractName: 'router',
                handler: this.eventAHandler
            }
        };
    }
    /**
     * Gets all events for each contract
     * @param {CompiledFarm} farm - farm object with compiled contrats
     * @param {number} blockFrom - block from to get events
     * @param {number} blockTo - block to to get events
     * @returns {Promise<ChainEvents>} Object with all events
     */
    async getAllContractsEvents(
        farm: CompiledFarm,
        blockFrom: number,
        blockTo: number
    ): Promise<ChainEvents> {
        const allContractsEvents: Partial<ChainEvents> = {};

        let event: keyof typeof this.handlers;
        for (event in this.handlers) {
            const eventObj = this.handlers[event];
            const contractsArray = farm.contracts[eventObj.contractName];
            if (Array.isArray(contractsArray)) {
                const contractArrayEvents = [];
                for (const contract of contractsArray) {
                    const events = await contract.getPastEvents(event, {
                        filter: {
                            blockFrom,
                            blockTo
                        }
                    });
                    contractArrayEvents.push(events);
                }
                allContractsEvents[eventObj.contractName] = contractArrayEvents;
            } else if (contractsArray) {
                const contract = contractsArray;
                const events = await contract.getPastEvents(event, {
                    filter: {
                        blockFrom,
                        blockTo
                    }
                });
                allContractsEvents[eventObj.contractName] = events;
            }
        }
        return allContractsEvents;
    }

    async handleEvents() {}

    getDelayTime(chainId: SupportedChainIds): number | undefined {
        return this.config.networks[chainId]?.blockTime;
    }

    // --- PRIVATE ---
    /**
     * Creates web3 instance to communicate with blockchain
     * @param {string} url - url of rpc provider
     * @returns {Web3} Web3 instance
     */
    private createHttpProvider(url: string): Web3 {
        return new Web3(url);
    }

    /**
     *
     * @param {ContractInfo} contractObj - Object with contract data
     * @returns {(Contract | null)} Contract instance or null
     */
    private compileContractFromObj(contractObj: ContractInfo): Contract | null {
        const providerUrl = this.config.networks[contractObj.chainId]?.url;
        if (!providerUrl) return null;
        const web3 = this.createHttpProvider(providerUrl);
        return new web3.eth.Contract(contractObj.abi, contractObj.address);
    }

    /**
     *
     * @param {Farm[]} farms Farms array
     * @returns {CompiledContracts[]} Array with compiled farm contracts
     */
    private compileContracts(farms: Farm[]): CompiledFarm[] {
        const compiledFarmsContracts: CompiledFarm[] = [];

        for (const farm of farms) {
            const farmContracts: CompiledFarm = {
                pid: farm.pid,
                chainId: farm.chainId,
                contracts: {}
            };

            let contractName: ContractNames;
            for (contractName in farm.contracts) {
                const contractObjOrArray = farm.contracts[contractName];
                if (Array.isArray(contractObjOrArray)) {
                    const compiledContractsArray = [];
                    for (const contractObj of contractObjOrArray) {
                        const compiledContract = this.compileContractFromObj(contractObj);
                        if (compiledContract) {
                            compiledContractsArray.push(compiledContract);
                        }
                    }
                    farmContracts.contracts[contractName] = compiledContractsArray;
                } else if (contractObjOrArray) {
                    const compiledContract = this.compileContractFromObj(contractObjOrArray);
                    if (compiledContract) {
                        farmContracts.contracts[contractName] = compiledContract;
                    }
                }
            }
        }

        return compiledFarmsContracts;
    }

    private async eventAHandler() {
        /**
         * fires by router, either a lot of synth, or a lot of usdc
         * 1. get Event Data
         * 2. call router -> bridge method or call router -> SynthFactory burn method
         */
    }

    private async bridgeEventHandler() {
        /**
         * fires by pool after successful bridging
         * 1. get Event Data
         * 2. call router -> SynthChef deposit method / call router -> move to IDEX method
         */
    }

    private async depositEventHandler() {
        /**
         * fires by router after succesful deposit via SynthChef
         * 1. get Event Data
         * 2. call router -> SynthFactory mint method
         */
    }

    private async burnEventHandler() {
        /**
         * fires by router after succesful burn via SynthFactory
         * 1. get Event Data
         * 2. call router -> SynthChef withdraw method
         */
    }

    private async withdrawBridgeEventHandler() {
        /**
         * fires by router after succesful deposit via SynthChef
         * 1. get Event Data
         * 2. call SynthFactory mint method
         */
    }
}
