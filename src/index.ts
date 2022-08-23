import { Worker, isMainThread, workerData } from 'worker_threads'; //!use worker threads for parallel event listening
import { ETHConfig } from './services/config';
import ETHService from './services/chain/connectors/eth';
import CoreService from './services/core';

const ethService = new ETHService(ETHConfig);
const coreService = new CoreService(ethService);

async function main() {
    const watchedFarms = [8, 67, 7, 26];

    if (isMainThread) {
        watchedFarms.forEach((el) => {
            const worker = new Worker(__filename, {
                workerData: {
                    pid: el
                }
            });

            worker.on('message', (msg) => {}); //TODO handle workers response
        });
    } else {
        const pid: number = workerData.pid;
        await coreService.eventCheckerLoop(pid); //start core service listener and handler
        //TODO? send info to mainThread
    }
}

main();
