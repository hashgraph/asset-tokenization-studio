// SPDX-License-Identifier: Apache-2.0

import "../environmentMock";
import {
  SDK,
  LoggerTransports,
  CreateEquityRequest,
  SupportedWallets,
  Network,
  RoleRequest,
  Role,
  Equity,
  SetDividendsRequest,
  GetDividendsRequest,
  GetAllDividendsRequest,
  SetVotingRightsRequest,
  GetVotingRightsRequest,
  GetAllVotingRightsRequest,
  GetDividendsForRequest,
  GetVotingRightsForRequest,
  SetScheduledBalanceAdjustmentRequest,
  PauseRequest,
  Security,
  GetScheduledBalanceAdjustmentRequest,
  GetScheduledBalanceAdjustmentCountRequest,
  GetAllScheduledBalanceAdjustmentsRequest,
} from "@port/in";
import { CLIENT_ACCOUNT_ECDSA, FACTORY_ADDRESS, RESOLVER_ADDRESS } from "@test/config";
import ConnectRequest from "@port/in/request/network/ConnectRequest";
import { Wallet, ethers } from "ethers";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import { RPCTransactionAdapter } from "@port/out/rpc/RPCTransactionAdapter";
import NetworkService from "@service/network/NetworkService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import SecurityViewModel from "@port/in/response/SecurityViewModel";
import Injectable from "@core/injectable/Injectable";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";

SDK.log = { level: "ERROR", transports: new LoggerTransports.Console() };

const decimals = 0;
const recordTimestamp = Math.ceil(new Date().getTime() / 1000) + 1000;
const factor = "1";
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
const currency = "0x858368";
const numberOfShares = 200000;
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

