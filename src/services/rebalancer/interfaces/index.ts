import { RebalancingEvent, RebalancingEventType, SendTxReturn } from '@chain/interfaces';
import { SupportedChainIds } from '@config/interfaces';
import { ErrorOperation, ErrorOperationOptions } from '@models/ErrorOpertaion';
import { Operation, OperationOptions } from '@models/Operation';

export interface IRebalancer {
    createOp(
        type: RebalancingEventType,
        event: RebalancingEvent,
        sourceChainId: SupportedChainIds,
        farmChainId: SupportedChainIds,
        farmId: number,
        amount: bigint,
        user?: string
    ): Promise<Operation>;
    createErrorOp(error: string, opId: number): Promise<ErrorOperation>;
    getOpById(id: number): Promise<Operation>;
    saveTxResult(result: SendTxReturn, status: string, op: Operation): Promise<void>;
}
export interface IRepository {
    createOp(o: OperationOptions): Promise<Operation>;
    createErrorOp(o: ErrorOperationOptions): Promise<ErrorOperation>;
    getOpById(id: number): Promise<Operation | null>;
    saveTxResult(result: SendTxReturn, status: string, op: Operation): Promise<void>;
}
