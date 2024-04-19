import RPCTransactionAdapter from '../../../src/port/out/rpc/RPCTransactionAdapter.js';
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
} from '../../../src/index.js';
import Injectable from '../../../src/core/Injectable.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { MirrorNodeAdapter } from '../../../src/port/out/mirror/MirrorNodeAdapter.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import ConnectRequest, {
  SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';
import { Wallet, ethers } from 'ethers';
import {
  BUSINESS_LOGIC_KEYS_COMMON,
  BUSINESS_LOGIC_KEYS_EQUITY,
  BUSINESS_LOGIC_KEYS_BOND,
  CLIENT_ACCOUNT_ECDSA,
  CLIENT_ACCOUNT_ECDSA_A,
  FACTORY_ADDRESS,
  RESOLVER_ADDRESS,
} from '../../config.js';
import { SecurityRole } from '../../../src/domain/context/security/SecurityRole.js';
import NetworkService from '../../../src/app/service/NetworkService.js';
import RPCQueryAdapter from '../../../src/port/out/rpc/RPCQueryAdapter.js';
import SecurityViewModel from '../../../src/port/in/response/SecurityViewModel.js';
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from '../../../src/domain/context/factory/RegulationType.js';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };

const decimals = 6;
const name = 'TEST_SECURITY_TOKEN';
const symbol = 'TEST';
const isin = 'ABCDE123456Z';
const votingRight = true;
const informationRight = false;
const liquidationRight = true;
const subscriptionRight = false;
const convertionRight = true;
const redemptionRight = false;
const putRight = true;
const dividendRight = 1;
const currency = '0x345678';
const numberOfShares = 0;
const nominalValue = 1000;
const regulationType = RegulationType.REG_D;
const regulationSubType = RegulationSubType.C_506;
const countries = 'AF,HG,BN';
const info = 'Anything';

const mirrorNode: MirrorNode = {
  name: 'testmirrorNode',
  baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
};

const rpcNode: JsonRpcRelay = {
  name: 'testrpcNode',
  baseUrl: 'http://127.0.0.1:7546/api',
};

describe('🧪 Role test', () => {
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
    ns.environment = 'testnet';
    ns.configuration = {
      factoryAddress: FACTORY_ADDRESS,
      resolverAddress: RESOLVER_ADDRESS,
      businessLogicKeysCommon: BUSINESS_LOGIC_KEYS_COMMON,
      businessLogicKeysEquity: BUSINESS_LOGIC_KEYS_EQUITY,
      businessLogicKeysBond: BUSINESS_LOGIC_KEYS_BOND,
    };
    ns.mirrorNode = mirrorNode;
    ns.rpcNode = rpcNode;

    await th.init(true);
    await th.register(undefined, true);

    const url = 'http://127.0.0.1:7546';
    const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

    th.signerOrProvider = new Wallet(
      CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
      customHttpProvider,
    );

    await Network.connect(
      new ConnectRequest({
        account: {
          accountId: CLIENT_ACCOUNT_ECDSA.id.toString(),
          privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
        },
        network: 'testnet',
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
      isControllable: true,
      isMultiPartition: false,
      diamondOwnerAccount: CLIENT_ACCOUNT_ECDSA.id.toString(),
      votingRight: votingRight,
      informationRight: informationRight,
      liquidationRight: liquidationRight,
      subscriptionRight: subscriptionRight,
      convertionRight: convertionRight,
      redemptionRight: redemptionRight,
      putRight: putRight,
      dividendRight: dividendRight,
      currency: currency,
      numberOfShares: numberOfShares.toString(),
      nominalValue: nominalValue.toString(),
      regulationType: CastRegulationType.toNumber(regulationType),
      regulationSubType: CastRegulationSubType.toNumber(regulationSubType),
      isCountryControlListWhiteList: true,
      countries: countries,
      info: info,
    });

    equity = (await Equity.create(requestST)).security;

    await delay();
  }, 600_000);

  it('Grant and Revoke CONTROLLIST_ROLE role', async () => {
    expect(
      await Role.grantRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          role: SecurityRole._CONTROLLIST_ROLE,
        }),
      ),
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
    expect(rolesFor[0].toUpperCase()).toEqual(
      SecurityRole._CONTROLLIST_ROLE.toUpperCase(),
    );
    expect(membersFor[0].toUpperCase()).toEqual(
      CLIENT_ACCOUNT_ECDSA_A.id.toString().toUpperCase(),
    );

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

  it('grant all roles then revoke all roles using apply', async () => {
    expect(
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
      ),
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
      ),
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
