import { RebalancingEvent, RebalancingEventType, SendTxReturn } from '@chain/interfaces';
import { SupportedChainIds } from '@config/interfaces';
import { ErrorOperation } from '@models/ErrorOpertaion';
import { Operation } from '@models/Operation';
import { IRebalancer, IRepository } from './interfaces';

export default class RebalancerService implements IRebalancer {
    constructor(private readonly repo: IRepository) {}

    public async createOp(
        type: RebalancingEventType,
        event: RebalancingEvent,
        sourceChainId: SupportedChainIds,
        farmChainId: SupportedChainIds,
        farmId: number,
        amount: bigint,
        user?: string
    ): Promise<Operation> {
        const op = await this.repo.createOp({
            type,
            event,
            user,
            sourceChainId,
            farmChainId,
            farmId,
            amount,
            status: `Starting event A ${type} rebalancing`
        });
        return op;
    }

    public async createErrorOp(error: string, opId: number): Promise<ErrorOperation> {
        const op = await this.repo.createErrorOp({
            error,
            opId
        });
        return op;
    }

    public async getOpById(id: number): Promise<Operation> {
        const op = await this.repo.getOpById(id);
        if (op) {
            return op;
        }
        throw new Error(`Op with id ${id} not found!`);
    }

    public async saveTxResult(result: SendTxReturn, status: string, op: Operation): Promise<void> {
        console.log(`Saving tx result for op ${op.id}`);
        await this.repo.saveTxResult(result, status, op);
    }
}
