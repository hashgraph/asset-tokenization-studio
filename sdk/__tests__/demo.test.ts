import RPCTransactionAdapter from '../src/port/out/rpc/RPCTransactionAdapter.js';
import {
  SDK,
  LoggerTransports,
  Security,
  Network,
  CreateEquityRequest,
  Equity,
} from '../src/index.js';
import Injectable from '../src/core/Injectable.js';
import { MirrorNode } from '../src/domain/context/network/MirrorNode.js';
import { MirrorNodeAdapter } from '../src/port/out/mirror/MirrorNodeAdapter.js';
import { JsonRpcRelay } from '../src/domain/context/network/JsonRpcRelay.js';
import ConnectRequest, {
  SupportedWallets,
} from '../src/port/in/request/ConnectRequest.js';
import {
  CLIENT_ACCOUNT_ECDSA_Z,
  CLIENT_ACCOUNT_ECDSA_A,
  CLIENT_ACCOUNT_ECDSA_B,
  CLIENT_ACCOUNT_ECDSA_C,
  CLIENT_ACCOUNT_ECDSA_P,
  CLIENT_ACCOUNT_ECDSA_I,
  FACTORY_ADDRESS,
  RESOLVER_ADDRESS,
  BUSINESS_LOGIC_KEYS_COMMON,
  BUSINESS_LOGIC_KEYS_EQUITY,
  BUSINESS_LOGIC_KEYS_BOND,
} from './config.js';
import NetworkService from '../src/app/service/NetworkService.js';
import RPCQueryAdapter from '../src/port/out/rpc/RPCQueryAdapter.js';
import { Wallet, ethers } from 'ethers';
import SecurityViewModel from '../src/port/in/response/SecurityViewModel.js';
import GetSecurityDetailsRequest from '../src/port/in/request/GetSecurityDetailsRequest.js';
import Account from '../src/domain/context/account/Account.js';
import EvmAddress from '../src/domain/context/contract/EvmAddress.js';
import { SecurityRole } from '../src/domain/context/security/SecurityRole.js';
import BigDecimal from '../src/domain/context/shared/BigDecimal.js';
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from '../src/domain/context/factory/RegulationType.js';

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
const _1_MINUTE_MS = 60000;

