import { ICore, IChainService, GetEventsReturn } from './interfaces';

export default class ChainService implements IChainService {
    constructor(private readonly core: ICore) {}

    public async startEventLoop(): Promise<void> {
        //TODO get initial blocks
        let fromBlock = await this.core.getBlock();
        let toBlock = fromBlock;

        const blockDelay = this.core.getBlockDelay() || 6000;

        while (true) {
            try {
                toBlock = await this.core.getBlock();
                const timeStart = Date.now();
                if (fromBlock != toBlock) {
                    const events = await this.core.getEvents({
                        fromBlock,
                        toBlock
                    });
                    await this.handlerRouter(events);
                }

                const timeEnd = Date.now();
                if (timeEnd - timeStart < blockDelay) {
                    this._await(timeEnd - timeStart); //lets wait until new blocks
                }
                fromBlock = toBlock;
            } catch (error) {
                //TODO? error handler (continue or ?);
            }
        }
    }

    private async handlerRouter(events: Partial<GetEventsReturn>): Promise<void> {}

    private async _await(delay: number) {
        await new Promise((resolve) =>
            setTimeout(() => {
                resolve(true);
            }, delay)
        );
    }
}
