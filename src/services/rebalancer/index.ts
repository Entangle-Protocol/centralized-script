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
        user?: string
    ): Promise<Operation> {
        const op = await this.repo.createOp({
            type,
            event,
            user,
            sourceChainId,
            farmChainId,
            farmId,
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

    public async saveTxResult(result: SendTxReturn, op: Operation): Promise<void> {
        await this.repo.saveTxResult(result, op);
    }
}
