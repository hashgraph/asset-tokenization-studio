// SPDX-License-Identifier: Apache-2.0

import "../environmentMock";
import { RPCTransactionAdapter } from "@port/out/rpc/RPCTransactionAdapter";
import {
  SDK,
  LoggerTransports,
  Role,
  Network,
  RoleRequest,
  CreateEquityRequest,
  GetRolesForRequest,
  GetRoleCountForRequest,
  GetRoleMemberCountRequest,
  GetRoleMembersRequest,
  Equity,
  ApplyRolesRequest,
} from "@port/in";
import Injectable from "@core/injectable/Injectable";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import ConnectRequest, { SupportedWallets } from "@port/in/request/network/ConnectRequest";
import { Wallet, ethers } from "ethers";
import { CLIENT_ACCOUNT_ECDSA, CLIENT_ACCOUNT_ECDSA_A, FACTORY_ADDRESS, RESOLVER_ADDRESS } from "@test/config";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import NetworkService from "@service/network/NetworkService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import SecurityViewModel from "@port/in/response/SecurityViewModel";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";

SDK.log = { level: "ERROR", transports: new LoggerTransports.Console() };

const decimals = 6;
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
const regulationSubType = RegulationSubType.C_506;
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

describe("🧪 Role test", () => {
  let th: RPCTransactionAdapter;
  let ns: NetworkService;
  let mirrorNodeAdapter: MirrorNodeAdapter;
  let rpcQueryAdapter: RPCQueryAdapter;
  let equity: SecurityViewModel;

  const delay = async (seconds = 5): Promise<void> => {
    seconds = seconds * 1000;
    await new Promise((r) => setTimeout(r, seconds));
  };

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

    const requestST = new CreateEquityRequest({
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
      votingRight: votingRight,
      informationRight: informationRight,
      liquidationRight: liquidationRight,
      subscriptionRight: subscriptionRight,
      conversionRight: conversionRight,
      redemptionRight: redemptionRight,
      putRight: putRight,
      dividendRight: dividendRight,
      currency: currency,
      numberOfShares: numberOfShares.toString(),
      nominalValue: nominalValue.toString(),
      nominalValueDecimals: nominalValueDecimals,
      regulationType: CastRegulationType.toNumber(regulationType),
      regulationSubType: CastRegulationSubType.toNumber(regulationSubType),
      isCountryControlListWhiteList: true,
      countries: countries,
      info: info,
      configId: configId,
      configVersion: configVersion,
    });

    equity = (await Equity.create(requestST)).security;

    await delay();
  }, 600_000);

  it("Grant and Revoke CONTROLLIST_ROLE role", async () => {
    expect(
      (
        await Role.grantRole(
          new RoleRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
            role: SecurityRole._CONTROLLIST_ROLE,
          }),
        )
      ).payload,
    ).toBe(true);

    expect(
      await Role.hasRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          role: SecurityRole._CONTROLLIST_ROLE,
        }),
      ),
    ).toBe(true);

    let roleCount = await Role.getRoleCountFor(
      new GetRoleCountForRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
      }),
    );

    let memberCount = await Role.getRoleMemberCount(
      new GetRoleMemberCountRequest({
        securityId: equity.evmDiamondAddress!,
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    expect(roleCount).toEqual(1);
    expect(memberCount).toEqual(1);

    let rolesFor = await Role.getRolesFor(
      new GetRolesForRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        start: 0,
        end: roleCount,
      }),
    );

    let membersFor = await Role.getRoleMembers(
      new GetRoleMembersRequest({
        securityId: equity.evmDiamondAddress!,
        role: SecurityRole._CONTROLLIST_ROLE,
        start: 0,
        end: memberCount,
      }),
    );

    expect(rolesFor.length).toEqual(1);
    expect(membersFor.length).toEqual(1);
    expect(rolesFor[0].toUpperCase()).toEqual(SecurityRole._CONTROLLIST_ROLE.toUpperCase());
    expect(membersFor[0].toUpperCase()).toEqual(CLIENT_ACCOUNT_ECDSA_A.id.toString().toUpperCase());

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    roleCount = await Role.getRoleCountFor(
      new GetRoleCountForRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
      }),
    );

    memberCount = await Role.getRoleMemberCount(
      new GetRoleMemberCountRequest({
        securityId: equity.evmDiamondAddress!,
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    expect(roleCount).toEqual(0);
    expect(memberCount).toEqual(0);

    rolesFor = await Role.getRolesFor(
      new GetRolesForRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        start: 0,
        end: roleCount,
      }),
    );

    membersFor = await Role.getRoleMembers(
      new GetRoleMembersRequest({
        securityId: equity.evmDiamondAddress!,
        role: SecurityRole._CONTROLLIST_ROLE,
        start: 0,
        end: memberCount,
      }),
    );

    expect(rolesFor.length).toEqual(0);
    expect(membersFor.length).toEqual(0);
  }, 60000);

  it("grant all roles then revoke all roles using apply", async () => {
    expect(
      (
        await Role.applyRoles(
          new ApplyRolesRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            roles: [
              SecurityRole._CONTROLLIST_ROLE,
              SecurityRole._ISSUER_ROLE,
              SecurityRole._PAUSER_ROLE,
              SecurityRole._CORPORATEACTIONS_ROLE,
            ],
            actives: [true, true, true, true],
          }),
        )
      ).payload,
    ).toBe(true);

    expect(
      await Role.hasRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: SecurityRole._CONTROLLIST_ROLE,
        }),
      ),
    ).toBe(true);

    expect(
      await Role.hasRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: SecurityRole._ISSUER_ROLE,
        }),
      ),
    ).toBe(true);

    expect(
      await Role.hasRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: SecurityRole._PAUSER_ROLE,
        }),
      ),
    ).toBe(true);

    expect(
      await Role.hasRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: SecurityRole._CORPORATEACTIONS_ROLE,
        }),
      ),
    ).toBe(true);

    expect(
      (
        await Role.applyRoles(
          new ApplyRolesRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            roles: [
              SecurityRole._CONTROLLIST_ROLE,
              SecurityRole._ISSUER_ROLE,
              SecurityRole._PAUSER_ROLE,
              SecurityRole._CORPORATEACTIONS_ROLE,
            ],
            actives: [false, false, false, false],
          }),
        )
      ).payload,
    ).toBe(true);

    expect(
      await Role.hasRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: SecurityRole._CONTROLLIST_ROLE,
        }),
      ),
    ).toBe(false);

    expect(
      await Role.hasRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: SecurityRole._ISSUER_ROLE,
        }),
      ),
    ).toBe(false);

    expect(
      await Role.hasRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: SecurityRole._PAUSER_ROLE,
        }),
      ),
    ).toBe(false);

    expect(
      await Role.hasRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: SecurityRole._CORPORATEACTIONS_ROLE,
        }),
      ),
    ).toBe(false);
  }, 60000);
});