describe('🧪 Security test', () => {
  let th: RPCTransactionAdapter;
  let ns: NetworkService;
  let mirrorNodeAdapter: MirrorNodeAdapter;
  let rpcQueryAdapter: RPCQueryAdapter;
  let equity: SecurityViewModel;
  let signer_Z: Wallet;
  let signer_A: Wallet;
  //let signer_B: Wallet;
  let signer_C: Wallet;
  let signer_P: Wallet;
  let signer_I: Wallet;
  let account_A_balance: ethers.BigNumber;
  let account_C_balance: ethers.BigNumber;
  let totalTokenSupply: ethers.BigNumber;

  const delay = async (seconds = 5): Promise<void> => {
    seconds = seconds * 1000;
    await new Promise((r) => setTimeout(r, seconds));
  };

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

    signer_Z = new Wallet(
      CLIENT_ACCOUNT_ECDSA_Z.privateKey?.key ?? '',
      customHttpProvider,
    );
    signer_A = new Wallet(
      CLIENT_ACCOUNT_ECDSA_A.privateKey?.key ?? '',
      customHttpProvider,
    );
    /*signer_B = new Wallet(
      CLIENT_ACCOUNT_ECDSA_B.privateKey?.key ?? '',
      customHttpProvider,
    );*/
    signer_C = new Wallet(
      CLIENT_ACCOUNT_ECDSA_C.privateKey?.key ?? '',
      customHttpProvider,
    );
    signer_P = new Wallet(
      CLIENT_ACCOUNT_ECDSA_P.privateKey?.key ?? '',
      customHttpProvider,
    );
    signer_I = new Wallet(
      CLIENT_ACCOUNT_ECDSA_I.privateKey?.key ?? '',
      customHttpProvider,
    );

    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_Z, signer_Z);

    const requestST = new CreateEquityRequest({
      name: name,
      symbol: symbol,
      isin: isin,
      decimals: decimals,
      isWhiteList: false,
      isControllable: true,
      isMultiPartition: false,
      diamondOwnerAccount: CLIENT_ACCOUNT_ECDSA_Z.id.toString(),
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

  it('DEMO TESTS', async () => {
    // STEP 1 //////////////////////////////////////////////////////
    console.log('Deploy a new security token using account “Z”');

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

    // STEP 2 //////////////////////////////////////////////////////
    console.log(
      'Add account “B” to blacklist using account “I” => fails (no permission)',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    await expect(
      th.addToControlList(
        new EvmAddress(equityInfo.evmDiamondAddress!),
        new EvmAddress(CLIENT_ACCOUNT_ECDSA_B.evmAddress!),
      ),
    ).rejects.toThrow();

    // STEP 3 //////////////////////////////////////////////////////
    console.log(
      'Grant issue & control list & corporate action & controller roles to account “I” using account “Z” => succeeds',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_Z, signer_Z);

    await th.grantRole(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_I.evmAddress!),
      SecurityRole._ISSUER_ROLE,
    );
    await th.grantRole(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_I.evmAddress!),
      SecurityRole._CONTROLLIST_ROLE,
    );
    await th.grantRole(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_I.evmAddress!),
      SecurityRole._CORPORATEACTIONS_ROLE,
    );
    await th.grantRole(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_I.evmAddress!),
      SecurityRole._CONTROLLER_ROLE,
    );

    // STEP 4 //////////////////////////////////////////////////////
    console.log(
      'Grant pause role to account “P” using account “Z” => succeeds',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_Z, signer_Z);

    await th.grantRole(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_P.evmAddress!),
      SecurityRole._PAUSER_ROLE,
    );

    // STEP 5 //////////////////////////////////////////////////////
    console.log('Check current roles');

    const roles = [
      SecurityRole._DEFAULT_ADMIN_ROLE,
      SecurityRole._ISSUER_ROLE,
      SecurityRole._CONTROLLIST_ROLE,
      SecurityRole._CORPORATEACTIONS_ROLE,
      SecurityRole._CONTROLLER_ROLE,
      SecurityRole._PAUSER_ROLE,
    ];
    const roleMembers = [
      CLIENT_ACCOUNT_ECDSA_Z.evmAddress!,
      CLIENT_ACCOUNT_ECDSA_I.evmAddress!,
      CLIENT_ACCOUNT_ECDSA_I.evmAddress!,
      CLIENT_ACCOUNT_ECDSA_I.evmAddress!,
      CLIENT_ACCOUNT_ECDSA_I.evmAddress!,
      CLIENT_ACCOUNT_ECDSA_P.evmAddress!,
    ];

    for (let i = 0; i < roles.length; i++) {
      const membersCount = await rpcQueryAdapter.getRoleMemberCount(
        new EvmAddress(equityInfo.evmDiamondAddress!),
        roles[i],
      );
      expect(membersCount).toBe(1);
      const members = await rpcQueryAdapter.getRoleMembers(
        new EvmAddress(equityInfo.evmDiamondAddress!),
        roles[i],
        0,
        membersCount,
      );
      expect(members[0].toUpperCase()).toStrictEqual(
        roleMembers[i].toUpperCase(),
      );
    }

    // STEP 6 //////////////////////////////////////////////////////
    console.log('Add account “B” to blacklist using account “I” => succeeds');
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    await th.addToControlList(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_B.evmAddress!),
    );

    // STEP 7 a //////////////////////////////////////////////////////
    console.log(
      'Issue 10’000 securities using account “I” to account “B” => fails (B is blacklisted)',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    await expect(
      th.issue(
        new EvmAddress(equityInfo.evmDiamondAddress!),
        new EvmAddress(CLIENT_ACCOUNT_ECDSA_B.evmAddress!),
        new BigDecimal('10000', decimals),
      ),
    ).rejects.toThrow();

    // STEP 7 b //////////////////////////////////////////////////////
    console.log(
      'Issue 10’000 securities using account “I” to account “A” => succeed',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    await th.issue(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_A.evmAddress!),
      new BigDecimal('10000', decimals),
    );

    // STEP 8 //////////////////////////////////////////////////////
    console.log(
      'Transfer 500 securities from account “A” to “B” => fails (B is blacklisted)',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_A, signer_A);

    await expect(
      th.transfer(
        new EvmAddress(equityInfo.evmDiamondAddress!),
        new EvmAddress(CLIENT_ACCOUNT_ECDSA_B.evmAddress!),
        new BigDecimal('500', decimals),
      ),
    ).rejects.toThrow();

    // STEP 9 //////////////////////////////////////////////////////
    console.log('Transfer 500 securities from account “A” to “C” => succeeds');
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_A, signer_A);

    await th.transfer(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
      new BigDecimal('500', decimals),
    );

    // STEP 10 //////////////////////////////////////////////////////
    console.log(
      'Schedule Dividends for X minutes later (1 unit per security) using account “I”',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000) + 1;
    const dividendsRecordDateInSeconds =
      currentTimeInSeconds + _1_MINUTE_MS / 1000;
    const dividendsExecutionDateInSeconds =
      currentTimeInSeconds + 10 * (_1_MINUTE_MS / 1000);
    const dividendsAmountPerEquity = 1;
    const result = await th.setDividends(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new BigDecimal(dividendsRecordDateInSeconds.toString(), 0),
      new BigDecimal(dividendsExecutionDateInSeconds.toString(), 0),
      new BigDecimal(dividendsAmountPerEquity.toString(), 0),
    );
    const dividendId = result.response.dividendId.toNumber();

    const registeredDividend = await rpcQueryAdapter.getDividends(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      dividendId,
    );
    expect(registeredDividend.amountPerUnitOfSecurity.toString()).toEqual(
      dividendsAmountPerEquity.toString(),
    );
    expect(registeredDividend.executionTimeStamp).toEqual(
      dividendsExecutionDateInSeconds,
    );
    expect(registeredDividend.recordTimeStamp).toEqual(
      dividendsRecordDateInSeconds,
    );
    expect(registeredDividend.snapshotId).toBeUndefined();

    // STEP 11 a //////////////////////////////////////////////////////
    console.log('Add account “C” to blacklist using account “I” => succeeds');
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    await th.addToControlList(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
    );

    // STEP 11 b //////////////////////////////////////////////////////
    console.log(
      'Transfer 1 securities from account “C” to “A” => fails (C is blacklisted)',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_C, signer_C);

    await expect(
      th.transfer(
        new EvmAddress(equityInfo.evmDiamondAddress!),
        new EvmAddress(CLIENT_ACCOUNT_ECDSA_A.evmAddress!),
        new BigDecimal('1', decimals),
      ),
    ).rejects.toThrow();

    // STEP 11 c //////////////////////////////////////////////////////
    console.log(
      'Remove account “C” from blacklist using account “I” => succeeds',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    await th.removeFromControlList(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
    );

    // STEP 11 d //////////////////////////////////////////////////////
    console.log('Wait 1 minutes');
    await delay(_1_MINUTE_MS / 1000);

    // STEP 12 //////////////////////////////////////////////////////
    console.log('Transfer 500 securities from account “C” to “A” => succeeds');
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_C, signer_C);

    await th.transfer(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_A.evmAddress!),
      new BigDecimal('500', decimals),
    );

    // STEP 13 //////////////////////////////////////////////////////
    console.log(
      'Check accounts entitled dividends and accounts current balances',
    );

    const account_A_Balance_AtSnapshot = await rpcQueryAdapter.getDividendsFor(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_A.evmAddress!),
      dividendId,
    );
    const account_C_Balance_AtSnapshot = await rpcQueryAdapter.getDividendsFor(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
      dividendId,
    );
    account_A_balance = await rpcQueryAdapter.balanceOf(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_A.evmAddress!),
    );
    account_C_balance = await rpcQueryAdapter.balanceOf(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
    );
    expect(account_A_Balance_AtSnapshot.toString()).toBe(
      new BigDecimal('9500', decimals).toBigNumber().toString(),
    );
    expect(account_C_Balance_AtSnapshot.toString()).toBe(
      new BigDecimal('500', decimals).toBigNumber().toString(),
    );
    expect(account_A_balance.toString()).toBe(
      new BigDecimal('10000', decimals).toBigNumber().toString(),
    );
    expect(account_C_balance.toString()).toBe(
      new BigDecimal('0', decimals).toBigNumber().toString(),
    );

    // STEP 14 //////////////////////////////////////////////////////
    console.log('Redeem 1’000 securities from account “A”');
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_A, signer_A);

    await th.redeem(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new BigDecimal('1000', decimals),
    );

    // STEP 15 //////////////////////////////////////////////////////
    console.log('Check current balances and total supply');

    account_A_balance = await rpcQueryAdapter.balanceOf(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_A.evmAddress!),
    );

    totalTokenSupply = await rpcQueryAdapter.totalSupply(
      new EvmAddress(equityInfo.evmDiamondAddress!),
    );

    expect(account_A_balance.toString()).toBe(
      new BigDecimal('9000', decimals).toBigNumber().toString(),
    );
    expect(totalTokenSupply.toString()).toBe(
      new BigDecimal('9000', decimals).toBigNumber().toString(),
    );

    // STEP 16 //////////////////////////////////////////////////////
    console.log(
      'Force transfer 500 securities from account “A” to “C” using account “I” => succeeds',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    await th.controllerTransfer(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_A.evmAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
      new BigDecimal('500', decimals),
    );

    // STEP 17 //////////////////////////////////////////////////////
    console.log(
      'Force redeem 100 securities from account “C” using account “I” => succeeds',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    await th.controllerRedeem(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
      new BigDecimal('100', decimals),
    );

    // STEP 18 //////////////////////////////////////////////////////
    console.log('Check current balances and total supply');

    account_A_balance = await rpcQueryAdapter.balanceOf(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_A.evmAddress!),
    );

    account_C_balance = await rpcQueryAdapter.balanceOf(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
    );

    totalTokenSupply = await rpcQueryAdapter.totalSupply(
      new EvmAddress(equityInfo.evmDiamondAddress!),
    );

    expect(account_A_balance.toString()).toBe(
      new BigDecimal('8500', decimals).toBigNumber().toString(),
    );
    expect(account_C_balance.toString()).toBe(
      new BigDecimal('400', decimals).toBigNumber().toString(),
    );
    expect(totalTokenSupply.toString()).toBe(
      new BigDecimal('8900', decimals).toBigNumber().toString(),
    );

    // STEP 19 //////////////////////////////////////////////////////
    console.log(
      'Revoke controller role from account “I” using account “Z” => succeeds',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_Z, signer_Z);

    await th.revokeRole(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_I.evmAddress!),
      SecurityRole._CONTROLLER_ROLE,
    );

    // STEP 20 //////////////////////////////////////////////////////
    console.log(
      'Force transfer 500 securities from account “A” to “C” using account “I” => fails (no permission)',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    await expect(
      th.controllerTransfer(
        new EvmAddress(equityInfo.evmDiamondAddress!),
        new EvmAddress(CLIENT_ACCOUNT_ECDSA_A.evmAddress!),
        new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
        new BigDecimal('500', decimals),
      ),
    ).rejects.toThrow();

    // STEP 21 //////////////////////////////////////////////////////
    console.log(
      'Force redeem 100 securities from account “C” using account “I” => fails (no permission)',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    await expect(
      th.controllerRedeem(
        new EvmAddress(equityInfo.evmDiamondAddress!),
        new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
        new BigDecimal('100', decimals),
      ),
    ).rejects.toThrow();

    // STEP 22 //////////////////////////////////////////////////////
    console.log('Pause security token using account “P” => succeeds');
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_P, signer_P);

    await th.pause(new EvmAddress(equityInfo.evmDiamondAddress!));

    // STEP 23 //////////////////////////////////////////////////////
    console.log(
      'Grant controller role to  account “I” using account “Z” => fails (paused)',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_Z, signer_Z);

    await expect(
      th.grantRole(
        new EvmAddress(equityInfo.evmDiamondAddress!),
        new EvmAddress(CLIENT_ACCOUNT_ECDSA_I.evmAddress!),
        SecurityRole._CONTROLLER_ROLE,
      ),
    ).rejects.toThrow();

    // STEP 24 //////////////////////////////////////////////////////
    console.log(
      'Transfer 500 securities from account “A” to “C” => fails (paused)',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_A, signer_A);

    await expect(
      th.transfer(
        new EvmAddress(equityInfo.evmDiamondAddress!),
        new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
        new BigDecimal('500', decimals),
      ),
    ).rejects.toThrow();

    // STEP 25 //////////////////////////////////////////////////////
    console.log(
      'Issue 1 security to account “A” using account “I” => fails (paused)',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    await expect(
      th.issue(
        new EvmAddress(equityInfo.evmDiamondAddress!),
        new EvmAddress(CLIENT_ACCOUNT_ECDSA_A.evmAddress!),
        new BigDecimal('1', decimals),
      ),
    ).rejects.toThrow();

    // STEP 26 //////////////////////////////////////////////////////
    console.log('Unpause security token using account “P” => succeeds');
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_P, signer_P);

    await th.unpause(new EvmAddress(equityInfo.evmDiamondAddress!));

    // STEP 27 //////////////////////////////////////////////////////
    console.log(
      'Grant controller role to  account “I” using account “Z” => succeeds',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_Z, signer_Z);

    await th.grantRole(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_I.evmAddress!),
      SecurityRole._CONTROLLER_ROLE,
    );

    // STEP 28 //////////////////////////////////////////////////////
    console.log('Transfer 500 securities from account “A” to “C” => succeeds');
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_A, signer_A);

    await th.transfer(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
      new BigDecimal('500', decimals),
    );

    // STEP 29 //////////////////////////////////////////////////////
    console.log(
      'Issue 1 security to account “A” using account “I” => succeeds',
    );
    await changeNetworkUser(CLIENT_ACCOUNT_ECDSA_I, signer_I);

    await th.issue(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_A.evmAddress!),
      new BigDecimal('1', decimals),
    );

    // STEP 30 //////////////////////////////////////////////////////
    console.log('Check current balances and total supply');

    account_A_balance = await rpcQueryAdapter.balanceOf(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_A.evmAddress!),
    );

    account_C_balance = await rpcQueryAdapter.balanceOf(
      new EvmAddress(equityInfo.evmDiamondAddress!),
      new EvmAddress(CLIENT_ACCOUNT_ECDSA_C.evmAddress!),
    );

    totalTokenSupply = await rpcQueryAdapter.totalSupply(
      new EvmAddress(equityInfo.evmDiamondAddress!),
    );

    expect(account_A_balance.toString()).toBe(
      new BigDecimal('8001', decimals).toBigNumber().toString(),
    );
    expect(account_C_balance.toString()).toBe(
      new BigDecimal('900', decimals).toBigNumber().toString(),
    );
    expect(totalTokenSupply.toString()).toBe(
      new BigDecimal('8901', decimals).toBigNumber().toString(),
    );
  }, 600000_000);
});
