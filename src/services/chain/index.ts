import { ContractNames, SupportedChainIds } from '@config/interfaces';
import { Operation } from '@models/Operation';
import { IRebalancer } from '@rebalancer/interfaces';
import {
    ICore,
    IChainService,
    GetEventsReturn,
    EventLog,
    RebalancingEvent,
    RebalancingEventType,
    BridgeHandler,
    EventAEvent,
    DepositEvent,
    DepositEventType,
    DepositToChefHandler,
    MintDepositEvent,
    MintHandler,
    WithdrawHandler,
    BurnWithdrawEvent,
    BurnHandler,
    EventBCEvent,
    EventBPossibilty,
    BalanceOfHandler
} from './interfaces';

export default class ChainService implements IChainService {
    constructor(private readonly core: ICore, private readonly rebalancer: IRebalancer) {}

    public async startEventLoop(): Promise<void> {
        console.log('Starting event loop...');
        let fromBlock = await this.core.getBlock();
        let toBlock = fromBlock;

        const blockDelay = this.core.getBlockDelay() || 60000;
        console.log(`Start parameters: from ${fromBlock}, delay ${blockDelay}`);
        while (true) {
            try {
                toBlock = await this.core.getBlock();
                const timeStart = Date.now();
                if (fromBlock < toBlock) {
                    console.log(`Starts new phase! From ${fromBlock}, to ${toBlock}`);
                    const events = await this.core.getEvents({
                        fromBlock,
                        toBlock
                    });
                    console.log(
                        `Found: Chef ${events.chef?.length}, Router ${events.router?.length}, Pool ${events.pool?.length}, Factory ${events.factory?.length},`
                    );
                    await this.handlerRouter(events);
                    fromBlock = toBlock + 1;
                } else {
                    console.log('Not enough time');
                }

                const timeEnd = Date.now();
                console.log('Waiting for next phase...');
                if (timeEnd - timeStart < blockDelay) {
                    await this._await(blockDelay * 1000 - (timeEnd - timeStart)); //lets wait until new blocks
                }
            } catch (error) {
                console.log(error);
                await this._await(blockDelay * 1000);
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

    private async chefHandler(e: EventLog) {
        const { eventSignature } = e;

        switch (eventSignature) {
            case 'Deposit': {
                const { parameters } = e as EventLog<MintDepositEvent>;
                console.log(parameters);
                const { opId, amount: _amount } = parameters;

                try {
                    let op: Operation;
                    if (!opId) {
                        console.log(`Error! No opId provided`);
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

                    const amount = BigInt(0); //TODO!
                    const handler: MintHandler = {
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
                                chainParamType: 'uint256',
                                value: amount
                            },
                            {
                                name: 'to',
                                chainParamType: 'address',
                                value: op.user || dexAddress
                            }
                        ]
                    };

                    console.log(op.user || dexAddress, factoryAddress);

                    const result = await this.core.sendTx({
                        chainId: op.sourceChainId,
                        address: factoryAddress,
                        data: handler
                    });

                    await this.rebalancer.saveTxResult(
                        result,
                        `Assets successfuly deposited to chef. Minting new synths`,
                        op
                    );
                } catch (error) {}
                break;
            }
            case 'Withdraw': {
                const { parameters } = e as EventLog<BurnWithdrawEvent>;
                const { opId, amount } = parameters;
                try {
                    let op: Operation;
                    if (!opId) {
                        // op = await this.rebalancer.createOp();
                        return; //TODO!
                    } else {
                        op = await this.rebalancer.getOpById(opId);
                    }
                    const opToken = this.core.getOpToken();
                    const chefAddress = this.core.getContractAddress('chef');
                    const routerAddressX = this.core.getContractAddress('router', op.sourceChainId);
                    const routerAddressY = this.core.getContractAddress('router', op.farmChainId);
                    const factoryAddress = this.core.getContractAddress(
                        'factory',
                        op.sourceChainId
                    );
                    //TODO! Add amount calculation!
                    const bridgeHandler: BridgeHandler = {
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
                                value: this.core.getContractAddress('pool', op.sourceChainId)
                            },
                            { name: 'amount', chainParamType: 'uint256', value: amount },
                            {
                                name: 'toChainId',
                                chainParamType: 'uint256',
                                value: op.sourceChainId
                            },
                            {
                                name: 'anycallProxy',
                                chainParamType: 'address',
                                value: this.core.getContractAddress('pool', op.sourceChainId)
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

                    const burnHandler: BurnHandler = {
                        method: 'burn',
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
                                name: 'from',
                                chainParamType: 'address',
                                value: routerAddressX
                            }
                        ]
                    };
                    //send tx to Router to bridge USDC, to burn synths
                    const burnResult = await this.core.sendTx({
                        address: factoryAddress, //synthfactory on source chain
                        chainId: op.sourceChainId, //source
                        data: burnHandler
                    });

                    const bridgeResult = await this.core.sendTx({
                        address: routerAddressY, //router on farm chain
                        chainId: op.farmChainId, //farm
                        data: bridgeHandler
                    });

                    await this.rebalancer.saveTxResult(
                        burnResult,
                        `Asking factory to burn synths`,
                        op
                    );
                    await this.rebalancer.saveTxResult(
                        bridgeResult,
                        `Ask Router to bridge assets`,
                        op
                    );
                } catch (error) {}
            }
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
                            //TODO OP nextChain checking
                            const routerAddress = this.core.getContractAddress('router');
                            op.nextChain = this.core.getChainId();
                            const handler: DepositToChefHandler = {
                                method: 'depositFromPool',
                                params: [
                                    {
                                        name: 'pid',
                                        chainParamType: 'uint256',
                                        value: op.farmId
                                    },
                                    {
                                        name: 'tokenFrom',
                                        chainParamType: 'address',
                                        value: opToken.address
                                    },
                                    {
                                        name: 'amount',
                                        chainParamType: 'uint256',
                                        value: amount
                                    },
                                    {
                                        name: 'data',
                                        chainParamType: 'bytes32',
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

                            await this.rebalancer.saveTxResult(
                                result,
                                `Depositing assets to chef`,
                                op
                            );
                            break;
                        }
                        case DepositEventType.DepositToDEX: {
                            // return DepositEventType.DepositToDEX;
                            break;
                        }
                        case DepositEventType.DepositToWallet: {
                            // return DepositEventType.DepositToWallet;
                            break;
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
                const { eventType: _type, pid, amount } = parameters;

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
                        farmId,
                        amount
                    );
                    op.nextChain = sourceChainId;

                    switch (type) {
                        case RebalancingEventType.Buy: {
                            //getting necessary parameters for request
                            const routerAddress = this.core.getContractAddress('router');
                            const opToken = this.core.getOpToken();
                            //creating data object for tx
                            const handler: BridgeHandler = {
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
                                        chainParamType: 'bytes32',
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

                            await this.rebalancer.saveTxResult(
                                result,
                                `Router send request for bridging`,
                                op
                            );

                            break;
                        }
                        case RebalancingEventType.Sell: {
                            // const factoryAddress = this.core.getContractAddress('factory');
                            const routerAddress = this.core.getContractAddress(
                                'chef',
                                op.farmChainId
                            );

                            const opToken = this.core.getOpToken(op.farmChainId);

                            const withdrawHandler: WithdrawHandler = {
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

                            const withdrawResult = await this.core.sendTx({
                                chainId: op.farmChainId,
                                address: routerAddress,
                                data: withdrawHandler
                            });

                            await this.rebalancer.saveTxResult(
                                withdrawResult,
                                `Router send request for withdrawing`,
                                op
                            );
                            break;
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
                break;
            }
            case 'EventBC': {
                const { parameters } = e as EventLog<EventBCEvent>;
                const { eventType: _type, pid, amount, user } = parameters;
                // getting Operation info
                const type = this.getRebalancingEventType(_type);
                const sourceChainId = this.core.getChainId();
                const farmChainId = this.core.getFarmChainId(pid);
                const farmId = this.core.getFarmId(pid);
                try {
                    //check if it is event B or C
                    const isEventB = await this.getEventBPossibility(farmChainId, amount);
                    const event = isEventB ? RebalancingEvent.B : RebalancingEvent.C;
                    const op = await this.rebalancer.createOp(
                        type,
                        event,
                        sourceChainId,
                        farmChainId,
                        farmId,
                        amount,
                        user
                    );
                    if (isEventB) {
                        switch (type) {
                            case RebalancingEventType.Buy: {
                                //calc amount to loan
                                //look if it is enough money on idex on chain Y
                                //freezeHandler? if we need to loan from synthchef
                                //loanHandler
                                //deposit from pool handler
                            }
                            case RebalancingEventType.Sell: {
                            }
                        }
                    } else {
                        switch (type) {
                            case RebalancingEventType.Buy: {
                                //send tx to bridge
                                const opToken = this.core.getOpToken();
                                const routerAddress = this.core.getContractAddress('router');
                                op.nextChain = sourceChainId;
                                const handler: BridgeHandler = {
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
                                            value: this.core.getContractAddress(
                                                'pool',
                                                op.farmChainId
                                            )
                                        },
                                        {
                                            name: 'amount',
                                            chainParamType: 'uint256',
                                            value: amount
                                        },
                                        {
                                            name: 'toChainId',
                                            chainParamType: 'uint256',
                                            value: op.farmChainId
                                        },
                                        {
                                            name: 'anycallProxy',
                                            chainParamType: 'address',
                                            value: this.core.getContractAddress(
                                                'pool',
                                                op.farmChainId
                                            )
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

                                await this.rebalancer.saveTxResult(
                                    result,
                                    `Router send request for bridging`,
                                    op
                                );
                                break;
                            }
                            case RebalancingEventType.Sell: {
                                const opToken = this.core.getOpToken(op.farmChainId);
                                const routerAddress = this.core.getContractAddress(
                                    'router',
                                    op.farmChainId
                                );
                                op.nextChain = farmChainId;
                                const handler: WithdrawHandler = {
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

                                const result = await this.core.sendTx({
                                    chainId: op.farmChainId,
                                    address: routerAddress,
                                    data: handler
                                });

                                await this.rebalancer.saveTxResult(
                                    result,
                                    `Router send request for withdraw`,
                                    op
                                );
                                break;
                            }
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
                break;
            }
        }
    }

    private getRebalancingEventType(type: string): RebalancingEventType {
        switch (type.trim()) {
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
            case ['A', 'C'].includes(rebalancingType) && eventType == 'BUY': {
                return DepositEventType.DepositToChef;
            }
            case ['A'].includes(rebalancingType) && eventType == 'SELL': {
                return DepositEventType.DepositToDEX;
            }
            case ['C'].includes(rebalancingType) && eventType == 'SELL': {
                return DepositEventType.DepositToWallet;
            }
            default: {
                throw new Error(`Wrong event type`);
            }
        }
    }

    private async getEventBPossibility(
        farmChainId: SupportedChainIds,
        amount: bigint
    ): Promise<EventBPossibilty> {
        //TODO!
        const sourceOpToken = this.core.getOpToken();
        const farmOpToken = this.core.getOpToken(farmChainId);
        const dexAddress = this.core.getContractAddress('dex', farmChainId);
        const farmId = this.core.getFarmId(farmChainId);
        const balanceOfHandler: BalanceOfHandler = {
            method: 'balanceOf',
            params: [
                {
                    name: 'account',
                    chainParamType: 'address',
                    value: dexAddress
                }
            ]
        };

        try {
            const balance = await this.core.sendTx({
                address: farmOpToken.address,
                data: balanceOfHandler,
                chainId: farmChainId,
                call: true
            });

            if (!balance.value) {
                throw new Error('Error while calculating eventB possibility!');
            }

            const pureAmount = amount / BigInt(Math.pow(10, sourceOpToken.decimals));

            const pureBalance = BigInt(balance.value) / BigInt(Math.pow(10, farmOpToken.decimals));

            if (pureBalance >= pureAmount) {
                const result: EventBPossibilty = {
                    possible: true,
                    lender: dexAddress,
                    farmId
                };

                return result;
            } else {
                // TODO! Look to synthchef flow!
                return {
                    possible: false
                };
            }
        } catch (error) {
            console.log(error);
            return {
                possible: false
            };
        }
    }

    private async _await(delay: number) {
        return new Promise((resolve) =>
            setTimeout(() => {
                resolve(true);
            }, delay)
        );
    }
}
