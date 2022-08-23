export interface IChainService {
    startEventLoop: () => void;
    handlerRouter: () => void;
}
export interface ICore {
    getEvents: () => Event[]; //! TODO interface
    getBlock: () => number;
    getBlockDelay: () => number;
}

export interface IConnector {
    sendTx: () => void;
}
