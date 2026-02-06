//SPDX-License-Identifier: Apache-2.0

import "../environmentMock";
import {
  SDK,
  LoggerTransports,
  CreateBondRequest,
  GetBondDetailsRequest,
  GetCouponRequest,
  GetAllCouponsRequest,
  GetCouponsOrderedListRequest,
  GetCouponFromOrderedListAtRequest,
  SupportedWallets,
  Network,
  Bond,
  GetCouponForRequest,
  Role,
  RoleRequest,
  SetCouponRequest,
  UpdateMaturityDateRequest,
} from "@port/in";
import { CLIENT_ACCOUNT_ECDSA, FACTORY_ADDRESS, RESOLVER_ADDRESS } from "@test/config";
import { TIME_PERIODS_S } from "@core/Constants";
import ConnectRequest from "@port/in/request/network/ConnectRequest";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import NetworkService from "@service/network/NetworkService";
import SecurityViewModel from "@port/in/response/SecurityViewModel";
import Injectable from "@core/injectable/Injectable";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { RPCTransactionAdapter } from "@port/out/rpc/RPCTransactionAdapter";
import { Wallet, ethers } from "ethers";
import BaseError from "@core/error/BaseError";
import { CastRateStatus, RateStatus } from "@domain/context/bond/RateStatus";

SDK.log = { level: "ERROR", transports: new LoggerTransports.Console() };

const decimals = 0;
const name = "TEST_SECURITY_TOKEN";
const symbol = "TEST";
const isin = "ABCDE123456Z";
const currency = "0x455552";
const TIME = 30;
const numberOfUnits = "1000";
const nominalValue = "100";
const nominalValueDecimals = 3;
const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000) + 1000;
const startingDate = currentTimeInSeconds + TIME;
const maturityDate = startingDate + 365; // 1 year maturity
const regulationType = RegulationType.REG_S;
const regulationSubType = RegulationSubType.NONE;
const countries = "AF,HG,BN";
const info = "Anything";
const configId = "0x0000000000000000000000000000000000000000000000000000000000000000";
const configVersion = 0;

const mirrorNode: MirrorNode = {
  name: "testmirrorNode",
  baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/",
};

const rpcNode: JsonRpcRelay = {
  name: "testrpcNode",
  baseUrl: "http://127.0.0.1:7546/api",
};

