import { RPCTransactionAdapter } from '../../../src/port/out/rpc/RPCTransactionAdapter.js';
import {
  SDK,
  LoggerTransports,
  Security,
  Role,
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
  GetLockCountRequest,
  GetLocksIdRequest,
  TransferAndLockRequest,
  ReleaseRequest,
} from '../../../src/index.js';
import TransferRequest from '../../../src/port/in/request/TransferRequest.js';
import RedeemRequest from '../../../src/port/in/request/RedeemRequest.js';
import Injectable from '../../../src/core/Injectable.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { MirrorNodeAdapter } from '../../../src/port/out/mirror/MirrorNodeAdapter.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import {
  CLIENT_ACCOUNT_ECDSA,
  CLIENT_ACCOUNT_ECDSA_B,
  FACTORY_ADDRESS,
  RESOLVER_ADDRESS,
  BUSINESS_LOGIC_KEYS_COMMON,
  BUSINESS_LOGIC_KEYS_EQUITY,
  BUSINESS_LOGIC_KEYS_BOND,
  CLIENT_ACCOUNT_ECDSA_A,
} from '../../config.js';
import NetworkService from '../../../src/app/service/NetworkService.js';
import { RPCQueryAdapter } from '../../../src/port/out/rpc/RPCQueryAdapter.js';
import { Wallet, ethers } from 'ethers';
import SecurityViewModel from '../../../src/port/in/response/SecurityViewModel.js';
import GetSecurityDetailsRequest from '../../../src/port/in/request/GetSecurityDetailsRequest.js';
import { SecurityRole } from '../../../src/domain/context/security/SecurityRole.js';
import { SecurityControlListType } from '../../../src/domain/context/security/SecurityControlListType.js';
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from '../../../src/domain/context/factory/RegulationType.js';
import Account from '../../../src/domain/context/account/Account.js';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };

const decimals = 0;
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

  const url = 'http://127.0.0.1:7546';
  const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

  const wallet = new Wallet(
    CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
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
    const account = new Account({
      id: CLIENT_ACCOUNT_ECDSA.id.toString(),
      evmAddress: CLIENT_ACCOUNT_ECDSA.evmAddress,
      alias: CLIENT_ACCOUNT_ECDSA.alias,
      privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
      publicKey: CLIENT_ACCOUNT_ECDSA.publicKey,
    });
    await th.register(account, true);

    th.signerOrProvider = wallet;

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
        role: SecurityRole._CONTROLLER_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._PAUSER_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CONTROLLIST_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._DOCUMENTER_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._SNAPSHOT_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._LOCKER_ROLE,
      }),
    );
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
    expect(equityInfo.isWhiteList).toEqual(false);
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

  it('Control List Add & Remove', async () => {
    let membersCount = await Security.getControlListCount(
      new GetControlListCountRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );

    expect(membersCount).toBe(0);

    let members = await Security.getControlListMembers(
      new GetControlListMembersRequest({
        securityId: equity.evmDiamondAddress!,
        start: 0,
        end: membersCount,
      }),
    );

    expect(members).toStrictEqual([]);

    expect(
      await Security.isAccountInControlList(
        new ControlListRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        }),
      ),
    ).toBe(false);

    await Security.addToControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
      }),
    );

    expect(
      await Security.isAccountInControlList(
        new ControlListRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        }),
      ),
    ).toBe(true);

    membersCount = await Security.getControlListCount(
      new GetControlListCountRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );

    expect(membersCount).toBe(1);

    members = await Security.getControlListMembers(
      new GetControlListMembersRequest({
        securityId: equity.evmDiamondAddress!,
        start: 0,
        end: membersCount,
      }),
    );

    expect(members).toContain(CLIENT_ACCOUNT_ECDSA_A.id.value);

    await Security.removeFromControlList(
      new ControlListRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
      }),
    );

    expect(
      await Security.isAccountInControlList(
        new ControlListRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        }),
      ),
    ).toBe(false);
  }, 600_000);

  it('Issue and Redeem', async () => {
    const issuedAmount = '10';

    await Security.issue(
      new IssueRequest({
        amount: issuedAmount,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        securityId: equity.evmDiamondAddress!,
      }),
    );

    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual(issuedAmount);

    await Security.redeem(
      new RedeemRequest({
        securityId: equity.evmDiamondAddress!,
        amount: issuedAmount,
      }),
    );

    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual('0');
  }, 600_000);

  it('Transfer and Controller Redeem', async () => {
    const issuedAmount = '10';
    const transferredAmount = '1';

    await Security.issue(
      new IssueRequest({
        amount: issuedAmount,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        securityId: equity.evmDiamondAddress!,
      }),
    );

    expect(
      (
        await Security.transfer(
          new TransferRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
            amount: transferredAmount,
          }),
        )
      ).payload,
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

    await Security.controllerRedeem(
      new ForceRedeemRequest({
        securityId: equity.evmDiamondAddress!,
        amount: transferredAmount,
        sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
      }),
    );

    await Security.controllerRedeem(
      new ForceRedeemRequest({
        securityId: equity.evmDiamondAddress!,
        amount: (+issuedAmount - +transferredAmount).toString(),
        sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );

    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual('0');

    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual('0');
  }, 600_000);

  it('TransferAndLock and release', async () => {
    const issuedAmount = '10';
    const transferredAndLockedAmount = '2';
    const expirationTimeStamp = '9991976120';

    await Security.issue(
      new IssueRequest({
        amount: issuedAmount,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        securityId: equity.evmDiamondAddress!,
      }),
    );

    expect(
      (
        await Security.transferAndLock(
          new TransferAndLockRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
            amount: transferredAndLockedAmount,
            expirationDate: expirationTimeStamp,
          }),
        )
      ).payload,
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
    ).toEqual((+issuedAmount - +transferredAndLockedAmount).toString());

    expect(
      (
        await Security.getLockedBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual(transferredAndLockedAmount);

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
        end: 1,
      }),
    );

    expect(locksId.length).toEqual(1);

    expect(locksId[0]).toEqual('1');

    expect(
      (
        await Security.release(
          new ReleaseRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
            lockId: 1,
          }),
        )
      ).payload,
    ).toBe(true);

    expect(
      (
        await Security.getLockedBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual('0');

    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual(transferredAndLockedAmount);

    await Security.redeem(
      new RedeemRequest({
        securityId: equity.evmDiamondAddress!,
        amount: (+issuedAmount - +transferredAndLockedAmount).toString(),
      }),
    );

    await Security.controllerRedeem(
      new ForceRedeemRequest({
        securityId: equity.evmDiamondAddress!,
        amount: transferredAndLockedAmount,
        sourceId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
      }),
    );
  }, 600_000);

  it('Force transfer securities', async () => {
    const issueAmount = '100';
    const forceTransferAmount = '50';

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
      (
        await Security.controllerTransfer(
          new ForceTransferRequest({
            securityId: equity.evmDiamondAddress!,
            sourceId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            amount: forceTransferAmount,
          }),
        )
      ).payload,
    ).toBe(true);

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

    await Security.controllerRedeem(
      new ForceRedeemRequest({
        securityId: equity.evmDiamondAddress!,
        amount: (+issueAmount - +forceTransferAmount).toString(),
        sourceId: CLIENT_ACCOUNT_ECDSA_B.evmAddress!.toString(),
      }),
    );
  }, 600_000);

  it('Pause and UnPause a security', async () => {
    expect(
      (
        await Security.pause(
          new PauseRequest({
            securityId: equity.evmDiamondAddress!,
          }),
        )
      ).payload,
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

    expect(
      await Security.isPaused(
        new PauseRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toBe(false);
  }, 120000);

  it('Get the security control list type', async () => {
    expect(
      await Security.getControlListType(
        new GetControlListTypeRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toBe(SecurityControlListType.BLACKLIST);
  });
});
