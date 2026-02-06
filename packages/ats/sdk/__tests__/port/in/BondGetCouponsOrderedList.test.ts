// SPDX-License-Identifier: Apache-2.0

//import "../environmentMock";
import {
  SDK,
  LoggerTransports,
  SupportedWallets,
  Network,
  Bond,
  InitializationRequest,
  CreateBondFixedRateRequest,
  GetCouponsOrderedListRequest,
} from "@port/in";
import { DFNS_SETTINGS, FACTORY_ADDRESS, RESOLVER_ADDRESS } from "@test/config";
import ConnectRequest from "@port/in/request/network/ConnectRequest";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import SecurityViewModel from "@port/in/response/SecurityViewModel";
import Injectable from "@core/injectable/Injectable";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";

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
const configId = "0x0000000000000000000000000000000000000000000000000000000000003";
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

describe("Bond getCouponsOrderedList DLT Integration Test", () => {
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

    console.log("bond: " + JSON.stringify(bond));
  }, 600_000);

  it("should get coupons ordered list from DLT", async () => {
    const contractAddress = bond?.diamondAddress?.toString();
    console.log("contractAddress: " + contractAddress);

    if (!contractAddress) {
      throw new Error("No se encontró address del bond creado");
    }

    // Test with first page
    const request = new GetCouponsOrderedListRequest({
      securityId: contractAddress,
      pageIndex: 0,
      pageLength: 10,
    });

    const result = await Bond.getCouponsOrderedList(request);
    console.log("getCouponsOrderedList result: " + JSON.stringify(result));

    // Verify it's an array
    expect(Array.isArray(result)).toBe(true);

    // Verify all elements are numbers
    result.forEach((couponId) => {
      expect(typeof couponId).toBe("number");
      expect(couponId).toBeGreaterThan(0);
    });

    // Test with second page
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

    // Test with empty page (beyond available coupons)
    const request3 = new GetCouponsOrderedListRequest({
      securityId: contractAddress,
      pageIndex: 100,
      pageLength: 10,
    });

    const result3 = await Bond.getCouponsOrderedList(request3);
    console.log("getCouponsOrderedList result empty page: " + JSON.stringify(result3));

    expect(Array.isArray(result3)).toBe(true);
    // Empty page should return empty array
    expect(result3.length).toBe(0);
  }, 60_000);
});
