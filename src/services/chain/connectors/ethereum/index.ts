import { IConnector, EventLog, SendTxOptions, GetContractEventsOptions } from '@chain/interfaces';
import { Config, SupportedChainIds } from '@config/interface';
import Web3 from 'web3';

export default class EthereumConnector implements IConnector {
    constructor(private readonly config: Config) {}

    public async sendTx(o: SendTxOptions): Promise<void> {}
    public async getContractEvents(o: GetContractEventsOptions): Promise<EventLog[]> {
        const { fromBlock, toBlock, address, eventSignature, chainId } = o;
        const provider = this.getProvider(chainId);
        const topics = eventSignature.map((el) => provider.utils.sha3(el));
        try {
            const events = await provider.eth.getPastLogs({
                fromBlock,
                toBlock,
                address,
                topics
            });
            return events;
        } catch (error) {
            console.log(error);
            const events = await this.getContractEvents(o);
            return events;
        }
    }

    public async getBlock(chainId: SupportedChainIds): Promise<number> {
        const provider = this.getProvider(chainId);
        try {
            const blockNumber = await provider.eth.getBlockNumber();
            return blockNumber;
        } catch (error) {
            console.log(error);
            return 0;
        }
    }

    public getBlockDelay(chainId: SupportedChainIds): number {
        return this.config.networks[chainId].blockTime;
    }

    private getProvider(chainId: SupportedChainIds) {
        const url = this.config.networks[chainId].url;
        return new Web3(url);
    }
}
