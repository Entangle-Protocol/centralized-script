import { runInThisContext } from 'vm';
import ETHService from '../eth';

export default class CoreService {
    constructor(private ethService: ETHService) {}
    // help ||
    //TODO! check if it woks!
    async await(delay: number) {
        await new Promise((resolve) =>
            setTimeout(() => {
                resolve(true);
            }, delay)
        );
    }

    async eventCheckerLoop(pid: number): Promise<void> {
        const selectedFarmObj = this.ethService.compiledFarmsContracts.find(
            (farm) => farm.pid == pid
        );

        if (!selectedFarmObj) throw new Error(`Farm with pid ${pid} not found!`);

        //TODO get initial blocks
        const blockFrom = 0;
        const blockTo = 0;

        const blockDelay = this.ethService.getDelayTime(selectedFarmObj?.chainId) || 6000;

        while (true) {
            try {
                //TODO update blockFrom, blockTo;

                const timeStart = Date.now();
                const events = await this.ethService.getAllContractsEvents(
                    selectedFarmObj,
                    blockFrom,
                    blockTo
                );

                //TODO handle events

                if (events.router) {
                    events.router.forEach((el: any) => {
                        if (Array.isArray(el)) {
                            if (el[el.length - 1].event == 'DEXRebalancing') {
                                switch (el[el.length - 1].returnValues.id) {
                                    case 1:
                                        this.ethService.eventAHandler(
                                            el[el.length - 1].returnValues.pid,
                                            el[el.length - 1].returnValues.kof,
                                            el[el.length - 1].returnValues.id
                                        );
                                        break;
                                    case 2:
                                        this.ethService.eventAHandler(
                                            el[el.length - 1].returnValues.pid,
                                            el[el.length - 1].returnValues.kof,
                                            el[el.length - 1].returnValues.id
                                        );
                                        break;
                                    case 3:
                                        break;
                                    case 4:
                                        break;
                                }
                            } else if (el[el.length - 1].event == 'Deposit') {
                                this.ethService.depositEventHandler();
                            } else if (el[el.length - 1].event == 'Withdraw') {
                                this.ethService.withdrawBridgeEventHandler();

                            } else if (el[el.length - 1].event == 'Bridge') {
                                this.ethService.bridgeEventHandler();
                            }
                        } else {
                            if (el.event == 'DEXRebalancing') {
                                const { pid, kof, id } = el.returnValues;
                                switch (id) {
                                    case 1:
                                        this.ethService.eventAHandler(pid, kof, id);
                                        break;
                                    case 2:
                                        this.ethService.eventAHandler(pid, kof, id);
                                        break;
                                    case 3:
                                        break;
                                    case 4:
                                        break;
                                }
                            } else if (el.event == 'Deposit') {
                                this.ethService.depositEventHandler();
                            } else if (el.event == 'Withdraw') {
                                this.ethService.withdrawBridgeEventHandler();
                            } else if (el.event == 'Bridge') {
                                this.ethService.bridgeEventHandler();
                            }
                        }
                    });
                }

                const timeEnd = Date.now();
                if (timeEnd - timeStart < blockDelay) {
                    this.await(timeEnd - timeStart); //lets wait until new blocks
                }
            } catch (error) {
                //TODO? error handler (continue or ?);
            }
        }
    }
}
