import {
    IConnector,
    EventLog,
    SendTxRawOptions,
    GetContractEventsOptions,
    SendTxRawReturn,
    Handler,
    anyObject
} from '@chain/interfaces';
import { Config, EventInfo, SupportedChainIds } from '@config/interfaces';
import Web3 from 'web3';
import { Log, TransactionConfig } from 'web3-core';
import { Utils } from 'web3-utils';
import * as dotenv from 'dotenv';

dotenv.config();

export default class EthereumConnector implements IConnector {
    private utils: Utils;
    private wallet: {
        address: string;
        pk: string;
    };

    constructor(private readonly config: Config) {
        this.utils = new Web3().utils;
        this.wallet = {
            address: process.env.WALLET_ADDRESS as string,
            pk: process.env.WALLET_PK as string
        };
    }

    public async sendTxRaw(o: SendTxRawOptions): Promise<SendTxRawReturn> {
        const { chainId, address: to, data, call } = o;
        const web3 = this.getProvider(chainId);
        const encodedData = this.encodeData(data);
        const gas = await this.estimateGas(to, encodedData, chainId);
        const txObject: TransactionConfig = {
            chainId: chainId,
            to,
            gas,
            gasPrice: await web3.eth.getGasPrice(),
            data: encodedData
        };
        console.log(txObject);
        if (!call) {
            const signed = await web3.eth.accounts.signTransaction(txObject, this.wallet.pk);
            return new Promise((resolve, reject) => {
                if (!signed.rawTransaction) {
                    reject(`Error while signing tx!`);
                } else {
                    web3.eth
                        .sendSignedTransaction(signed.rawTransaction)
                        .on('confirmation', (confirmation, receipt) => {
                            if (confirmation >= 1) {
                                const result: SendTxRawReturn = {
                                    gas: receipt.gasUsed,
                                    hash: receipt.transactionHash
                                };

                                resolve(result);
                            }
                        });
                }
            });
        } else {
            return new Promise((resolve) => {
                web3.eth.call(txObject).then((data) =>
                    resolve({
                        value: data
                    })
                );
            });
        }
    }

    protected createSignature(e: EventInfo): string {
        return `${e.signature}(${e.parameters
            .reduce((pv, cv) => pv + Object.values(cv)[0] + ',', '')
            .slice(0, -1)})`;
    }

    public async getContractEvents(o: GetContractEventsOptions): Promise<EventLog[]> {
        const { fromBlock, toBlock, address, eventInfo, chainId } = o;
        const provider = this.getProvider(chainId);
        const signaturesToTopics: { [key: string]: string } = {};
        const topics = eventInfo.map((el) => {
            const hash = provider.utils.keccak256(this.createSignature(el));
            if (hash) {
                signaturesToTopics[hash] = el.signature;
            }
            return hash;
        });
        try {
            let events: Log[] = [];
            for (let i = 0; i < topics.length; i++) {
                const eventsChunk = await provider.eth.getPastLogs({
                    fromBlock,
                    toBlock,
                    address,
                    topics: [topics[i]]
                });
                events = events.concat(eventsChunk);
            }
            return this.normalizeData(eventInfo, events, signaturesToTopics);
        } catch (error) {
            console.log(error);
            return [];
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

    private getProvider(chainId?: SupportedChainIds) {
        if (!chainId) {
            return new Web3();
        }
        const url = this.config.networks[chainId].url;
        return new Web3(url);
    }

    protected normalizeData(
        _eventInfo: EventInfo[],
        e: Log[],
        sigsToTopics: { [key: string]: string }
    ): EventLog[] {
        const normalizedEvents: EventLog[] = e.map((event) => {
            const eventInfo = _eventInfo.find(
                (el) => el.signature == sigsToTopics[event.topics[0]]
            );
            const eventParameters = eventInfo?.parameters;
            if (eventParameters) {
                const parametersType = eventParameters.map((el) => Object.values(el)[0]);
                const parameters: anyObject = {};
                const parametersValues = this.getProvider().eth.abi.decodeParameters(
                    parametersType,
                    event.data
                );
                parametersType.forEach((type, i) => {
                    if (type == 'bytes') {
                        parametersValues[i] = this.utils.hexToAscii(parametersValues[i]);
                    }
                });
                eventParameters.forEach((param, i) => {
                    parameters[Object.keys(param)[0]] = parametersValues[i];
                });
                const updated: EventLog = {
                    eventSignature: sigsToTopics[event.topics[0]],
                    parameters: parameters,
                    chainParametersTypes: eventParameters,
                    ...event
                };
                return updated;
            } else {
                return {
                    eventSignature: sigsToTopics[event.topics[0]],
                    parameters: {},
                    chainParametersTypes: [],
                    ...event
                };
            }
        });
        return normalizedEvents;
    }

    protected encodeData(d: Handler): string {
        const web3 = this.getProvider();

        const func = `${d.method}(${d.params
            .reduce((pValue, cValue) => pValue + ',' + cValue.chainParamType, '')
            .slice(1)})`;
        const methodSignature = web3.eth.abi.encodeFunctionSignature(func);
        let paramToString = '';
        d.params.forEach((p) => {
            if (!Array.isArray(p.value)) {
                const paramHex =
                    p.chainParamType == 'bytes32'
                        ? this.utils.asciiToHex(p.value.toString())
                        : p.value.toString().toLowerCase();
                const encodedParam = web3.eth.abi
                    .encodeParameter(p.chainParamType, paramHex)
                    .substring(2);
                paramToString += encodedParam;
            } else {
                const innerParamToObj: anyObject = {};
                const innerParamValue: anyObject = {};
                p.value.forEach((ip) => {
                    innerParamToObj[ip.name] = ip.chainParamType;
                    innerParamValue[ip.name] =
                        ip.chainParamType == 'bytes32'
                            ? this.utils.asciiToHex(ip.value.toString())
                            : ip.value.toString().toLowerCase();
                });
                const encodedParams = web3.eth.abi.encodeParameter(
                    { data: innerParamToObj },
                    innerParamValue
                );
                paramToString += web3.eth.abi
                    .encodeParameter(p.chainParamType, encodedParams)
                    .substring(2);
            }
        });
        return methodSignature + paramToString;
    }

    private async estimateGas(
        to: string,
        data: string,
        chainId: SupportedChainIds
    ): Promise<number> {
        try {
            const web3 = this.getProvider(chainId);
            const gas = await web3.eth.estimateGas({
                to,
                data
            });

            return gas;
        } catch (error) {
            console.log(error);
            throw new Error(`Can't estimate gas! To: ${to}, Data: ${data}`);
        }
    }
}
