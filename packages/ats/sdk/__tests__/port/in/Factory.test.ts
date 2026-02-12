// SPDX-License-Identifier: Apache-2.0

import "../environmentMock";
import { CLIENT_ACCOUNT_ECDSA, FACTORY_ADDRESS, RESOLVER_ADDRESS } from "@test/config";
import ConnectRequest, { SupportedWallets } from "@port/in/request/network/ConnectRequest";
import { Wallet, ethers } from "ethers";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import { RPCTransactionAdapter } from "@port/out/rpc/RPCTransactionAdapter";
import NetworkService from "@service/network/NetworkService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import Injectable from "@core/injectable/Injectable";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";
import { SDK, LoggerTransports, Network, Factory, GetRegulationDetailsRequest } from "@port/in";

SDK.log = { level: "ERROR", transports: new LoggerTransports.Console() };

const regulationType = RegulationType.REG_S;
const regulationSubType = RegulationSubType.NONE;

const mirrorNode: MirrorNode = {
  name: "testmirrorNode",
  baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/",
};

const rpcNode: JsonRpcRelay = {
  name: "testrpcNode",
  baseUrl: "http://127.0.0.1:7546/api",
};

describe("🧪 Factory test", () => {
  let th: RPCTransactionAdapter;
  let ns: NetworkService;
  let mirrorNodeAdapter: MirrorNodeAdapter;
  let rpcQueryAdapter: RPCQueryAdapter;

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
    await th.register(undefined, true);

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
  }, 600_000);

  it("Check Regulation Details", async () => {
    const regulationDetails = await Factory.getRegulationDetails(
      new GetRegulationDetailsRequest({
        regulationType: CastRegulationType.toNumber(regulationType),
        regulationSubType: CastRegulationSubType.toNumber(regulationSubType),
      }),
    );

    expect(regulationDetails.type).toEqual(regulationType);
    expect(regulationDetails.subType).toEqual(regulationSubType);
    expect(regulationDetails.accreditedInvestors).toEqual("ACCREDITATION REQUIRED");
    expect(regulationDetails.dealSize).toEqual("0");
    expect(regulationDetails.internationalInvestors).toEqual("ALLOWED");
    expect(regulationDetails.manualInvestorVerification).toEqual("VERIFICATION INVESTORS FINANCIAL DOCUMENTS REQUIRED");
    expect(regulationDetails.maxNonAccreditedInvestors).toEqual(0);
    expect(regulationDetails.resaleHoldPeriod).toEqual("NOT APPLICABLE");
  }, 60_000);
});
