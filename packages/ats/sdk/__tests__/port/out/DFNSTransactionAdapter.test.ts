// SPDX-License-Identifier: Apache-2.0

import "../environmentMock";
import {
  SDK,
  LoggerTransports,
  CreateBondRequest,
  SupportedWallets,
  Network,
  Bond,
  InitializationRequest,
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
const isin = "ABCDE123456Z";
const currency = "0x455552";
const TIME = 30;
const numberOfUnits = "1000";
const nominalValue = "100";
const nominalValueDecimals = 3;
const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000) + 1000;
const startingDate = currentTimeInSeconds + TIME;
const numberOfCoupons = 15;
const couponFrequency = 7;
const couponRate = "3";
const maturityDate = startingDate + numberOfCoupons * couponFrequency;
const firstCouponDate = startingDate + 1;
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
    });

    bond = (await Bond.create(requestST)).security;

    console.log(bond.diamondAddress);
    console.log(bond.evmDiamondAddress);

    console.log("bond: " + JSON.stringify(bond));
  }, 600_000);

  it("DFNS should create a Bond", async () => {
    expect(bond).not.toBeNull();
  }, 60_000);
});
