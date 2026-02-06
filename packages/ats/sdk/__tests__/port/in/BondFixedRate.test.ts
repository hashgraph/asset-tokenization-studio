// SPDX-License-Identifier: Apache-2.0

//import "../environmentMock";
import Injectable from "@core/injectable/Injectable";
import { Time } from "@core/Time";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import {
  ApplyRolesRequest,
  Bond,
  CreateBondFixedRateRequest,
  FixedRate,
  GetCouponsOrderedListRequest,
  GetRateRequest,
  InitializationRequest,
  LoggerTransports,
  Network,
  Role,
  SDK,
  SetRateRequest,
  SupportedWallets,
} from "@port/in";
import GetCouponFromOrderedListAtRequest from "@port/in/request/bond/GetCouponFromOrderedListAtRequest";
import ConnectRequest from "@port/in/request/network/ConnectRequest";
import SecurityViewModel from "@port/in/response/SecurityViewModel";
import { DFNS_SETTINGS, FACTORY_ADDRESS, RESOLVER_ADDRESS } from "@test/config";

SDK.log = { level: "ERROR", transports: new LoggerTransports.Console() };

const decimals = 0;
const name = "TEST_SECURITY_TOKEN";
const symbol = "TEST";
const isin = "US0378331005";
const currency = "0x455552";
const TIME = 30;
const numberOfUnits = "1000";
const nominalValue = "100";
const nominalValueDecimals = 3;
const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000) + 1000;
const startingDate = currentTimeInSeconds + TIME;
const numberOfCoupons = 15;
const couponFrequency = 7;
const maturityDate = startingDate + numberOfCoupons * couponFrequency;
const regulationType = RegulationType.REG_S;
const regulationSubType = RegulationSubType.NONE;
const countries = "AF,HG,BN";
const info = "Anything";
const configId = "0x0000000000000000000000000000000000000000000000000000000000000003";
const configVersion = 0;
const rate = 5;
const rateDecimals = 2;

const mirrorNode: MirrorNode = {
  name: "testmirrorNode",
  baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/",
};

const rpcNode: JsonRpcRelay = {
  name: "testrpcNode",
  baseUrl: "http://localhost:7546",
};

describe("DFNS Transaction Adapter test", () => {
  let bond: SecurityViewModel;

  beforeAll(async () => {
    await Network.connect(
      new ConnectRequest({
        network: "testnet",
        wallet: SupportedWallets.DFNS,
        mirrorNode: mirrorNode,
        rpcNode: rpcNode,
        custodialWalletSettings: DFNS_SETTINGS,
      }),
    );
    await Network.init(
      new InitializationRequest({
        network: "testnet",
        configuration: {
          factoryAddress: FACTORY_ADDRESS,
          resolverAddress: RESOLVER_ADDRESS,
        },
        mirrorNode: mirrorNode,
        rpcNode: rpcNode,
      }),
    );

    Injectable.resolveTransactionHandler();

    //Create a security for example a bond
    const requestST = new CreateBondFixedRateRequest({
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
      diamondOwnerAccount: DFNS_SETTINGS.hederaAccountId,
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
      rate: rate,
      rateDecimals: rateDecimals,
    });

    bond = (await Bond.createFixedRate(requestST)).security;

    console.log(bond.diamondAddress);
    console.log(bond.evmDiamondAddress);

    console.log("bond: " + JSON.stringify(bond));
  }, 600_000);

  it("set fixed rate", async () => {
    // Usar el contract ID que sabemos que fue creado exitosamente
    const contractAddress = bond?.diamondAddress?.toString();
    console.log("contractAddress: " + contractAddress);

    if (!contractAddress) {
      throw new Error("No se encontró address del bond creado");
    }

    await Role.applyRoles(
      new ApplyRolesRequest({
        securityId: contractAddress,
        targetId: DFNS_SETTINGS.hederaAccountId,
        roles: [SecurityRole._INTEREST_RATE_MANAGER_ROLE],
        actives: [true],
      }),
    );
    console.log("applyRoles [_INTEREST_RATE_MANAGER_ROLE]");
    await Time.delay(4, "seconds");

    const request = new SetRateRequest({
      securityId: contractAddress,
      rate: "5.5",
      rateDecimals: 8,
    });

    const result = await FixedRate.setRate(request);
    console.log("result: " + JSON.stringify(result));

    const getRateRequest = new GetRateRequest({
      securityId: contractAddress,
    });

    const rate = await FixedRate.getRate(getRateRequest);
    console.log("rate: " + JSON.stringify(rate));
  }, 60_000);

  it("get coupon from ordered list at", async () => {
    const contractAddress = bond?.diamondAddress?.toString();
    console.log("contractAddress: " + contractAddress);

    if (!contractAddress) {
      throw new Error("No se encontró address del bond creado");
    }

    const couponId = await Bond.getCouponFromOrderedListAt(
      new GetCouponFromOrderedListAtRequest({
        securityId: contractAddress,
        pos: 0,
      }),
    );

    console.log("couponId: " + couponId);
    expect(typeof couponId).toBe("number");
    expect(couponId).toBeGreaterThanOrEqual(0);
  }, 60_000);

  it("getCouponsOrderedList from DLT", async () => {
    const contractAddress = bond?.diamondAddress?.toString();
    console.log("contractAddress: " + contractAddress);

    if (!contractAddress) {
      throw new Error("No se encontró address del bond creado");
    }

    const request = new GetCouponsOrderedListRequest({
      securityId: contractAddress,
      pageIndex: 0,
      pageLength: 10,
    });

    const result = await Bond.getCouponsOrderedList(request);
    console.log("getCouponsOrderedList result: " + JSON.stringify(result));

    expect(Array.isArray(result)).toBe(true);
    result.forEach((couponId) => {
      expect(typeof couponId).toBe("number");
      expect(couponId).toBeGreaterThan(0);
    });

    const request2 = new GetCouponsOrderedListRequest({
      securityId: contractAddress,
      pageIndex: 1,
      pageLength: 5,
    });

    const result2 = await Bond.getCouponsOrderedList(request2);
    console.log("getCouponsOrderedList result page 2: " + JSON.stringify(result2));

    expect(Array.isArray(result2)).toBe(true);
    result2.forEach((couponId) => {
      expect(typeof couponId).toBe("number");
      expect(couponId).toBeGreaterThan(0);
    });
  }, 60_000);
});
