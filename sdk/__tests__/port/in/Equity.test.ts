import {
  SDK,
  LoggerTransports,
  CreateEquityRequest,
  SupportedWallets,
  Network,
  RoleRequest,
  Role,
  Equity,
  SetDividendsRequest,
  GetDividendsRequest,
  GetAllDividendsRequest,
  SetVotingRightsRequest,
  GetVotingRightsRequest,
  GetAllVotingRightsRequest,
  GetDividendsForRequest,
  GetVotingRightsForRequest,
} from '../../../src/index.js';
import {
  BUSINESS_LOGIC_KEYS_COMMON,
  BUSINESS_LOGIC_KEYS_EQUITY,
  BUSINESS_LOGIC_KEYS_BOND,
  CLIENT_ACCOUNT_ECDSA,
  FACTORY_ADDRESS,
  RESOLVER_ADDRESS,
} from '../../config.js';
import ConnectRequest from '../../../src/port/in/request/ConnectRequest.js';
import { Wallet, ethers } from 'ethers';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import { RPCTransactionAdapter } from '../../../src/port/out/rpc/RPCTransactionAdapter.js';
import NetworkService from '../../../src/app/service/NetworkService.js';
import { MirrorNodeAdapter } from '../../../src/port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../src/port/out/rpc/RPCQueryAdapter.js';
import SecurityViewModel from '../../../src/port/in/response/SecurityViewModel.js';
import Injectable from '../../../src/core/Injectable.js';
import { SecurityRole } from '../../../src/domain/context/security/SecurityRole.js';
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from '../../../src/domain/context/factory/RegulationType.js';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };

const decimals = 0;
const name = 'TEST_SECURITY_TOKEN';
const symbol = 'TEST';
const isin = 'ABCDE123456Z';
const votingRight = true;
const informationRight = false;
const liquidationRight = true;
const subscriptionRight = false;
const convertionRight = true;
const redemptionRight = false;
const putRight = true;
const dividendRight = 1;
const currency = '0x858368';
const numberOfShares = 200000;
const nominalValue = 1000;
const regulationType = RegulationType.REG_D;
const regulationSubType = RegulationSubType.C_506;
const countries = 'AF,HG,BN';
const info = 'Anything';

const mirrorNode: MirrorNode = {
  name: 'testmirrorNode',
  baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
};

const rpcNode: JsonRpcRelay = {
  name: 'testrpcNode',
  baseUrl: 'http://127.0.0.1:7546/api',
};

describe('🧪 Equity test', () => {
  let th: RPCTransactionAdapter;
  let ns: NetworkService;
  let mirrorNodeAdapter: MirrorNodeAdapter;
  let rpcQueryAdapter: RPCQueryAdapter;
  let equity: SecurityViewModel;

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
      businessLogicKeysCommon: BUSINESS_LOGIC_KEYS_COMMON,
      businessLogicKeysEquity: BUSINESS_LOGIC_KEYS_EQUITY,
      businessLogicKeysBond: BUSINESS_LOGIC_KEYS_BOND,
    };
    ns.mirrorNode = mirrorNode;
    ns.rpcNode = rpcNode;

    await th.init(true);
    await th.register(undefined, undefined, true);

    const url = 'http://127.0.0.1:7546';
    const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

    th.signerOrProvider = new Wallet(
      CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
      customHttpProvider,
    );

    await Network.connect(
      new ConnectRequest({
        account: {
          accountId: CLIENT_ACCOUNT_ECDSA.id.toString(),
          privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
        },
        network: 'testnet',
        wallet: SupportedWallets.METAMASK,
        mirrorNode: mirrorNode,
        rpcNode: rpcNode,
        debug: true,
      }),
    );

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
    });

    equity = (await Equity.create(requestST)).security;

    console.log('equity: ' + JSON.stringify(equity));
  }, 600_000);

  it('Dividends', async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );

    const amount = '1';
    const recordTimestamp = Math.ceil(new Date().getTime() / 1000) + 1000;
    const executionTimestamp = recordTimestamp + 1000;

    await Equity.setDividends(
      new SetDividendsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        amountPerUnitOfSecurity: amount,
        recordTimestamp: recordTimestamp.toString(),
        executionTimestamp: executionTimestamp.toString(),
      }),
    );

    const dividend = await Equity.getDividends(
      new GetDividendsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        dividendId: 1,
      }),
    );

    const allDividends = await Equity.getAllDividends(
      new GetAllDividendsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
      }),
    );

    const dividendFor = await Equity.getDividendsFor(
      new GetDividendsForRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        dividendId: 1,
      }),
    );

    expect(dividend.amountPerUnitOfSecurity).toEqual(amount);
    expect(dividend.dividendId).toEqual(1);
    expect(dividend.executionDate.getTime() / 1000).toEqual(executionTimestamp);
    expect(dividend.recordDate.getTime() / 1000).toEqual(recordTimestamp);
    expect(dividendFor.value).toEqual('0');
    expect(allDividends.length).toEqual(1);

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );
  }, 60_000);

  it('VotingRights', async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );

    const recordTimestamp = Math.ceil(new Date().getTime() / 1000) + 1000;
    const data = '0x0123456789ABCDEF';

    await Equity.setVotingRights(
      new SetVotingRightsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        recordTimestamp: recordTimestamp.toString(),
        data: data,
      }),
    );

    const voting = await Equity.getVotingRights(
      new GetVotingRightsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        votingId: 1,
      }),
    );

    const allVotings = await Equity.getAllVotingRights(
      new GetAllVotingRightsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
      }),
    );

    const votingFor = await Equity.getVotingRightsFor(
      new GetVotingRightsForRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        votingId: 1,
      }),
    );

    expect(voting.votingId).toEqual(1);
    expect(voting.recordDate.getTime() / 1000).toEqual(recordTimestamp);
    expect(voting.data.toUpperCase()).toEqual(data.toUpperCase());
    expect(votingFor.value).toEqual('0');
    expect(allVotings.length).toEqual(1);

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );
  }, 60_000);
});
