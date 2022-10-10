import {
    IConnector,
    EventLog,
    SendTxRawOptions,
    GetContractEventsOptions,
    SendTxRawReturn,
    Handler
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
            gasPrice: await web3.eth.getGasPrice()
        };
        if (!call) {
            const signed = await web3.eth.accounts.signTransaction(txObject, this.wallet.pk);
            return new Promise((resolve, reject) => {
                if (!signed.rawTransaction) {
                    reject(`Error while signing tx!`);
                } else {
                    web3.eth
                        .sendSignedTransaction(signed.rawTransaction)
                        .on('confirmation', (confirmation, receipt) => {
                            if (confirmation >= 50) {
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

    public async getContractEvents(o: GetContractEventsOptions): Promise<EventLog[]> {
        const { fromBlock, toBlock, address, eventInfo, chainId } = o;
        const provider = this.getProvider(chainId);
        const signaturesToTopics: { [key: string]: string } = {};
        const topics = eventInfo.map((el) => {
            const hash = provider.utils.sha3(el.signature);
            if (hash) {
                signaturesToTopics[hash] = el.signature;
            }
            return hash;
        });
        try {
            const events = await provider.eth.getPastLogs({
                fromBlock,
                toBlock,
                address,
                topics
            });
            return this.normalizeData(eventInfo, events, signaturesToTopics);
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
                const parameters: { [key: string]: string | number } = {};
                for (const p of eventParameters) {
                    const i = eventParameters.indexOf(p);
                    const topic = event.topics[i];
                    const type = Object.values(p)[0];
                    const name = Object.keys(p)[0];
                    switch (type) {
                        case 'address': {
                            const normalized = '0x' + topic.slice(-40);
                            parameters[name] = normalized;
                            break;
                        }
                        case 'uint256': {
                            const normalized = this.utils.hexToNumber(topic);
                            parameters[name] = normalized;
                            break;
                        }
                    }
                }
                const updated: EventLog = {
                    eventSignature: sigsToTopics[event.topics[0]],
                    parameters,
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
        const params = d.params.reduce((pV, cV) => {
            if (!Array.isArray(cV.value)) {
                const paramHex =
                    cV.chainParamType == 'bytes'
                        ? this.utils.asciiToHex(cV.value.toString())
                        : cV.value.toString().toLowerCase();
                const encodedParam = web3.eth.abi
                    .encodeParameter(cV.chainParamType, paramHex)
                    .substring(2);
                return pV + encodedParam;
            } else {
                const value = cV.value.reduce((ipV, icV) => {
                    const paramHex =
                        icV.chainParamType == 'bytes'
                            ? this.utils.asciiToHex(cV.value.toString())
                            : icV.value.toString().toLowerCase();
                    const encodedParam = web3.eth.abi
                        .encodeParameter(icV.chainParamType, paramHex)
                        .substring(2);
                    return ipV + encodedParam;
                }, '');
                return value;
            }
        }, '');

        return methodSignature + params;
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
