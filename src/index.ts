import 'module-alias/register';
import { Worker, isMainThread, workerData } from 'worker_threads'; //!use worker threads for parallel event listening
import { ETHConfig } from '@config/index';
import { EthereumConnector } from '@chain/connectors';
import Core from '@chain/core';
import ChainServce from '@chain/index';

import RebalancerService from '@rebalancer/index';
import { SequelizeAgent } from '@libs/sequelize';

async function main() {
    SequelizeAgent.getInstance();
    await SequelizeAgent.connect();

    const watchedFarms = [8, 67, 7, 26];

    if (isMainThread) {
        watchedFarms.forEach((el) => {
            const worker = new Worker(__filename, {
                workerData: {
                    pid: el
                }
            });

            worker.on('message', () => {}); //TODO handle workers response
        });
    } else {
        const pid: number = workerData.pid;
        const connector = new EthereumConnector(ETHConfig);
        const core = new Core(connector, ETHConfig, pid);
        const rebalancer = new RebalancerService();
        const service = new ChainServce(core, rebalancer);

        service.startEventLoop();
        //TODO? send info to mainThread
    }
}

main();
