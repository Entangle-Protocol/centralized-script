import { IConnector, ICore } from '../interfaces';

export default class ChainCore implements ICore {
    constructor(private readonly connector: IConnector) {}
}
