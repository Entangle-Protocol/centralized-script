import { RebalancingEvent, RebalancingEventType } from '@chain/interfaces';
import { SupportedChainIds } from '@config/interfaces';
import { ErrorOperation, ErrorOperationOptions } from '@models/ErrorOpertaion';
import { Operation, OperationOptions } from '@models/Operation';

export interface IRebalancer {
    createOp(
        type: RebalancingEventType,
        event: RebalancingEvent,
        sourceChainId: SupportedChainIds,
        farmChainId: SupportedChainIds,
        user?: string
    ): Promise<Operation>;
    createErrorOp(error: string, opId: number): Promise<ErrorOperation>;
}
export interface IRepository {
    createOp(o: OperationOptions): Promise<Operation>;
    createErrorOp(o: ErrorOperationOptions): Promise<ErrorOperation>;
}
