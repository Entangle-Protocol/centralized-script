import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    CreationOptional
} from 'sequelize';
import { SequelizeAgent } from '@libs/sequelize';
import { RebalancingEvent, RebalancingEventType } from '@chain/interfaces';
import { SupportedChainIds } from '@config/interfaces';

type OperationOptions = {
    type: RebalancingEventType;
    event: RebalancingEvent;
    sourceChainId: SupportedChainIds;
    farmChainId: SupportedChainIds;
    farmId: number;
    amount: bigint;
    user?: string;
    status?: string;
    nextChain?: SupportedChainIds;
};

type OperationAttributes = InferAttributes<Operation>;

class Operation extends Model<InferAttributes<Operation>, InferCreationAttributes<Operation>> {
    declare id: CreationOptional<number>;
    declare event: string; //A,B,C
    declare type: string; //Buy,Sell
    declare user: CreationOptional<string>;
    declare amount: bigint;
    declare sourceChainId: SupportedChainIds;
    declare farmChainId: SupportedChainIds;
    declare farmId: number;
    declare status: string | null;
    declare nextChain: SupportedChainIds | null;
    declare currentStep: CreationOptional<number>;
    declare gasSpent: CreationOptional<number>;
    declare duration: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare hashes: CreationOptional<string[]>;
}

Operation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        farmId: DataTypes.INTEGER,
        type: DataTypes.STRING,
        event: DataTypes.CHAR(1),
        user: DataTypes.CHAR(42),
        sourceChainId: DataTypes.INTEGER,
        farmChainId: DataTypes.INTEGER,
        nextChain: DataTypes.INTEGER,
        status: DataTypes.STRING,
        currentStep: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        gasSpent: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        amount: {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        duration: {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        hashes: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    },
    {
        sequelize: SequelizeAgent.getInstance(),
        tableName: 'operations',
        timestamps: true,
        deletedAt: false
    }
);

export { Operation, OperationOptions, OperationAttributes };