describe("🧪 Equity test", () => {
  let th: RPCTransactionAdapter;
  let ns: NetworkService;
  let mirrorNodeAdapter: MirrorNodeAdapter;
  let rpcQueryAdapter: RPCQueryAdapter;
  let equity: SecurityViewModel;

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
          evmAddress: CLIENT_ACCOUNT_ECDSA.evmAddress?.toString(),
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

    console.log("equity: " + JSON.stringify(equity));
  }, 600_000);

  it("Dividends", async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );

    const amount = "1";
    const recordTimestamp = Math.ceil(new Date().getTime() / 1000) + 1000;
    const executionTimestamp = recordTimestamp + 1000;

    await Equity.setDividends(
      new SetDividendsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        amountPerUnitOfSecurity: amount,
        recordTimestamp: recordTimestamp.toString(),
        executionTimestamp: executionTimestamp.toString(),
      }),
    );

    const dividend = await Equity.getDividends(
      new GetDividendsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        dividendId: 1,
      }),
    );

    const allDividends = await Equity.getAllDividends(
      new GetAllDividendsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
      }),
    );

    const dividendFor = await Equity.getDividendsFor(
      new GetDividendsForRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        dividendId: 1,
      }),
    );

    expect(dividend.amountPerUnitOfSecurity).toEqual(amount);
    expect(dividend.amountDecimals).toEqual(0);
    expect(dividend.dividendId).toEqual(1);
    expect(dividend.executionDate.getTime() / 1000).toEqual(executionTimestamp);
    expect(dividend.recordDate.getTime() / 1000).toEqual(recordTimestamp);
    expect(dividendFor.tokenBalance).toEqual("0");
    expect(dividendFor.decimals).toEqual("0");
    expect(allDividends.length).toEqual(1);

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );
  }, 60_000);

  it("VotingRights", async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );

    const recordTimestamp = Math.ceil(new Date().getTime() / 1000) + 1000;
    const data = "0x0123456789ABCDEF";

    await Equity.setVotingRights(
      new SetVotingRightsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        recordTimestamp: recordTimestamp.toString(),
        data: data,
      }),
    );

    const voting = await Equity.getVotingRights(
      new GetVotingRightsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        votingId: 1,
      }),
    );

    const allVotings = await Equity.getAllVotingRights(
      new GetAllVotingRightsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
      }),
    );

    const votingFor = await Equity.getVotingRightsFor(
      new GetVotingRightsForRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        votingId: 1,
      }),
    );

    expect(voting.votingId).toEqual(1);
    expect(voting.recordDate.getTime() / 1000).toEqual(recordTimestamp);
    expect(voting.data.toUpperCase()).toEqual(data.toUpperCase());
    expect(votingFor.tokenBalance).toEqual("0");
    expect(votingFor.decimals).toEqual("0");
    expect(allVotings.length).toEqual(1);

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );
  }, 60_000);

  it("Should set and get scheduled balance adjustment correctly", async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );

    await Equity.setScheduledBalanceAdjustment(
      new SetScheduledBalanceAdjustmentRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        executionDate: recordTimestamp.toString(),
        factor,
        decimals: decimals.toString(),
      }),
    );

    const scheduledBalanceAdjustment = await Equity.getScheduledBalanceAdjustment(
      new GetScheduledBalanceAdjustmentRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        balanceAdjustmentId: 1,
      }),
    );

    expect(scheduledBalanceAdjustment.id).toEqual(1);
    expect(scheduledBalanceAdjustment.executionDate.getTime() / 1000).toEqual(recordTimestamp);
    expect(scheduledBalanceAdjustment.factor).toEqual(factor);
    expect(scheduledBalanceAdjustment.decimals).toEqual(decimals.toString());

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );
  }, 60_000);

  it("Should return error if try to set a scheduled balance adjust and do not have the role", async () => {
    let thrownError;
    try {
      await Equity.setScheduledBalanceAdjustment(
        new SetScheduledBalanceAdjustmentRequest({
          securityId: equity.evmDiamondAddress!.toString(),
          executionDate: recordTimestamp.toString(),
          factor,
          decimals: decimals.toString(),
        }),
      );
    } catch (error) {
      thrownError = error;
    }
    expect(thrownError).toBeInstanceOf(Error);
  }, 600_000);

  it("Should return error if try to set a scheduled balance adjust and the token is paused", async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._PAUSER_ROLE,
      }),
    );

    await Security.pause(
      new PauseRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );

    let thrownError;
    try {
      await Equity.setScheduledBalanceAdjustment(
        new SetScheduledBalanceAdjustmentRequest({
          securityId: equity.evmDiamondAddress!.toString(),
          executionDate: recordTimestamp.toString(),
          factor,
          decimals: decimals.toString(),
        }),
      );
    } catch (error) {
      thrownError = error;
    }
    expect(thrownError).toBeInstanceOf(Error);

    await Security.unpause(
      new PauseRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );
  }, 600_000);

  it("Should return scheduled balance adjustments count correctly", async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );

    const count = await Equity.getScheduledBalanceAdjustmentsCount(
      new GetScheduledBalanceAdjustmentCountRequest({
        securityId: equity.evmDiamondAddress!.toString(),
      }),
    );

    expect(count).toBeDefined();
    expect(typeof count).toBe("number");

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );
  }, 60_000);

  it("Get All Scheduled Balance Adjustments", async () => {
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );

    const decimals = "2";
    const recordTimestamp = Math.ceil(new Date().getTime() / 1000) + 1000;
    const executionTimestamp = recordTimestamp + 1000;

    await Equity.setScheduledBalanceAdjustment(
      new SetScheduledBalanceAdjustmentRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        executionDate: executionTimestamp.toString(),
        factor,
        decimals,
      }),
    );

    const allScheduledAdjustments = await Equity.getAllScheduledBalanceAdjustments(
      new GetAllScheduledBalanceAdjustmentsRequest({
        securityId: equity.evmDiamondAddress!.toString(),
      }),
    );

    expect(allScheduledAdjustments.length).toEqual(1);
    expect(allScheduledAdjustments[0].factor).toEqual(factor);
    expect(allScheduledAdjustments[0].decimals).toEqual(decimals);
    expect(allScheduledAdjustments[0].executionDate.getTime() / 1000).toEqual(executionTimestamp);

    await Role.revokeRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!.toString(),
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CORPORATEACTIONS_ROLE,
      }),
    );
  }, 60_000);
});
