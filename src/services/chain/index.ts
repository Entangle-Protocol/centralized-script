import { ContractNames } from '@config/interfaces';
import { IRebalancer } from '@rebalancer/interfaces';
import {
    ICore,
    IChainService,
    GetEventsReturn,
    EventLog,
    RebalancingEvent,
    RebalancingEventType,
    EventABuyHandler,
    EventAEvent,
    DepositEvent
} from './interfaces';

export default class ChainService implements IChainService {
    constructor(private readonly core: ICore, private readonly rebalancer: IRebalancer) {}

    public async startEventLoop(): Promise<void> {
        let fromBlock = await this.core.getBlock();
        let toBlock = fromBlock;

        const blockDelay = this.core.getBlockDelay() || 60000;

        while (true) {
            try {
                toBlock = await this.core.getBlock();
                const timeStart = Date.now();
                if (fromBlock != toBlock) {
                    const events = await this.core.getEvents({
                        fromBlock,
                        toBlock
                    });
                    await this.handlerRouter(events);
                }

                const timeEnd = Date.now();
                if (timeEnd - timeStart < blockDelay) {
                    await this._await(timeEnd - timeStart); //lets wait until new blocks
                }
                fromBlock = toBlock;
            } catch (error) {
                //TODO? error handler (continue or ?);
                console.log(error);
                continue;
            }
        }
    }

    private async handlerRouter(e: Partial<GetEventsReturn>): Promise<void> {
        let contract: ContractNames;
        for (contract in e) {
            switch (contract) {
                case 'chef': {
                    const events: EventLog[] = e[contract] as EventLog[];
                    if (events) {
                        for (const event of events) {
                            await this.chefHandler(event);
                        }
                    }
                    break;
                }
                case 'dexes': {
                    const events: EventLog[][] = e[contract] as EventLog[][];
                    if (events) {
                        for (const instance of events) {
                            for (const event of instance) {
                                await this.dexHandler(event);
                            }
                        }
                    }
                    break;
                }
                case 'factories': {
                    const events: EventLog[][] = e[contract] as EventLog[][];
                    if (events) {
                        for (const instance of events) {
                            for (const event of instance) {
                                await this.factoryHandler(event);
                            }
                        }
                    }
                    break;
                }
                case 'loan': {
                    const events: EventLog[] = e[contract] as EventLog[];
                    if (events) {
                        for (const event of events) {
                            await this.loanHandler(event);
                        }
                    }
                    break;
                }
                case 'pool': {
                    const events: EventLog[] = e[contract] as EventLog[];
                    if (events) {
                        for (const event of events) {
                            await this.poolHandler(event);
                        }
                    }
                    break;
                }
                case 'router': {
                    const events: EventLog[] = e[contract] as EventLog[];
                    if (events) {
                        for (const event of events) {
                            await this.routerHandler(event);
                        }
                    }
                    break;
                }
            }
        }
    }

    private async _await(delay: number) {
        return new Promise((resolve) =>
            setTimeout(() => {
                resolve(true);
            }, delay)
        );
    }

    private async chefHandler(e: EventLog) {}

    private async dexHandler(e: EventLog) {}

    private async factoryHandler(e: EventLog) {}

    private async loanHandler(e: EventLog) {}

    private async poolHandler(e: EventLog) {
        const { eventSignature } = e;

        switch (eventSignature) {
            case 'Deposit': {
                const { parameters } = e as EventLog<DepositEvent>;
                const { opId, amount, type } = parameters;
                break;
            }
        }
    }

    private async routerHandler(e: EventLog) {
        const { eventSignature } = e;
        switch (eventSignature) {
            case 'EventA': {
                const { parameters } = e as EventLog<EventAEvent>;
                const { type: _type, pid, amount } = parameters;
                const type = this.getRebalancingEventType(_type);
                switch (type) {
                    case RebalancingEventType.Buy: {
                        const event = RebalancingEvent.A;
                        const sourceChainId = this.core.getChainId();
                        const farmChainId = this.core.getFarmChainId(pid);
                        const routerAddress = this.core.getContractAddress('router');
                        const opToken = this.core.getOpToken();
                        try {
                            const op = await this.rebalancer.createOp(
                                type,
                                event,
                                sourceChainId,
                                farmChainId
                            );
                            const handler: EventABuyHandler = {
                                method: 'bridgeToChain',
                                params: [
                                    {
                                        name: 'token',
                                        chainParamType: 'address',
                                        value: opToken.address
                                    },
                                    {
                                        name: 'to',
                                        chainParamType: 'address',
                                        value: this.core.getContractAddress('pool', op.farmChainId)
                                    },
                                    { name: 'amount', chainParamType: 'uint256', value: amount },
                                    {
                                        name: 'toChainId',
                                        chainParamType: 'uint256',
                                        value: op.farmChainId
                                    },
                                    {
                                        name: 'anycallProxy',
                                        chainParamType: 'address',
                                        value: this.core.getContractAddress('pool', op.farmChainId)
                                    },
                                    {
                                        name: 'data',
                                        chainParamType: 'bytes',
                                        value: [
                                            {
                                                name: 'opId',
                                                chainParamType: 'uint256',
                                                value: op.id
                                            }
                                        ]
                                    }
                                ]
                            };

                            const result = await this.core.sendTx({
                                chainId: op.farmChainId,
                                address: routerAddress,
                                data: handler
                            });

                            if (result.status) {
                                op.status = `Router send request for bridging`;
                                op.gasSpent += result.gas as number;
                                op.hashes.push(result.hash as string);
                                op.currentStep++;
                                await op.save();
                            } else {
                                await this.rebalancer.createErrorOp(
                                    result.error ? result.error : 'Something went wrong',
                                    op.id
                                );
                            }
                        } catch (error) {
                            console.log(error);
                        }

                        break;
                    }
                    case RebalancingEventType.Sell: {
                        break;
                    }
                }
                break;
            }
        }
    }

    private getRebalancingEventType(type: string): RebalancingEventType {
        switch (type) {
            case RebalancingEventType.Buy: {
                return RebalancingEventType.Buy;
            }
            case RebalancingEventType.Sell: {
                return RebalancingEventType.Sell;
            }
            default: {
                throw new Error(`Wrong event type`);
            }
        }
    }
}
