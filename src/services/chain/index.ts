import { ICore, IChainService } from './interfaces';

export default class ChainService implements IChainService {
    constructor(private readonly core: ICore) {}
}
