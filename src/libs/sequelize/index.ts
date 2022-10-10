import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

export class SequelizeAgent {
    private static instance: Sequelize;

    constructor() {
        throw new Error(`Use SequelizeAgent.getInstance()`);
    }

    public static getInstance(): Sequelize {
        if (SequelizeAgent.instance) {
            return SequelizeAgent.instance;
        }

        SequelizeAgent.instance = new Sequelize(process.env.DB_URL as string, {
            logging: false
        });

        return SequelizeAgent.instance;
    }

    public static async connect() {
        try {
            await SequelizeAgent.instance.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
}
