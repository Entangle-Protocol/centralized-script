import { IRepository } from '@rebalancer/interfaces';
import { Operation, OperationOptions } from '@models/Operation';
import { ErrorOperation, ErrorOperationOptions } from '@models/ErrorOpertaion';
import { SendTxReturn } from '@chain/interfaces';
import { Sequelize } from 'sequelize';

export default class Repository implements IRepository {
    constructor(private readonly sequelize: Sequelize) {}
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

    public async saveTxResult(result: SendTxReturn, status: string, op: Operation): Promise<void> {
        try {
            if (result.status) {
                op.status = status;
                op.gasSpent += result.gas as number;
                op.currentStep++;
                await op.update({
                    hashes: this.sequelize.fn(
                        'array_append',
                        this.sequelize.col('hashes'),
                        result.hash
                    )
                });
                await op.save();
            } else {
                await this.createErrorOp({
                    error: result.error
                        ? (result.error?.message as string)?.substring(0, 255) // only 255 char length!
                        : 'Something went wrong',
                    opId: op.id
                });
            }
        } catch (error) {
            console.log(error);
            throw new Error('Database error');
        }
    }
}
