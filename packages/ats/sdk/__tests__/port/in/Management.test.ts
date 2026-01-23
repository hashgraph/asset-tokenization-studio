// SPDX-License-Identifier: Apache-2.0

import "../environmentMock";
import {
  CreateEquityRequest,
  Equity,
  GetConfigInfoRequest,
  LoggerTransports,
  SDK,
  UpdateConfigRequest,
  UpdateConfigVersionRequest,
  UpdateResolverRequest,
} from "@port/in";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import { RPCTransactionAdapter } from "@port/out/rpc/RPCTransactionAdapter";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import NetworkService from "@service/network/NetworkService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import SecurityViewModel from "@port/in/response/SecurityViewModel";
import { CLIENT_ACCOUNT_ECDSA, FACTORY_ADDRESS, RESOLVER_ADDRESS } from "@test/config";
import Injectable from "@core/injectable/Injectable";
import Account from "@domain/context/account/Account";
import Management from "@port/in/management/Management";
import { ethers, Wallet } from "ethers";
import ConfigInfoViewModel from "@port/in/response/ConfigInfoViewModel";

SDK.log = { level: "ERROR", transports: new LoggerTransports.Console() };

const decimals = 0;
const name = "TEST_SECURITY_TOKEN";
const symbol = "TEST";
const isin = "ABCDE123456Z";
const votingRight = true;
const informationRight = false;
const liquidationRight = true;
const subscriptionRight = false;
const conversionRight = true;
const redemptionRight = false;
const putRight = true;
const dividendRight = 1;
const currency = "0x345678";
const numberOfShares = 0;
const nominalValue = 1000;
const nominalValueDecimals = 3;
const regulationType = RegulationType.REG_D;
const regulationSubType = RegulationSubType.B_506;
const countries = "AF,HG,BN";
const info = "Anything";
const configId = "0x0000000000000000000000000000000000000000000000000000000000000000";
const configVersion = 1;

const mirrorNode: MirrorNode = {
  name: "testmirrorNode",
  baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/",
};

const rpcNode: JsonRpcRelay = {
  name: "testrpcNode",
  baseUrl: "http://127.0.0.1:7546/api",
};

let th: RPCTransactionAdapter;
let mirrorNodeAdapter: MirrorNodeAdapter;

describe("🧪 Management tests", () => {
  let ns: NetworkService;
  let rpcQueryAdapter: RPCQueryAdapter;
  let equity: SecurityViewModel;

  const url = "http://127.0.0.1:7546";
  const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

  beforeAll(async () => {
    try {
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
      const account = new Account({
        id: CLIENT_ACCOUNT_ECDSA.id.toString(),
        evmAddress: CLIENT_ACCOUNT_ECDSA.evmAddress,
        alias: CLIENT_ACCOUNT_ECDSA.alias,
        privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
        publicKey: CLIENT_ACCOUNT_ECDSA.publicKey,
      });
      await th.register(account, true);

      th.setSignerOrProvider(new Wallet(CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? "", customHttpProvider));

      const requestST = new CreateEquityRequest({
        name,
        symbol,
        isin,
        decimals,
        isWhiteList: false,
        erc20VotesActivated: false,
        isControllable: true,
        arePartitionsProtected: false,
        clearingActive: false,
        internalKycActivated: true,
        isMultiPartition: false,
        diamondOwnerAccount: CLIENT_ACCOUNT_ECDSA.id.toString(),
        votingRight,
        informationRight,
        liquidationRight,
        subscriptionRight,
        conversionRight,
        redemptionRight,
        putRight,
        dividendRight,
        currency,
        numberOfShares: numberOfShares.toString(),
        nominalValue: nominalValue.toString(),
        nominalValueDecimals: nominalValueDecimals,
        regulationType: CastRegulationType.toNumber(regulationType),
        regulationSubType: CastRegulationSubType.toNumber(regulationSubType),
        isCountryControlListWhiteList: true,
        countries,
        info,
        configId,
        configVersion,
      });

      equity = (await Equity.create(requestST)).security;
    } catch (error) {
      console.error("Error in beforeAll setup:", error);
    }
  }, 900_000);

  function checkConfig(
    resolver: string,
    configId: string,
    configVersion: number,
    configInfo: ConfigInfoViewModel,
  ): boolean {
    expect(configInfo.resolverAddress).toEqual(resolver);
    expect(configInfo.configId).toEqual(configId);
    expect(configInfo.configVersion).toEqual(configVersion);
    return true;
  }

  it("Fetches configInfo successfully", async () => {
    const res = await Management.getConfigInfo(
      new GetConfigInfoRequest({
        securityId: equity.evmDiamondAddress!.toString(),
      }),
    );
    expect(checkConfig(RESOLVER_ADDRESS, configId, configVersion, res)).toBe(true);
  }, 600_000);

  it("Updates configVersion correctly", async () => {
    const newConfigVersion = 2;
    const request = new UpdateConfigVersionRequest({
      configVersion: newConfigVersion,
      securityId: equity.evmDiamondAddress!,
    });
    const res = await Management.updateConfigVersion(request);
    const configInfo = await Management.getConfigInfo(
      new GetConfigInfoRequest({
        securityId: equity.evmDiamondAddress!.toString(),
      }),
    );
    checkConfig(RESOLVER_ADDRESS, configId, newConfigVersion, configInfo);
    expect(res.payload).toBe(true);
  }, 600_000);

  it("Updates config correctly", async () => {
    const configVersion = 2;
    const newConfigId = "0x0000000000000000000000000000000000000000000000000000000000000003";
    const request = new UpdateConfigRequest({
      configId: newConfigId,
      configVersion: configVersion,
      securityId: equity.evmDiamondAddress!,
    });
    const res = await Management.updateConfig(request);
    const configInfo = await Management.getConfigInfo(
      new GetConfigInfoRequest({
        securityId: equity.evmDiamondAddress!.toString(),
      }),
    );
    checkConfig(RESOLVER_ADDRESS, newConfigId, configVersion, configInfo);
    expect(res.payload).toBe(true);
  }, 600_000);

  it("Updates resolver correctly", async () => {
    const configVersion = 3;
    const newResolver = "0.0.2166987";
    const request = new UpdateResolverRequest({
      configVersion: configVersion,
      configId,
      securityId: equity.evmDiamondAddress!.toString(),
      resolver: newResolver,
    });
    const res = await Management.updateResolver(request);
    const configInfo = await Management.getConfigInfo(
      new GetConfigInfoRequest({
        securityId: equity.evmDiamondAddress!.toString(),
      }),
    );
    checkConfig(newResolver, configId, configVersion, configInfo);
    expect(res.payload).toBe(true);
  }, 600_000);
});
