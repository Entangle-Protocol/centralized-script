import { IRepository } from '@rebalancer/interfaces';
import { Operation, OperationOptions } from '@models/Operation';
import { ErrorOperation, ErrorOperationOptions } from '@models/ErrorOpertaion';

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
}
