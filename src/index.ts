import { Worker, isMainThread, workerData } from 'worker_threads'; //!use worker threads for parallel event listening
import { ETHConfig } from '@config/index';
import { EthereumConnector } from '@chain/connectors';
import Core from '@chain/core';
import ChainServce from '@chain/index';

import RebalancerService from '@rebalancer/index';
import RebalancerRepo from '@rebalancer/repository/index';
import { SequelizeAgent } from '@libs/sequelize';
import { log, chainLog } from '@libs/logger';

async function main() {
    const prevLogger = console.log;
    console.log = (...data: any[]) => log(prevLogger, ...data);

    const repo = new RebalancerRepo();
    const rebalancer = new RebalancerService(repo);

    const watchedFarms = [8, 9];

    if (isMainThread) {
        console.log('Starting main thread ...');
        SequelizeAgent.getInstance();
        await SequelizeAgent.connect();
        console.log('Main thread started! Starting working threads...');
        watchedFarms.forEach((el) => {
            const worker = new Worker(__filename, {
                workerData: {
                    pid: el
                }
            });

            worker.on('message', () => {}); //TODO handle workers response
        });
        console.log('Every thread started!');
    } else {
        const pid: number = workerData.pid;
        const connector = new EthereumConnector(ETHConfig);
        const core = new Core(connector, ETHConfig, pid);
        const service = new ChainServce(core, rebalancer);

        const chainId = core.getChainId();
        console.log = (...data) => chainLog(prevLogger, chainId, ...data);
        console.log(`Working thread for farm ${pid} have been started!`);
        service.startEventLoop();
        //TODO? send info to mainThread
    }
}

main();
