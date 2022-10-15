import { Worker, isMainThread, workerData } from 'worker_threads';
import { ETHConfig } from '@config/index';
import { EthereumConnector } from '@chain/connectors';
import Core from '@chain/core';
import ChainServce from '@chain/index';

import RebalancerService from '@rebalancer/index';
import RebalancerRepo from '@rebalancer/repository/index';
import { SequelizeAgent } from '@libs/sequelize';
import { log, chainLog, line } from '@libs/logger';

async function main() {
    const prevLogger = console.log;
    const db = SequelizeAgent.getInstance();

    const repo = new RebalancerRepo(db);
    const rebalancer = new RebalancerService(repo);

    const watchedFarms: number[] = [8, 9];
    console.log = (...data) => log(prevLogger, ...data);
    console.info = () => line(prevLogger);

    if (isMainThread) {
        console.log('Starting main thread ...');
        await SequelizeAgent.connect();
        await db.sync({ alter: true });
        console.log('Main thread started! Starting working threads...');
        watchedFarms.forEach((el, index) => {
            const worker = new Worker(__filename, {
                workerData: {
                    pid: el,
                    index
                }
            });

            worker.on('message', () => {}); //TODO handle workers response
            worker.on('error', (err) => {
                console.log(err);
            });
        });
        console.log('Every thread started!');
    } else {
        const pid: number = workerData.pid;
        const connector = new EthereumConnector(ETHConfig);
        const core = new Core(connector, ETHConfig, pid);
        const service = new ChainServce(core, rebalancer);

        const chainId = core.getChainId();
        console.log = (...data) => chainLog(prevLogger, chainId, workerData.index, ...data);
        console.log(`Working thread for farm ${pid} have been started!`);
        service.startEventLoop();
    }
}

main();
