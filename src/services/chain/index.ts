import { ContractNames } from '@config/interfaces';
import { Operation } from '@models/Operation';
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
    DepositEvent,
    DepositEventType,
    DepositToChefHandler,
    MintDepositEvent,
    MintDepositHandler,
    EventASellFreezeHandler,
    EventASellWithdrawHandler,
    BurnWithdrawEvent
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
                case 'dex': {
                    const events: EventLog[] = e[contract] as EventLog[];
                    if (events) {
                        for (const event of events) {
                            await this.dexHandler(event);
                        }
                    }
                    break;
                }
                case 'factory': {
                    const events: EventLog[] = e[contract] as EventLog[];
                    if (events) {
                        for (const event of events) {
                            await this.factoryHandler(event);
                        }
                    }
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

    private async chefHandler(e: EventLog) {
        const { eventSignature } = e;

        switch (eventSignature) {
            case 'Deposit': {
                const { parameters } = e as EventLog<MintDepositEvent>;
                const { opId, amount } = parameters;

                try {
                    let op: Operation;
                    if (!opId) {
                        // op = await this.rebalancer.createOp();
                        return; //TODO!
                    } else {
                        op = await this.rebalancer.getOpById(opId);
                    }
                    const chefAddress = this.core.getContractAddress('chef', op.farmChainId);
                    const dexAddress = this.core.getContractAddress('dex');
                    const factoryAddress = this.core.getContractAddress(
                        'factory',
                        op.sourceChainId
                    );
                    const handler: MintDepositHandler = {
                        method: 'mint',
                        params: [
                            {
                                name: 'chainId',
                                chainParamType: 'uint256',
                                value: op.farmChainId
                            },
                            {
                                name: 'synthChef',
                                chainParamType: 'address',
                                value: chefAddress
                            },
                            {
                                name: 'pid',
                                chainParamType: 'uint256',
                                value: op.farmId
                            },
                            {
                                name: 'amount',
                                chainParamType: 'uin256',
                                value: BigInt(0) //TODO!
                            },
                            {
                                name: 'to',
                                chainParamType: 'address',
                                value: op.user || dexAddress
                            }
                        ]
                    };

                    const result = await this.core.sendTx({
                        chainId: op.sourceChainId,
                        address: factoryAddress,
                        data: handler
                    });

                    await this.rebalancer.saveTxResult(result, op);
                } catch (error) {}
                break;
            }
            case 'Withdraw': {
                const { parameters } = e as EventLog<BurnWithdrawEvent>;
                const { opId } = parameters;
                try {
                    let op: Operation;
                    if (!opId) {
                        // op = await this.rebalancer.createOp();
                        return; //TODO!
                    } else {
                        op = await this.rebalancer.getOpById(opId);
                    }

                    //send tx to Router to bridge USDC, to burn synths
                } catch (error) {}
            }
        }
    }

    private async dexHandler(e: EventLog) {
        const { eventSignature } = e;

        switch (eventSignature) {
        }
    }

    private async factoryHandler(e: EventLog) {
        const { eventSignature } = e;

        switch (eventSignature) {
        }
    }

    private async loanHandler(e: EventLog) {
        const { eventSignature } = e;

        switch (eventSignature) {
        }
    }

    private async poolHandler(e: EventLog) {
        const { eventSignature } = e;

        switch (eventSignature) {
            case 'Deposit': {
                const { parameters } = e as EventLog<DepositEvent>;
                const { opId, amount } = parameters;
                try {
                    const op = await this.rebalancer.getOpById(opId);
                    const type = this.getDepositEventType(op.event, op.type);
                    const opToken = this.core.getOpToken();
                    switch (type) {
                        case DepositEventType.DepositToChef: {
                            const routerAddress = this.core.getContractAddress('router');

                            const handler: DepositToChefHandler = {
                                method: 'deposit',
                                params: [
                                    {
                                        name: 'pid',
                                        chainParamType: 'uint256',
                                        value: op.farmId
                                    },
                                    {
                                        name: 'tokenFrom',
                                        chainParamType: 'uint256',
                                        value: opToken.address
                                    },
                                    {
                                        name: 'amount',
                                        chainParamType: 'uint256',
                                        value: amount
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

                            await this.rebalancer.saveTxResult(result, op);
                            break;
                        }
                        case DepositEventType.DepositToDEX: {
                            // return DepositEventType.DepositToDEX;
                        }
                        case DepositEventType.DepositToWallet: {
                            // return DepositEventType.DepositToWallet;
                        }
                        default: {
                            throw new Error(`Wrong event type`);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    private async routerHandler(e: EventLog) {
        const { eventSignature } = e;
        switch (eventSignature) {
            case 'EventA': {
                // geting parameters from event
                const { parameters } = e as EventLog<EventAEvent>;
                const { type: _type, pid, amount } = parameters;

                // getting Operation info
                const type = this.getRebalancingEventType(_type);
                const sourceChainId = this.core.getChainId();
                const farmChainId = this.core.getFarmChainId(pid);
                const farmId = this.core.getFarmId(pid);
                const event = RebalancingEvent.A;

                try {
                    //creating Operation instanse
                    const op = await this.rebalancer.createOp(
                        type,
                        event,
                        sourceChainId,
                        farmChainId,
                        farmId
                    );

                    switch (type) {
                        case RebalancingEventType.Buy: {
                            //getting necessary parameters for request
                            const routerAddress = this.core.getContractAddress('router');
                            const opToken = this.core.getOpToken();
                            //creating data object for tx
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
                            //sending tx
                            const result = await this.core.sendTx({
                                chainId: op.farmChainId,
                                address: routerAddress,
                                data: handler
                            });

                            await this.rebalancer.saveTxResult(result, op);

                            break;
                        }
                        case RebalancingEventType.Sell: {
                            // const factoryAddress = this.core.getContractAddress('factory');
                            const routerAddress = this.core.getContractAddress(
                                'chef',
                                op.farmChainId
                            );

                            const opToken = this.core.getOpToken(op.farmChainId);

                            // const freezeHandler: EventASellFreezeHandler = {
                            //     method: 'freeze',
                            //     params: [
                            //         {
                            //             name: 'opId',
                            //             chainParamType: 'uint256',
                            //             value: op.id
                            //         },
                            //         {
                            //             name: 'amount',
                            //             chainParamType: 'uint256',
                            //             value: amount
                            //         }
                            //     ]
                            // };

                            const withdrawHandler: EventASellWithdrawHandler = {
                                method: 'withdraw',
                                params: [
                                    {
                                        name: 'pid',
                                        chainParamType: 'uint256',
                                        value: op.farmId
                                    },
                                    {
                                        name: 'tokenTo',
                                        chainParamType: 'uint256',
                                        value: opToken.address
                                    },
                                    {
                                        name: 'amount',
                                        chainParamType: 'uint256',
                                        value: amount
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

                            // const freezeResult = await this.core.sendTx({
                            //     chainId: op.sourceChainId,
                            //     address: factoryAddress,
                            //     data: freezeHandler
                            // });

                            // await this.rebalancer.saveTxResult(freezeResult, op);

                            // if (freezeResult.status) {
                            const withdrawResult = await this.core.sendTx({
                                chainId: op.farmChainId,
                                address: routerAddress,
                                data: withdrawHandler
                            });

                            await this.rebalancer.saveTxResult(withdrawResult, op);
                            // }
                            break;
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
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

    //TODO do not hardcode
    private getDepositEventType(rebalancingType: string, eventType: string): DepositEventType {
        switch (true) {
            case ['A, C'].includes(rebalancingType) && eventType == 'Buy': {
                return DepositEventType.DepositToChef;
            }
            case ['A'].includes(rebalancingType) && eventType == 'Sell': {
                return DepositEventType.DepositToDEX;
            }
            case ['C'].includes(rebalancingType) && eventType == 'Sell': {
                return DepositEventType.DepositToWallet;
            }
            default: {
                throw new Error(`Wrong event type`);
            }
        }
    }
}
