import { IRepository } from '@rebalancer/interfaces';
import { Operation, OperationOptions } from '@models/Operation';
import { ErrorOperation, ErrorOperationOptions } from '@models/ErrorOpertaion';
import { SendTxReturn } from '@chain/interfaces';

export default class Repository implements IRepository {
    public async createOp(o: OperationOptions): Promise<Operation> {
        try {
            return await Operation.create(o);
        } catch (error) {
            console.log(error);
            throw new Error('Database error');
        }
    }

    public async createErrorOp(o: ErrorOperationOptions): Promise<ErrorOperation> {
        try {
            return await ErrorOperation.create(o);
        } catch (error) {
            console.log(error);
            throw new Error('Database error');
        }
    }

    public async getOpById(id: number): Promise<Operation | null> {
        try {
            return await Operation.findByPk(id);
        } catch (error) {
            console.log(error);
            throw new Error('Database error');
        }
    }

    public async saveTxResult(result: SendTxReturn, op: Operation): Promise<void> {
        try {
            if (result.status) {
                op.status = `Router send request for bridging`;
                op.gasSpent += result.gas as number;
                op.hashes.push(result.hash as string);
                op.currentStep++;
                await op.save();
            } else {
                await this.createErrorOp({
                    error: result.error ? result.error : 'Something went wrong',
                    opId: op.id
                });
            }
        } catch (error) {
            console.log(error);
            throw new Error('Database error');
        }
    }
}
