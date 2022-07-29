import Web3 from 'web3';
import { Config, Network, SupportedChainIds } from '../config/interface';

export default class Web3Client {
    constructor(private readonly config: Config) {}

    createHttpClient(chainId: SupportedChainIds): Web3 | null {
        if (this.config.networks[chainId]) {
            return new Web3((this.config.networks[chainId] as Network).url);
        } else {
            return null;
        }
    }
}
