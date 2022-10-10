import { suite, test } from '@testdeck/mocha';
import CoreService from '../../../src/services/chain/core';
import { ETHConfig } from '../../../src/services/config';
import { Config } from '../../../src/services/config/interfaces';
import * as _chai from 'chai';
import { expect } from 'chai';
import { IConnector } from '../../../src/services/chain/interfaces';

class TestPrivateWrap extends CoreService {
    constructor(connector: IConnector, config: Config, pid: number) {
        super(connector, config, pid);
    }
}

_chai.should();
_chai.expect;

@suite
// @ts-ignore
// eslint-disable-next-line
class EthereumConnectorUnitTest {
    private core: TestPrivateWrap;

    before() {
        this.core = new TestPrivateWrap(ETHConfig, 26);
    }
}
