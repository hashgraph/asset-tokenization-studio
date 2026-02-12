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
  CreateBondKpiLinkedRateRequest,
  GetLatestKpiDataRequest,
  GetMinDateRequest,
  GetScheduledCouponListingRequest,
  InitializationRequest,
  IsCheckPointDateRequest,
  LoggerTransports,
  Network,
  Role,
  SDK,
  SupportedWallets,
} from "@port/in";
import KpiLinkedRate from "@port/in/interestRates/kpiLinkedRate/KpiLinkedRate";
import Kpis from "@port/in/kpis/Kpis";
import GetInterestRateRequest from "@port/in/request/interestRates/GetInterestRateRequest";
import SetInterestRateRequest from "@port/in/request/interestRates/SetInterestRateRequest";
import GetImpactDataRequest from "@port/in/request/kpiLinkedRate/GetImpactDataRequest";
import ConnectRequest from "@port/in/request/network/ConnectRequest";
import ScheduledCouponListingCountRequest from "@port/in/request/scheduledTasks/ScheduledCouponListingCountRequest";
import SecurityViewModel from "@port/in/response/SecurityViewModel";
import ScheduledCouponListing from "@port/in/scheduledTask/scheduledCouponListing/ScheduledCouponListing";
import { CLIENT_ACCOUNT_ECDSA, DFNS_SETTINGS, FACTORY_ADDRESS, RESOLVER_ADDRESS } from "@test/config";

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
const configId = "0x0000000000000000000000000000000000000000000000000000000000000004";
const configVersion = 0;
const maxRate = 10;
const baseRate = 2;
const minRate = 1;
const startPeriod = 1;
const startRate = 1;
const missedPenalty = 1;
const reportPeriod = 1;
const rateDecimals = 1;
const maxDeviationCap = 10;
const baseLine = 2;
const maxDeviationFloor = 1;
const impactDataDecimals = 1;
const adjustmentPrecision = 1;

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

    const requestST = new CreateBondKpiLinkedRateRequest({
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
      maxRate: maxRate,
      baseRate: baseRate,
      minRate: minRate,
      startPeriod: startPeriod,
      startRate: startRate,
      missedPenalty: missedPenalty,
      reportPeriod: reportPeriod,
      rateDecimals: rateDecimals,
      maxDeviationCap: maxDeviationCap,
      baseLine: baseLine,
      maxDeviationFloor: maxDeviationFloor,
      impactDataDecimals: impactDataDecimals,
      adjustmentPrecision: adjustmentPrecision,
    });

    bond = (await Bond.createKpiLinkedRate(requestST)).security;

    console.log(bond.diamondAddress);
    console.log(bond.evmDiamondAddress);

    console.log("bond: " + JSON.stringify(bond));
  }, 600_000);

  it("test", async () => {
    return true;
  }, 60_000);

  it("query getLatestKpiData", async () => {
    const contractAddress = bond?.diamondAddress?.toString();
    console.log("contractAddress: " + contractAddress);

    if (!contractAddress) {
      throw new Error("No se encontró address del bond creado");
    }

    const request = new GetLatestKpiDataRequest({
      securityId: contractAddress,
      from: "0",
      to: "1",
      kpi: CLIENT_ACCOUNT_ECDSA.evmAddress || "",
    });

    const result = await Kpis.getLatestKpiData(request);
    console.log("result: " + JSON.stringify(result));
  }, 60_000);

  it("get interest rate", async () => {
    const contractAddress = bond?.diamondAddress?.toString();
    console.log("contractAddress: " + contractAddress);

    if (!contractAddress) {
      throw new Error("No se encontró address del bond creado");
    }

    const request = new GetInterestRateRequest({
      securityId: contractAddress,
    });

    const result = await KpiLinkedRate.getInterestRate(request);
    console.log("result: " + JSON.stringify(result));

    expect(result).toHaveProperty("maxRate");
    expect(result).toHaveProperty("baseRate");
    expect(result).toHaveProperty("minRate");
    expect(result).toHaveProperty("startPeriod");
    expect(result).toHaveProperty("startRate");
    expect(result).toHaveProperty("missedPenalty");
    expect(result).toHaveProperty("reportPeriod");
    expect(result).toHaveProperty("rateDecimals");
  }, 60_000);

  it("set interest rate", async () => {
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

    const request = new SetInterestRateRequest({
      securityId: contractAddress,
      maxRate: "10.5",
      baseRate: "5.5",
      minRate: "1.5",
      startPeriod: "1640995200",
      startRate: "4.5",
      missedPenalty: "2.5",
      reportPeriod: "30",
      rateDecimals: 8,
    });

    const result = await KpiLinkedRate.setInterestRate(request);
    console.log("result: " + JSON.stringify(result));

    expect(result).toHaveProperty("payload");
    expect(result).toHaveProperty("transactionId");
    expect(result.payload).toBe(true);
  }, 60_000);

  it("get impact data", async () => {
    const contractAddress = bond?.diamondAddress?.toString();
    console.log("contractAddress: " + contractAddress);

    if (!contractAddress) {
      throw new Error("No se encontró address del bond creado");
    }

    const request = new GetImpactDataRequest({
      securityId: contractAddress,
    });

    const result = await KpiLinkedRate.getImpactData(request);
    console.log("result: " + JSON.stringify(result));

    expect(result).toHaveProperty("maxDeviationCap");
    expect(result).toHaveProperty("baseLine");
    expect(result).toHaveProperty("maxDeviationFloor");
    expect(result).toHaveProperty("impactDataDecimals");
    expect(result).toHaveProperty("adjustmentPrecision");
  }, 60_000);

  it("query getMinDate", async () => {
    const contractAddress = bond?.diamondAddress?.toString();
    console.log("contractAddress: " + contractAddress);

    if (!contractAddress) {
      throw new Error("No se encontró address del bond creado");
    }

    const request = new GetMinDateRequest({ securityId: contractAddress });

    const result = await Kpis.getMinDate(request);
    console.log("result: " + JSON.stringify(result));
  }, 60_000);

  it("query getIsCheckPointDate", async () => {
    const contractAddress = bond?.diamondAddress?.toString();
    console.log("contractAddress: " + contractAddress);

    if (!contractAddress) {
      throw new Error("No se encontró address del bond creado");
    }

    const request = new IsCheckPointDateRequest({
      securityId: contractAddress,
      date: 1,
      project: contractAddress,
    });

    const result = await Kpis.isCheckPointDate(request);
    console.log("result: " + JSON.stringify(result));
  }, 60_000);

  it("query scheduledCouponListingCount", async () => {
    const contractAddress = bond?.diamondAddress?.toString();
    console.log("contractAddress: " + contractAddress);

    if (!contractAddress) {
      throw new Error("No se encontró address del bond creado");
    }

    const request = new ScheduledCouponListingCountRequest({
      securityId: contractAddress,
    });

    const result = await ScheduledCouponListing.scheduledCouponListingCount(request);
    console.log("result: " + JSON.stringify(result));
  }, 60_000);

  it("query getScheduledCouponListing", async () => {
    const contractAddress = bond?.diamondAddress?.toString();
    console.log("contractAddress: " + contractAddress);

    if (!contractAddress) {
      throw new Error("No se encontró address del bond creado");
    }

    const request = new GetScheduledCouponListingRequest({
      securityId: contractAddress,
      pageIndex: 0,
      pageLength: 10,
    });

    const result = await ScheduledCouponListing.getScheduledCouponListing(request);
    console.log("result: " + JSON.stringify(result));
  }, 60_000);
});
