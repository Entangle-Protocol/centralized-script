import {
    IConnector,
    ICore,
    EventLog,
    getEventsOptions,
    GetEventsReturn,
    SendTxOptions,
    SendTxReturn
} from '../interfaces';
import {
    Farm,
    ContractNames,
    Config,
    ContractInfo,
    SupportedChainIds,
    TokenInfo
} from '@config/interfaces';

export default class ChainCore implements ICore {
    private farm: Farm;

    constructor(
        private readonly connector: IConnector,
        private readonly config: Config,
        pid: number
    ) {
        const foundFarm = this.config.farms.find((el) => el.pid === pid);
        if (foundFarm) {
            this.farm = foundFarm;
        } else {
            throw new Error('No such farm');
        }
    }

    public async sendTx(o: SendTxOptions): Promise<SendTxReturn> {
        try {
            const result = await this.connector.sendTxRaw(o);
            return {
                status: true,
                ...result
            };
        } catch (error) {
            console.log(error);
            return {
                status: false,
                error: error as string
            };
        }
    }

    public getContractAddress(
        contractName: ContractNames,
        chainId?: SupportedChainIds,
        i = 0
    ): string {
        if (!chainId) chainId = this.farm.chainId;
        const farm = this.getFarmObjectByChainId(chainId);

        if (!farm) throw new Error(`There is no farm with chainId ${chainId}`);

        if (this.farm.contracts[contractName]) {
            if (Array.isArray(farm.contracts[contractName])) {
                return (this.farm.contracts[contractName] as ContractInfo[])[i].address;
            } else {
                return (this.farm.contracts[contractName] as ContractInfo).address;
            }
        } else {
            throw new Error(`There is no such contract in system!`);
        }
    }

    public getOpToken(chainId?: SupportedChainIds): TokenInfo {
        if (!chainId) chainId = this.farm.chainId;
        const farm = this.getFarmObjectByChainId(chainId);
        if (!farm) throw new Error(`There is no farm with chainId ${chainId}`);
        return farm.opToken;
    }

    public getChainId(): SupportedChainIds {
        return this.farm.chainId;
    }

    public getFarmChainId(pid: SupportedChainIds): SupportedChainIds {
        const exist = this.config.farms.find((el) => el.pid == pid);
        if (exist) {
            return exist.chainId;
        } else {
            throw new Error(`Farm with pid ${pid} doesn't exist!`);
        }
    }

    public async getEvents(op: getEventsOptions): Promise<Partial<GetEventsReturn>> {
        const { fromBlock, toBlock } = op;
        const events: Partial<GetEventsReturn> = {};
        const contracts = this.farm.contracts;
        let contractName: ContractNames;
        for (contractName in contracts) {
            const contractArray = contracts[contractName];
            if (Array.isArray(contractArray)) {
                events[contractName] = [];
                for (const contract of contractArray) {
                    const event = await this.connector.getContractEvents({
                        fromBlock,
                        toBlock,
                        chainId: this.farm.chainId,
                        address: contract.address,
                        eventInfo: contract.events
                    });
                    (events[contractName] as Array<EventLog[]>).push(event);
                }
            } else if (contractArray) {
                const contract = contractArray;
                const event = await this.connector.getContractEvents({
                    fromBlock,
                    toBlock,
                    chainId: this.farm.chainId,
                    address: contract.address,
                    eventInfo: contract.events
                });
                events[contractName] = event;
            }
        }

        return events;
    }
    public async getBlock(): Promise<number> {
        return await this.connector.getBlock(this.farm.chainId);
    }
    public getBlockDelay(): number {
        return this.config.networks[this.farm.chainId].blockTime;
    }

    private getFarmObjectByChainId(chainId: SupportedChainIds) {
        return this.config.farms.find((farm) => farm.chainId == chainId);
    }
}
