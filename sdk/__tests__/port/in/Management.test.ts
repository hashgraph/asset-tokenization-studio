import {
  CreateEquityRequest,
  Equity,
  LoggerTransports,
  SDK,
  UpdateConfigRequest,
  UpdateConfigVersionRequest,
} from '../../../src';
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from '../../../src/domain/context/factory/RegulationType';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay';
import { RPCTransactionAdapter } from '../../../src/port/out/rpc/RPCTransactionAdapter';
import { MirrorNodeAdapter } from '../../../src/port/out/mirror/MirrorNodeAdapter';
import NetworkService from '../../../src/app/service/NetworkService';
import { RPCQueryAdapter } from '../../../src/port/out/rpc/RPCQueryAdapter';
import SecurityViewModel from '../../../src/port/in/response/SecurityViewModel';
import {
  CLIENT_ACCOUNT_ECDSA,
  FACTORY_ADDRESS,
  RESOLVER_ADDRESS,
} from '../../config';
import Injectable from '../../../src/core/Injectable';
import Account from '../../../src/domain/context/account/Account';
import Management from '../../../src/port/in/Management';
import { ethers, Wallet } from 'ethers';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };

const decimals = 0;
const name = 'TEST_SECURITY_TOKEN';
const symbol = 'TEST';
const isin = 'ABCDE123456Z';
// const type = 'EQUITY';
const votingRight = true;
const informationRight = false;
const liquidationRight = true;
const subscriptionRight = false;
const convertionRight = true;
const redemptionRight = false;
const putRight = true;
const dividendRight = 1;
const currency = '0x345678';
const numberOfShares = 0;
const nominalValue = 1000;
const regulationType = RegulationType.REG_D;
const regulationSubType = RegulationSubType.B_506;
const countries = 'AF,HG,BN';
const info = 'Anything';
const configId =
  '0x0000000000000000000000000000000000000000000000000000000000000000';
const configVersion = 1;

const mirrorNode: MirrorNode = {
  name: 'testmirrorNode',
  baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
};

const rpcNode: JsonRpcRelay = {
  name: 'testrpcNode',
  baseUrl: 'http://127.0.0.1:7546/api',
};

let th: RPCTransactionAdapter;
let mirrorNodeAdapter: MirrorNodeAdapter;

describe('🧪 Management tests', () => {
  let ns: NetworkService;
  let rpcQueryAdapter: RPCQueryAdapter;
  let equity: SecurityViewModel;

  const url = 'http://127.0.0.1:7546';
  const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

  const wallet = new Wallet(
    CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
    customHttpProvider,
  );

  beforeAll(async () => {
    mirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter);
    mirrorNodeAdapter.set(mirrorNode);

    th = Injectable.resolve(RPCTransactionAdapter);
    ns = Injectable.resolve(NetworkService);
    rpcQueryAdapter = Injectable.resolve(RPCQueryAdapter);

    rpcQueryAdapter.init();
    ns.environment = 'testnet';
    ns.configuration = {
      factoryAddress: FACTORY_ADDRESS,
      resolverAddress: RESOLVER_ADDRESS,
    };
    ns.mirrorNode = mirrorNode;
    ns.rpcNode = rpcNode;

    await th.init(true);
    const account = new Account({
      id: CLIENT_ACCOUNT_ECDSA.id.toString(),
      evmAddress: CLIENT_ACCOUNT_ECDSA.evmAddress,
      alias: CLIENT_ACCOUNT_ECDSA.alias,
      privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
      publicKey: CLIENT_ACCOUNT_ECDSA.publicKey,
    });
    await th.register(account, true);

    th.signerOrProvider = wallet;

    const requestST = new CreateEquityRequest({
      name: name,
      symbol: symbol,
      isin: isin,
      decimals: decimals,
      isWhiteList: false,
      isControllable: true,
      isMultiPartition: false,
      diamondOwnerAccount: CLIENT_ACCOUNT_ECDSA.id.toString(),
      votingRight: votingRight,
      informationRight: informationRight,
      liquidationRight: liquidationRight,
      subscriptionRight: subscriptionRight,
      convertionRight: convertionRight,
      redemptionRight: redemptionRight,
      putRight: putRight,
      dividendRight: dividendRight,
      currency: currency,
      numberOfShares: numberOfShares.toString(),
      nominalValue: nominalValue.toString(),
      regulationType: CastRegulationType.toNumber(regulationType),
      regulationSubType: CastRegulationSubType.toNumber(regulationSubType),
      isCountryControlListWhiteList: true,
      countries: countries,
      info: info,
      configId: configId,
      configVersion: configVersion,
    });

    equity = (await Equity.create(requestST)).security;
  }, 900_000);

  it('Update version id', async () => {
    const request = new UpdateConfigVersionRequest({
      configVersion: 2,
      securityId: equity.evmDiamondAddress!,
    });
    const res = await Management.updateConfigVersion(request);
    expect(res.payload).toBe(true);
  }, 600_000);

  it('Update configuration id & version', async () => {
    const request = new UpdateConfigRequest({
      configId:
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      configVersion: 2,
      securityId: equity.evmDiamondAddress!,
    });
    const res = await Management.updateConfig(request);
    expect(res.payload).toBe(true);
  }, 600_000);
});
