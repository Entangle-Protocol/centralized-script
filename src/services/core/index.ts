import ETHService from '../eth';

export default class CoreService {
    constructor(private ethService: ETHService) {}

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
