import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    ForeignKey,
    NonAttribute
} from 'sequelize';
import { SequelizeAgent } from '@libs/sequelize';
import { Operation } from './Operation';

type ErrorOperationOptions = {
    opId: number;
    error: string;
};

class ErrorOperation extends Model<
    InferAttributes<ErrorOperation>,
    InferCreationAttributes<ErrorOperation>
> {
    declare opId: ForeignKey<Operation['id']>;
    declare error: string;
    declare opData?: NonAttribute<Operation>;
}

ErrorOperation.belongsTo(Operation, { as: 'opData' });

ErrorOperation.init(
    {
        error: DataTypes.STRING
    },
    {
        tableName: 'error_operations',
        sequelize: SequelizeAgent.getInstance()
    }
);

export { ErrorOperation, ErrorOperationOptions };
