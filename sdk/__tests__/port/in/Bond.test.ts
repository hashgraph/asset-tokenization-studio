import {
  SDK,
  LoggerTransports,
  CreateBondRequest,
  GetBondDetailsRequest,
  GetCouponDetailsRequest,
  GetCouponRequest,
  GetAllCouponsRequest,
  SupportedWallets,
  Network,
  Bond,
  GetCouponForRequest,
  Role,
  RoleRequest,
  SetCouponRequest,
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
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import NetworkService from '../../../src/app/service/NetworkService.js';
import SecurityViewModel from '../../../src/port/in/response/SecurityViewModel.js';
import Injectable from '../../../src/core/Injectable.js';
import { SecurityRole } from '../../../src/domain/context/security/SecurityRole.js';
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from '../../../src/domain/context/factory/RegulationType.js';
import { RPCQueryAdapter } from '../../../src/port/out/rpc/RPCQueryAdapter.js';
import { MirrorNodeAdapter } from '../../../src/port/out/mirror/MirrorNodeAdapter.js';
import { RPCTransactionAdapter } from '../../../src/port/out/rpc/RPCTransactionAdapter.js';
import { Wallet, ethers } from 'ethers';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };

const decimals = 0;
const name = 'TEST_SECURITY_TOKEN';
const symbol = 'TEST';
const isin = 'ABCDE123456Z';
const currency = '0x455552';
const TIME = 30;
const numberOfUnits = '1000';
const nominalValue = '100';
const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000) + 1000;
const startingDate = currentTimeInSeconds + TIME;
const numberOfCoupons = 15;
const couponFrequency = 7;
const couponRate = '3';
const maturityDate = startingDate + numberOfCoupons * couponFrequency;
const firstCouponDate = startingDate + 1;
const regulationType = RegulationType.REG_S;
const regulationSubType = RegulationSubType.NONE;
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

describe('🧪 Bond test', () => {
  let th: RPCTransactionAdapter;
  let ns: NetworkService;
  let mirrorNodeAdapter: MirrorNodeAdapter;
  let rpcQueryAdapter: RPCQueryAdapter;
  let bond: SecurityViewModel;

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
    //await th.register(undefined, true);

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

    const requestST = new CreateBondRequest({
      name: name,
      symbol: symbol,
      isin: isin,
      decimals: decimals,
      isWhiteList: false,
      isControllable: true,
      isMultiPartition: false,
      diamondOwnerAccount: CLIENT_ACCOUNT_ECDSA.id.toString(),
      currency: currency,
      numberOfUnits: numberOfUnits.toString(),
      nominalValue: nominalValue,
      startingDate: startingDate.toString(),
      maturityDate: maturityDate.toString(),
      couponFrequency: couponFrequency.toString(),
      couponRate: couponRate,
      firstCouponDate: firstCouponDate.toString(),
      regulationType: CastRegulationType.toNumber(regulationType),
      regulationSubType: CastRegulationSubType.toNumber(regulationSubType),
      isCountryControlListWhiteList: true,
      countries: countries,
      info: info,
    });

    Injectable.resolveTransactionHandler();

    bond = (await Bond.create(requestST)).security;

    console.log('bond: ' + JSON.stringify(bond));
  }, 600_000);

  it('Check Bond Details', async () => {
    const bondDetails = await Bond.getBondDetails(
      new GetBondDetailsRequest({
        bondId: bond.evmDiamondAddress!.toString(),
      }),
    );

    expect(bondDetails.currency).toEqual(currency);
    expect(bondDetails.nominalValue).toEqual(nominalValue);
    expect(bondDetails.startingDate.getTime() / 1000).toEqual(startingDate);
    expect(bondDetails.maturityDate.getTime() / 1000).toEqual(maturityDate);
  }, 60_000);

  it('Check Coupon Details', async () => {
    const couponDetails = await Bond.getCouponDetails(
      new GetCouponDetailsRequest({
        bondId: bond.evmDiamondAddress!.toString(),
      }),
    );

    expect(couponDetails.couponFrequency).toEqual(couponFrequency);
    expect(couponDetails.couponRate).toEqual(couponRate);
    expect(couponDetails.firstCouponDate.getTime() / 1000).toEqual(
      firstCouponDate,
    );
  }, 600_000);

  it('Coupons Fixed', async () => {
    const coupon = await Bond.getCoupon(
      new GetCouponRequest({
        securityId: bond.evmDiamondAddress!.toString(),
        couponId: 1,
      }),
    );

    const allCoupon = await Bond.getAllCoupons(
      new GetAllCouponsRequest({
        securityId: bond.evmDiamondAddress!.toString(),
      }),
    );

    const couponFor = await Bond.getCouponFor(
      new GetCouponForRequest({
        securityId: bond.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        couponId: 1,
      }),
    );

    expect(coupon.rate).toEqual(couponRate);
    expect(coupon.couponId).toEqual(1);
    expect(coupon.recordDate.getTime() / 1000).toEqual(firstCouponDate);
    expect(coupon.executionDate.getTime() / 1000).toEqual(firstCouponDate);
    expect(couponFor.value).toEqual('0');
    expect(allCoupon.length).toEqual(numberOfCoupons);
  }, 600_000);

  it('Coupons Custom', async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: bond.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );

    const rate = '1';
    const recordTimestamp = Math.ceil(new Date().getTime() / 1000) + 1000;
    const executionTimestamp = recordTimestamp + 1000;

    await Bond.setCoupon(
      new SetCouponRequest({
        securityId: bond.evmDiamondAddress!.toString(),
        rate: rate,
        recordTimestamp: recordTimestamp.toString(),
        executionTimestamp: executionTimestamp.toString(),
      }),
    );

    const coupon = await Bond.getCoupon(
      new GetCouponRequest({
        securityId: bond.evmDiamondAddress!.toString(),
        couponId: numberOfCoupons + 1,
      }),
    );

    expect(coupon.couponId).toEqual(numberOfCoupons + 1);
    expect(coupon.recordDate.getTime() / 1000).toEqual(recordTimestamp);
    expect(coupon.executionDate.getTime() / 1000).toEqual(executionTimestamp);
  }, 600_000);
});
