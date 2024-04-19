import RPCTransactionAdapter from '../../../src/port/out/rpc/RPCTransactionAdapter.js';
import {
  SDK,
  LoggerTransports,
  Security,
  Role,
  Network,
  CreateEquityRequest,
  RoleRequest,
  ControlListRequest,
  GetControlListMembersRequest,
  GetControlListCountRequest,
  PauseRequest,
  GetControlListTypeRequest,
  IssueRequest,
  GetAccountBalanceRequest,
  ForceTransferRequest,
  ForceRedeemRequest,
  Equity,
  LockRequest,
  GetLockedBalanceRequest,
  GetLockCountRequest,
  GetLocksIdRequest,
  TransferAndLockRequest,
} from '../../../src/index.js';
import TransferRequest from '../../../src/port/in/request/TransferRequest.js';
import RedeemRequest from '../../../src/port/in/request/RedeemRequest.js';
import Injectable from '../../../src/core/Injectable.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { MirrorNodeAdapter } from '../../../src/port/out/mirror/MirrorNodeAdapter.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import ConnectRequest, {
  SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';
import {
  CLIENT_ACCOUNT_ECDSA,
  CLIENT_ACCOUNT_ECDSA_B,
  FACTORY_ADDRESS,
  RESOLVER_ADDRESS,
  BUSINESS_LOGIC_KEYS_COMMON,
  BUSINESS_LOGIC_KEYS_EQUITY,
  BUSINESS_LOGIC_KEYS_BOND,
  CLIENT_ACCOUNT_ECDSA_A,
  CLIENT_ACCOUNT_ECDSA_P,
} from '../../config.js';
import NetworkService from '../../../src/app/service/NetworkService.js';
import RPCQueryAdapter from '../../../src/port/out/rpc/RPCQueryAdapter.js';
import { Wallet, ethers } from 'ethers';
import SecurityViewModel from '../../../src/port/in/response/SecurityViewModel.js';
import GetSecurityDetailsRequest from '../../../src/port/in/request/GetSecurityDetailsRequest.js';
import { SecurityRole } from '../../../src/domain/context/security/SecurityRole.js';
import { SecurityControlListType } from '../../../src/domain/context/security/SecurityControlListType.js';
import Account from '../../../src/domain/context/account/Account.js';
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
const type = 'EQUITY';
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
const regulationSubType = RegulationSubType.B_506;
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

let th: RPCTransactionAdapter;
let mirrorNodeAdapter: MirrorNodeAdapter;

describe('🧪 Security tests', () => {
  let ns: NetworkService;
  let rpcQueryAdapter: RPCQueryAdapter;
  let equity: SecurityViewModel;

  const delay = async (seconds = 5): Promise<void> => {
    seconds = seconds * 1000;
    await new Promise((r) => setTimeout(r, seconds));
  };

  const url = 'http://127.0.0.1:7546';
  const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

  const wallet = new Wallet(
    CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
    customHttpProvider,
  );

  const wallet_B = new Wallet(
    CLIENT_ACCOUNT_ECDSA_B.privateKey?.key ?? '',
    customHttpProvider,
  );

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

    th.signerOrProvider = wallet;

    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA, wallet);

    const requestST = new CreateEquityRequest({
      name: name,
      symbol: symbol,
      isin: isin,
      decimals: decimals,
      isWhiteList: true,
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
  }, 900_000);

  it('Get security', async () => {
    const equityInfo = await Security.getInfo(
      new GetSecurityDetailsRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );
    expect(equityInfo.name).toEqual(name);
    expect(equityInfo.symbol).toEqual(symbol);
    expect(equityInfo.isin).toEqual(isin);
    expect(equityInfo.type).toEqual(type);
    expect(equityInfo.decimals).toEqual(decimals);
    expect(equityInfo.isWhiteList).toEqual(true);
    expect(equityInfo.isControllable).toEqual(true);
    expect(equityInfo.isMultiPartition).toEqual(false);
    expect(equityInfo.totalSupply).toEqual('0');
    expect(equityInfo.diamondAddress).toEqual(
      equity.diamondAddress!.toString(),
    );
    expect(equityInfo.evmDiamondAddress!.toString().toUpperCase()).toEqual(
      equity.evmDiamondAddress!.toString().toUpperCase(),
    );
    expect(equityInfo.paused).toEqual(false);

    expect(equityInfo.regulation?.type).toEqual(regulationType);
    expect(equityInfo.regulation?.subType).toEqual(regulationSubType);
    expect(equityInfo.isCountryControlListWhiteList).toEqual(true);
    expect(equityInfo.countries).toEqual(countries);
    expect(equityInfo.info).toEqual(info);
  }, 600_000);

  it('Issue, Transfer, TransferAndLock & security', async () => {
    const issuedAmount = '10';
    const transferredAmount = '1';
    const transferredAndLockAmount = '2';

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    await Security.addToControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );

    await Security.addToControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._ISSUER_ROLE,
      }),
    );

    await Security.issue(
      new IssueRequest({
        amount: issuedAmount,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        securityId: equity.evmDiamondAddress!,
      }),
    );

    expect(
      await Security.transfer(
        new TransferRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          amount: transferredAmount,
        }),
      ),
    ).toBe(true);

    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual((+issuedAmount - +transferredAmount).toString());

    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual(transferredAmount);

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._LOCKER_ROLE,
      }),
    );

    const TIME = 30;
    const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000) + 1000;
    const expirationDate = currentTimeInSeconds + TIME;

    await Security.addToControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_P.evmAddress!.toString(),
      }),
    );

    expect(
      await Security.transferAndLock(
        new TransferAndLockRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA_P.evmAddress!.toString(),
          amount: transferredAndLockAmount,
          expirationDate: expirationDate.toString(),
        }),
      ),
    ).toBe(true);

    await Security.removeFromControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_P.evmAddress!.toString(),
      }),
    );

    await Security.redeem(
      new RedeemRequest({
        securityId: equity.evmDiamondAddress!,
        amount: (
          +issuedAmount -
          +transferredAmount -
          +transferredAndLockAmount
        ).toString(),
      }),
    );

    await Security.removeFromControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );

    await Security.removeFromControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._ISSUER_ROLE,
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._LOCKER_ROLE,
      }),
    );
  }, 600_000);

  it('Force transfer securities', async () => {
    const issueAmount = '100';
    const forceTransferAmount = '50';

    // grant roles
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLER_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._ISSUER_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    await Security.addToControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );

    await Security.addToControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
      }),
    );

    // issue securities in redeemed account
    await Security.issue(
      new IssueRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
        amount: issueAmount,
      }),
    );

    // do force transfer
    expect(
      await Security.controllerTransfer(
        new ForceTransferRequest({
          securityId: equity.evmDiamondAddress!,
          sourceId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          amount: forceTransferAmount,
        }),
      ),
    ).toBe(true);

    // revoke roles
    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLER_ROLE,
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._ISSUER_ROLE,
      }),
    );

    // check if transfer origin account has correct balance securities
    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual((+issueAmount - +forceTransferAmount).toString());

    // check if transfer origin account has correct balance securities
    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual((+forceTransferAmount).toString());

    await Security.redeem(
      new RedeemRequest({
        securityId: equity.evmDiamondAddress!,
        amount: forceTransferAmount,
      }),
    );

    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_B, wallet_B);

    await Security.redeem(
      new RedeemRequest({
        securityId: equity.evmDiamondAddress!,
        amount: (+issueAmount - +forceTransferAmount).toString(),
      }),
    );

    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA, wallet);

    await Security.removeFromControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );
  }, 600_000);

  it('Redeem security', async () => {
    const issuedAmount = '10';
    const redeemedAmount = '10';

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    await Security.addToControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._ISSUER_ROLE,
      }),
    );

    await Security.issue(
      new IssueRequest({
        amount: issuedAmount,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        securityId: equity.evmDiamondAddress!,
      }),
    );

    expect(
      await Security.redeem(
        new RedeemRequest({
          securityId: equity.evmDiamondAddress!,
          amount: redeemedAmount,
        }),
      ),
    ).toBe(true);

    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual((+issuedAmount - +redeemedAmount).toString());

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._ISSUER_ROLE,
      }),
    );

    await Security.removeFromControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );
  }, 600_000);

  it('Force redeem securities', async () => {
    const issueAmount = '10';
    const redeemAmount = '5';

    // grant roles
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLER_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._ISSUER_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    await Security.addToControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );

    await Security.addToControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
      }),
    );

    // issue securities in redeemed account
    await Security.issue(
      new IssueRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
        amount: issueAmount,
      }),
    );

    // do force transfer
    expect(
      await Security.controllerRedeem(
        new ForceRedeemRequest({
          securityId: equity.evmDiamondAddress!,
          sourceId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
          amount: redeemAmount,
        }),
      ),
    ).toBe(true);

    await Security.removeFromControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );

    await Security.removeFromControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
      }),
    );

    // revoke roles
    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLER_ROLE,
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._ISSUER_ROLE,
      }),
    );

    // check if transfer origin account has correct balance securities
    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual((+issueAmount - +redeemAmount).toString());
  }, 120_000);

  it('Pause a security', async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._PAUSER_ROLE,
      }),
    );

    expect(
      await Security.pause(
        new PauseRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toBe(true);

    expect(
      await Security.isPaused(
        new PauseRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toBe(true);

    await Security.unpause(
      new PauseRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._PAUSER_ROLE,
      }),
    );
  }, 120000);

  it('Unpause a security', async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._PAUSER_ROLE,
      }),
    );

    await Security.pause(
      new PauseRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );

    expect(
      await Security.unpause(
        new PauseRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toBe(true);

    expect(
      await Security.isPaused(
        new PauseRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toBe(false);

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._PAUSER_ROLE,
      }),
    );
  }, 120000);

  it('Get the security control list type', async () => {
    expect(
      await Security.getControlListType(
        new GetControlListTypeRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toBe(SecurityControlListType.WHITELIST);
  });

  it('Add an account to the control list', async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    expect(
      await Security.addToControlList(
        new ControlListRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        }),
      ),
    ).toBe(true);

    expect(
      await Security.isAccountInControlList(
        new ControlListRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        }),
      ),
    ).toBe(true);

    await Security.removeFromControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );
  }, 120000);

  it('Get control list members when no account is added', async () => {
    const membersCount = await Security.getControlListCount(
      new GetControlListCountRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );

    expect(membersCount).toBe(0);

    const members = await Security.getControlListMembers(
      new GetControlListMembersRequest({
        securityId: equity.evmDiamondAddress!,
        start: 0,
        end: membersCount,
      }),
    );

    expect(members).toStrictEqual([]);
  }, 600000);

  it('Get control list members when an account is added', async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    await Security.addToControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );

    const membersCount = await Security.getControlListCount(
      new GetControlListCountRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );

    expect(membersCount).toBe(1);

    const members = await Security.getControlListMembers(
      new GetControlListMembersRequest({
        securityId: equity.evmDiamondAddress!,
        start: 0,
        end: membersCount,
      }),
    );

    expect(members).toContain(CLIENT_ACCOUNT_ECDSA.id.value);

    await Security.removeFromControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );
  }, 120000);

  it('lock securities', async () => {
    const lockedAmount = '10';

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    await Security.addToControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._ISSUER_ROLE,
      }),
    );

    await Security.issue(
      new IssueRequest({
        amount: lockedAmount,
        targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
        securityId: equity.evmDiamondAddress!,
      }),
    );

    // grant roles
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._LOCKER_ROLE,
      }),
    );

    const expirationTimestamp = Math.ceil(new Date().getTime() / 1000) + 1000;

    // lock amount
    expect(
      await Security.lock(
        new LockRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
          amount: lockedAmount,
          expirationTimestamp: expirationTimestamp.toString(),
        }),
      ),
    ).toBe(true);

    // check locked balance updated
    const lockedBalance = await Security.getLockedBalanceOf(
      new GetLockedBalanceRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
      }),
    );

    expect(lockedBalance.value).toEqual(lockedAmount);

    // check lock count
    const lockCount = await Security.getLockCount(
      new GetLockCountRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
      }),
    );

    expect(lockCount).toEqual(1);

    // check locks id
    const locksId = await Security.getLocksId(
      new GetLocksIdRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
        start: 0,
        end: 100,
      }),
    );

    expect(locksId.length).toEqual(1);

    expect(locksId[0]).toEqual('0');

    // revoke roles
    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._LOCKER_ROLE,
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._ISSUER_ROLE,
      }),
    );

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );
  }, 120_000);
});

// eslint-disable-next-line jest/expect-expect
async function changeNetworkUser(
  account: Account,
  signer: Wallet,
): Promise<void> {
  th.signerOrProvider = signer;

  await Network.connect(
    new ConnectRequest({
      account: {
        accountId: account.id.toString(),
        evmAddress: (
          await mirrorNodeAdapter.getAccountInfo(account.id.toString())
        ).evmAddress,
        privateKey: account.privateKey,
      },
      network: 'testnet',
      wallet: SupportedWallets.METAMASK,
      mirrorNode: mirrorNode,
      rpcNode: rpcNode,
      debug: true,
    }),
  );
}