describe("🧪 Bond test", () => {
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
    ns.environment = "testnet";
    ns.configuration = {
      factoryAddress: FACTORY_ADDRESS,
      resolverAddress: RESOLVER_ADDRESS,
    };
    ns.mirrorNode = mirrorNode;
    ns.rpcNode = rpcNode;

    await th.init(true);
    //await th.register(undefined, true);

    const url = "http://127.0.0.1:7546";
    const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

    th.setSignerOrProvider(new Wallet(CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? "", customHttpProvider));

    await Network.connect(
      new ConnectRequest({
        account: {
          accountId: CLIENT_ACCOUNT_ECDSA.id.toString(),
          privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
        },
        network: "testnet",
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
      erc20VotesActivated: false,
      isControllable: true,
      arePartitionsProtected: false,
      clearingActive: false,
      internalKycActivated: true,
      isMultiPartition: false,
      diamondOwnerAccount: CLIENT_ACCOUNT_ECDSA.id.toString(),
      currency: currency,
      numberOfUnits: numberOfUnits.toString(),
      nominalValue: nominalValue,
      nominalValueDecimals: nominalValueDecimals,
      startingDate: startingDate.toString(),
      maturityDate: maturityDate.toString(),
      regulationType: CastRegulationType.toNumber(regulationType),
      regulationSubType: CastRegulationSubType.toNumber(regulationSubType),
      isCountryControlListWhiteList: true,
      countries: countries,
      info: info,
      configId: configId,
      configVersion: configVersion,
    });

    Injectable.resolveTransactionHandler();

    bond = (await Bond.create(requestST)).security;

    console.log("bond: " + JSON.stringify(bond));
  }, 600_000);

  it("Check Bond Details", async () => {
    const bondDetails = await Bond.getBondDetails(
      new GetBondDetailsRequest({
        bondId: bond.evmDiamondAddress!.toString(),
      }),
    );

    expect(bondDetails.currency).toEqual(currency);
    expect(bondDetails.nominalValue).toEqual(nominalValue);
    expect(bondDetails.nominalValueDecimals).toEqual(nominalValueDecimals);
    expect(bondDetails.startingDate.getTime() / 1000).toEqual(startingDate);
    expect(bondDetails.maturityDate.getTime() / 1000).toEqual(maturityDate);
  }, 60_000);

  it("Coupons Fixed", async () => {
    // Manually create a coupon since automatic creation was removed
    const couponRate = "3";
    const couponRecordDate = startingDate + 30;
    const couponExecutionDate = startingDate + 35;
    const couponFixingDate = startingDate + 25;

    await Bond.setCoupon(
      new SetCouponRequest({
        securityId: bond.evmDiamondAddress!.toString(),
        rate: couponRate,
        recordTimestamp: couponRecordDate.toString(),
        executionTimestamp: couponExecutionDate.toString(),
        startTimestamp: "0",
        endTimestamp: TIME_PERIODS_S.DAY.toString(),
        fixingTimestamp: couponFixingDate.toString(),
        rateStatus: CastRateStatus.toNumber(RateStatus.SET),
      }),
    );

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

    const couponAmountFor = await Bond.getCouponAmountFor(
      new GetCouponForRequest({
        securityId: bond.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        couponId: 1,
      }),
    );

    expect(coupon.rate).toEqual(couponRate);
    expect(coupon.rateDecimals).toEqual(0);
    expect(coupon.couponId).toEqual(1);
    expect(coupon.recordDate.getTime() / 1000).toEqual(couponRecordDate);
    expect(coupon.executionDate.getTime() / 1000).toEqual(couponExecutionDate);
    expect(couponFor.tokenBalance).toEqual("0");
    expect(couponFor.decimals).toEqual("0");
    expect(allCoupon.length).toEqual(1); // Now only 1 manually created coupon
    expect(couponAmountFor.numerator).toEqual("5");
    expect(couponAmountFor.denominator).toEqual("3");
    expect(couponAmountFor.recordDateReached).toEqual(true);
  }, 600_000);

  it("Coupons Custom", async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: bond.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );

    const rate = "1";
    const recordTimestamp = Math.ceil(new Date().getTime() / 1000) + 1000;
    const executionTimestamp = recordTimestamp + 1000;
    const couponFixingDate = recordTimestamp - 1000;

    await Bond.setCoupon(
      new SetCouponRequest({
        securityId: bond.evmDiamondAddress!.toString(),
        rate: rate,
        recordTimestamp: recordTimestamp.toString(),
        executionTimestamp: executionTimestamp.toString(),
        startTimestamp: "0",
        endTimestamp: TIME_PERIODS_S.DAY.toString(),
        fixingTimestamp: couponFixingDate.toString(),
        rateStatus: CastRateStatus.toNumber(RateStatus.PENDING),
      }),
    );

    const coupon = await Bond.getCoupon(
      new GetCouponRequest({
        securityId: bond.evmDiamondAddress!.toString(),
        couponId: 2, // Second coupon (first one was created in 'Coupons Fixed' test)
      }),
    );

    expect(coupon.couponId).toEqual(2);
    expect(coupon.recordDate.getTime() / 1000).toEqual(recordTimestamp);
    expect(coupon.executionDate.getTime() / 1000).toEqual(executionTimestamp);
  }, 600_000);

  it("Update bond maturity date correctly", async () => {
    const newMaturityDate = maturityDate + 10;
    const request = new UpdateMaturityDateRequest({
      securityId: bond.evmDiamondAddress!.toString(),
      maturityDate: newMaturityDate.toString(),
    });

    const res = await Bond.updateMaturityDate(request);

    const bondDetails = await Bond.getBondDetails(
      new GetBondDetailsRequest({
        bondId: bond.evmDiamondAddress!.toString(),
      }),
    );
    expect(bondDetails.maturityDate.getTime() / 1000).toEqual(newMaturityDate);
    expect(res.payload).toBe(true);
  }, 600_000);

  it("Should return error if bond maturity date is earlier than current one", async () => {
    const newMaturityDate = maturityDate - 10;
    const request = new UpdateMaturityDateRequest({
      securityId: bond.evmDiamondAddress!.toString(),
      maturityDate: newMaturityDate.toString(),
    });

    let thrownError;
    try {
      await Bond.updateMaturityDate(request);
    } catch (error) {
      thrownError = error;
    }
    expect(thrownError).toBeInstanceOf(BaseError);
  }, 600_000);

  it("Get coupons ordered list correctly", async () => {
    const request = new GetCouponsOrderedListRequest({
      securityId: bond.evmDiamondAddress!.toString(),
      pageIndex: 0,
      pageLength: 10,
    });

    const result = await Bond.getCouponsOrderedList(request);

    expect(Array.isArray(result)).toBe(true);
    result.forEach((couponId) => {
      expect(typeof couponId).toBe("number");
      expect(couponId).toBeGreaterThan(0);
    });
  }, 600_000);

  it("Get coupons ordered list with pagination", async () => {
    const request1 = new GetCouponsOrderedListRequest({
      securityId: bond.evmDiamondAddress!.toString(),
      pageIndex: 0,
      pageLength: 5,
    });

    const result1 = await Bond.getCouponsOrderedList(request1);
    expect(Array.isArray(result1)).toBe(true);

    const request2 = new GetCouponsOrderedListRequest({
      securityId: bond.evmDiamondAddress!.toString(),
      pageIndex: 1,
      pageLength: 5,
    });

    const result2 = await Bond.getCouponsOrderedList(request2);
    expect(Array.isArray(result2)).toBe(true);
  }, 600_000);

  it("Get coupons ordered list with empty page", async () => {
    const request = new GetCouponsOrderedListRequest({
      securityId: bond.evmDiamondAddress!.toString(),
      pageIndex: 100,
      pageLength: 10,
    });

    const result = await Bond.getCouponsOrderedList(request);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  }, 600_000);

  it("Get coupon from ordered list at", async () => {
    const request = new GetCouponFromOrderedListAtRequest({
      securityId: bond.evmDiamondAddress!.toString(),
      pos: 0,
    });

    const result = await Bond.getCouponFromOrderedListAt(request);
    expect(typeof result).toBe("number");
    expect(result).toBe(1);
  }, 600_000);
});
