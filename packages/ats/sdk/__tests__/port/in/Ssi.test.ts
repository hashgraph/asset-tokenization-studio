// SPDX-License-Identifier: Apache-2.0

import "../environmentMock";
import {
  AddIssuerRequest,
  CreateEquityRequest,
  Equity,
  GetIssuerListCountRequest,
  GetIssuerListMembersRequest,
  GetRevocationRegistryAddressRequest,
  LoggerTransports,
  RemoveIssuerRequest,
  Role,
  RoleRequest,
  SDK,
  SetRevocationRegistryAddressRequest,
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
import { CLIENT_ACCOUNT_ECDSA, CLIENT_ACCOUNT_ECDSA_A, FACTORY_ADDRESS, RESOLVER_ADDRESS } from "@test/config";
import Injectable from "@core/injectable/Injectable";
import Account from "@domain/context/account/Account";
import { ethers, Wallet } from "ethers";
import SsiManagement from "@port/in/ssiManagement/SsiManagement";
import { SecurityRole } from "@domain/context/security/SecurityRole";

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

describe("🧪 SSI Management tests", () => {
  let ns: NetworkService;
  let rpcQueryAdapter: RPCQueryAdapter;
  let equity: SecurityViewModel;

  const url = "http://127.0.0.1:7546";
  const customHttpProvider = new ethers.JsonRpcProvider(url);

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

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._SSI_MANAGER_ROLE,
      }),
    );
  }, 900_000);

  it("Set and Get revocation registry successfully", async () => {
    expect(
      (
        await SsiManagement.setRevocationRegistryAddress(
          new SetRevocationRegistryAddressRequest({
            securityId: equity.evmDiamondAddress!,
            revocationRegistryId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).payload,
    ).toBe(true);

    expect(
      await SsiManagement.getRevocationRegistryAddress(
        new GetRevocationRegistryAddressRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toEqual(CLIENT_ACCOUNT_ECDSA_A.id!.toString());
  }, 600_000);

  it("Issuer functionality work successfully", async () => {
    //Add issuer
    expect(
      (
        await SsiManagement.addIssuer(
          new AddIssuerRequest({
            securityId: equity.evmDiamondAddress!,
            issuerId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).payload,
    ).toBe(true);

    //Get Issuer List
    expect(
      await SsiManagement.getIssuerListCount(
        new GetIssuerListCountRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toEqual(1);

    //Get Issuer List Members
    expect(
      await SsiManagement.getIssuerListMembers(
        new GetIssuerListMembersRequest({
          securityId: equity.evmDiamondAddress!,
          start: 0,
          end: 1,
        }),
      ),
    ).toContain(CLIENT_ACCOUNT_ECDSA_A.id.toString());

    //Remove Issuer
    expect(
      (
        await SsiManagement.removeIssuer(
          new RemoveIssuerRequest({
            securityId: equity.evmDiamondAddress!,
            issuerId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).payload,
    ).toBe(true);

    //Get Issuer List
    expect(
      await SsiManagement.getIssuerListCount(
        new GetIssuerListCountRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toEqual(0);
  }, 600_000);

  it("Should return an error if try to add the same issuer", async () => {
    //Add issuer
    expect(
      (
        await SsiManagement.addIssuer(
          new AddIssuerRequest({
            securityId: equity.evmDiamondAddress!,
            issuerId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).payload,
    ).toBe(true);

    //Try to do Add the same issuer
    let thrownError;
    try {
      await SsiManagement.addIssuer(
        new AddIssuerRequest({
          securityId: equity.evmDiamondAddress!,
          issuerId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        }),
      );
    } catch (error) {
      thrownError = error;
    }
    expect(thrownError).toBeInstanceOf(Error);
  }, 600_000);
});
