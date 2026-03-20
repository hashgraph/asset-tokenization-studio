//SPDX-License-Identifier: Apache-2.0

import "../environmentMock";
import {
  SDK,
  LoggerTransports,
  CreateBondRequest,
  GetBondDetailsRequest,
  SupportedWallets,
  Network,
  Bond,
  Role,
  RoleRequest,
  UpdateMaturityDateRequest,
  AddKpiDataRequest,
} from "@port/in";
import { CLIENT_ACCOUNT_ECDSA, FACTORY_ADDRESS, RESOLVER_ADDRESS } from "@test/config";
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
    const customHttpProvider = new ethers.JsonRpcProvider(url);

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

  it("addKpiData", async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: bond.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._KPI_MANAGER_ROLE,
      }),
    );

    const request = new AddKpiDataRequest({
      securityId: bond.evmDiamondAddress!.toString(),
      date: Math.floor(Date.now() / 1000),
      value: "1000",
      project: "0x0000000000000000000000000000000000000001",
    });

    const result = await Bond.addKpiData(request);

    expect(result).toHaveProperty("transactionId");
    expect(typeof result.transactionId).toBe("string");
  }, 60_000);
});
