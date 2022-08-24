import { IConnector, ICore, EventLog, getEventsOptions, GetEventsReturn } from '../interfaces';
import { Farm, ContractNames, Config } from '@config/interface';

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
                        eventSignature: contract.events
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
                    eventSignature: contract.events
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
}
