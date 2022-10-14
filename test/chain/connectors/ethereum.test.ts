import { suite, test } from '@testdeck/mocha';
import { EthereumConnector } from '../../../src/services/chain/connectors';
import { ETHConfig } from '../../../src/services/config';
import { Config } from '../../../src/services/config/interfaces';
import { Handler } from '../../../src/services/chain/interfaces';
import * as _chai from 'chai';
import { expect } from 'chai';
import { Log } from 'web3-core';
import { EventInfo } from '../../../src/services/config/interfaces';

class TestPrivateWrap extends EthereumConnector {
    constructor(config: Config) {
        super(config);
    }

    public _normalizeData(
        _eventInfo: EventInfo[],
        e: Log[],
        sigsToTopics: { [key: string]: string }
    ) {
        return this.normalizeData(_eventInfo, e, sigsToTopics);
    }

    public _encodeData(d: Handler): string {
        return this.encodeData(d);
    }

    public _createSignature(e: EventInfo): string {
        return this.createSignature(e);
    }
}

_chai.should();
_chai.expect;

@suite
// @ts-ignore
// eslint-disable-next-line
class EthereumConnectorUnitTest {
    private connector: TestPrivateWrap;

    before() {
        this.connector = new TestPrivateWrap(ETHConfig);
    }

    @test 'Should encode address properly'() {
        const mockHandler: Handler = {
            method: 'test',
            params: [
                {
                    name: 'testAddress',
                    chainParamType: 'address',
                    value: '0x021CBd1B7D4B4C9eA2fC89258b4253A121A60C76'
                }
            ]
        };
        const encoded = this.connector._encodeData(mockHandler);
        expect(encoded).to.be.equal(
            '0xbb29998e000000000000000000000000021cbd1b7d4b4c9ea2fc89258b4253a121a60c76'
        );
    }

    @test 'Should encode uint256 properly'() {
        const mockHandler: Handler = {
            method: 'test',
            params: [
                {
                    name: 'testAddress',
                    chainParamType: 'uint256',
                    value: 25
                }
            ]
        };
        const encoded = this.connector._encodeData(mockHandler);
        expect(encoded).to.be.equal(
            '0x29e99f070000000000000000000000000000000000000000000000000000000000000019'
        );
    }

    @test 'Should encode bytes properly'() {
        const mockHandler: Handler = {
            method: 'test',
            params: [
                {
                    name: 'testAddress',
                    chainParamType: 'bytes32',
                    value: 'test-string'
                }
            ]
        };
        const encoded = this.connector._encodeData(mockHandler);
        expect(encoded).to.be.equal(
            '0x99372321746573742d737472696e67000000000000000000000000000000000000000000'
        );
    }

    @test 'Should create right event signature'() {
        const e: EventInfo = {
            signature: 'Test',
            parameters: [
                {
                    first_param: 'address'
                },
                {
                    second_param: 'uint256'
                }
            ]
        };

        const sig = this.connector._createSignature(e);
        expect(sig).to.be.equal('Test(address,uint256)')
    }
}
