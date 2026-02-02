//SPDX-License-Identifier: Apache-2.0

//import "../environmentMock";
import {
  SDK,
  LoggerTransports,
  SupportedWallets,
  Network,
  Bond,
  InitializationRequest,
  CreateBondFixedRateRequest,
} from "@port/in";
import { DFNS_SETTINGS, CLIENT_ACCOUNT_ECDSA, FACTORY_ADDRESS, RESOLVER_ADDRESS } from "@test/config";
import ConnectRequest from "@port/in/request/network/ConnectRequest";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import NetworkService from "@service/network/NetworkService";
import SecurityViewModel from "@port/in/response/SecurityViewModel";
import Injectable from "@core/injectable/Injectable";
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
const maturityDate = startingDate + 365; // 1 year maturity
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

    console.log("Client privateKey ECDSA:", CLIENT_ACCOUNT_ECDSA.privateKey);
    console.log("Client account ECDSA:", CLIENT_ACCOUNT_ECDSA.id.toString());

    th.setSignerOrProvider(new Wallet(CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? "", customHttpProvider));

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
      rate: rate,
      rateDecimals: rateDecimals,
    });

    Injectable.resolveTransactionHandler();

    bond = (await Bond.createFixedRate(requestST)).security;

    console.log("bond: " + JSON.stringify(bond));
  }, 600_000);

  it("test", async () => {
    return true;
  }, 60_000);
});
