// SPDX-License-Identifier: Apache-2.0

import "../environmentMock";
import { RPCTransactionAdapter } from "@port/out/rpc/RPCTransactionAdapter";

import TransferRequest from "@port/in/request/security/operations/transfer/TransferRequest";
import RedeemRequest from "@port/in/request/security/operations/redeem/RedeemRequest";
import Injectable from "@core/injectable/Injectable";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import {
  CLIENT_ACCOUNT_ECDSA,
  CLIENT_ACCOUNT_ECDSA_A,
  FACTORY_ADDRESS,
  RESOLVER_ADDRESS,
  CLIENT_EVM_ADDRESS_ECDSA_1_CORRECT,
} from "@test/config";
import NetworkService from "@service/network/NetworkService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { ethers, Wallet } from "ethers";
import SecurityViewModel from "@port/in/response/SecurityViewModel";
import GetSecurityDetailsRequest from "@port/in/request/security/GetSecurityDetailsRequest";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { SecurityControlListType } from "@domain/context/security/SecurityControlListType";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";
import Account from "@domain/context/account/Account";
import { keccak256 } from "js-sha3";
import { _PARTITION_ID_1 } from "@core/Constants";
import createVcT3 from "@test/utils/verifiableCredentials";
import { ClearingOperationType } from "@domain/context/security/Clearing";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import {
  SDK,
  LoggerTransports,
  CreateEquityRequest,
  Equity,
  Role,
  RoleRequest,
  SsiManagement,
  AddIssuerRequest,
  Kyc,
  GrantKycRequest,
  Security,
  SetMaxSupplyRequest,
  GetControlListCountRequest,
  GetControlListMembersRequest,
  ControlListRequest,
  IssueRequest,
  GetAccountBalanceRequest,
  ForceRedeemRequest,
  TransferAndLockRequest,
  GetLockCountRequest,
  GetLocksIdRequest,
  ReleaseRequest,
  ForceTransferRequest,
  PauseRequest,
  GetControlListTypeRequest,
  CreateHoldByPartitionRequest,
  GetHeldAmountForRequest,
  GetHoldCountForByPartitionRequest,
  GetHoldsIdForByPartitionRequest,
  ReleaseHoldByPartitionRequest,
  PartitionsProtectedRequest,
  ProtectedTransferFromByPartitionRequest,
  ProtectedRedeemFromByPartitionRequest,
  ProtectedCreateHoldByPartitionRequest,
  ExecuteHoldByPartitionRequest,
  ActivateClearingRequest,
  DeactivateClearingRequest,
  ClearingCreateHoldByPartitionRequest,
  GetClearedAmountForRequest,
  GetClearingCreateHoldForByPartitionRequest,
  GetClearingCountForByPartitionRequest,
  GetClearingsIdForByPartitionRequest,
  ReclaimClearingOperationByPartitionRequest,
  ClearingRedeemByPartitionRequest,
  GetClearingRedeemForByPartitionRequest,
  CancelClearingOperationByPartitionRequest,
  ClearingTransferByPartitionRequest,
  GetClearingTransferForByPartitionRequest,
  ApproveClearingOperationByPartitionRequest,
  OperatorClearingTransferByPartitionRequest,
  OperatorClearingRedeemByPartitionRequest,
  OperatorClearingCreateHoldByPartitionRequest,
  ProtectedClearingRedeemByPartitionRequest,
  ProtectedClearingTransferByPartitionRequest,
  ProtectedClearingCreateHoldByPartitionRequest,
} from "@port/in";

SDK.log = { level: "ERROR", transports: new LoggerTransports.Console() };

const decimals = 0;
const name = "TEST_SECURITY_TOKEN";
const symbol = "TEST";
const isin = "ABCDE123456Z";
const type = "EQUITY";
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
describe("🧪 Security tests", () => {
  let ns: NetworkService;
  let rpcQueryAdapter: RPCQueryAdapter;
  let equity: SecurityViewModel;

  const url = "http://127.0.0.1:7546";
  const customHttpProvider = new ethers.JsonRpcProvider(url);

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

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._CAP_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._PROTECTED_PARTITION_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._SSI_MANAGER_ROLE,
      }),
    );

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._KYC_ROLE,
      }),
    );

    await SsiManagement.addIssuer(
      new AddIssuerRequest({
        securityId: equity.evmDiamondAddress!,
        issuerId: CLIENT_EVM_ADDRESS_ECDSA_1_CORRECT as string,
      }),
    );

    await Kyc.grantKyc(
      new GrantKycRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        vcBase64: await createVcT3(CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString()),
      }),
    );

    await Kyc.grantKyc(
      new GrantKycRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        vcBase64: await createVcT3(CLIENT_ACCOUNT_ECDSA.evmAddress!.toString()),
      }),
    );

    await Security.setMaxSupply(
      new SetMaxSupplyRequest({
        securityId: equity.evmDiamondAddress!,
        maxSupply: "1000000",
      }),
    );
  }, 900_000);

  afterAll(async () => {
    await SsiManagement.removeIssuer(
      new AddIssuerRequest({
        securityId: equity.evmDiamondAddress!,
        issuerId: CLIENT_EVM_ADDRESS_ECDSA_1_CORRECT as string,
      }),
    );
  });

  it("Get security", async () => {
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
    expect(equityInfo.totalSupply).toEqual("0");
    expect(equityInfo.diamondAddress).toEqual(equity.diamondAddress!.toString());
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

  it("Control List Add & Remove", async () => {
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

  it("Issue and Redeem", async () => {
    const issuedAmount = "10";

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
    ).toEqual("0");
  }, 600_000);

  it("Transfer and Controller Redeem", async () => {
    const issuedAmount = "10";
    const transferredAmount = "1";

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
    ).toEqual("0");

    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual("0");
  }, 600_000);

  it("TransferAndLock and release", async () => {
    const issuedAmount = "10";
    const transferredAndLockedAmount = "2";
    const expirationTimeStamp = "9991976120";

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
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
            amount: transferredAndLockedAmount,
            expirationDate: expirationTimeStamp,
          }),
        )
      ).payload,
    ).toBe(1);

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
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual(transferredAndLockedAmount);

    const lockCount = await Security.getLockCount(
      new GetLockCountRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
      }),
    );

    expect(lockCount).toEqual(1);

    // check locks id
    const locksId = await Security.getLocksId(
      new GetLocksIdRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        start: 0,
        end: 1,
      }),
    );

    expect(locksId.length).toEqual(1);

    expect(locksId[0]).toEqual("1");

    expect(
      (
        await Security.release(
          new ReleaseRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
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
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual("0");

    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
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
        sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
      }),
    );
  }, 600_000);

  it("Force transfer securities", async () => {
    const issueAmount = "100";
    const forceTransferAmount = "50";

    // issue securities in redeemed account
    await Security.issue(
      new IssueRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        amount: issueAmount,
      }),
    );

    // do force transfer
    expect(
      (
        await Security.controllerTransfer(
          new ForceTransferRequest({
            securityId: equity.evmDiamondAddress!,
            sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
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
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
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
        sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
      }),
    );
  }, 600_000);

  it("Pause and UnPause a security", async () => {
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

  it("Get the security control list type", async () => {
    expect(
      await Security.getControlListType(
        new GetControlListTypeRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toBe(SecurityControlListType.BLACKLIST);
  });

  it("Hold balance and Release", async () => {
    const issuedAmount = "10";
    const heldAmount = "2";
    const expirationTimeStamp = "9991976120";

    await Security.issue(
      new IssueRequest({
        amount: issuedAmount,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        securityId: equity.evmDiamondAddress!,
      }),
    );

    expect(
      (
        await Security.createHoldByPartition(
          new CreateHoldByPartitionRequest({
            securityId: equity.evmDiamondAddress!,
            partitionId: _PARTITION_ID_1,
            amount: heldAmount,
            escrowId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            expirationDate: expirationTimeStamp,
          }),
        )
      ).payload,
    ).toBe(1);

    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual((+issuedAmount - +heldAmount).toString());

    expect(
      await Security.getHeldAmountFor(
        new GetHeldAmountForRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        }),
      ),
    ).toEqual(heldAmount);

    const holdCount = await Security.getHoldCountForByPartition(
      new GetHoldCountForByPartitionRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        partitionId: _PARTITION_ID_1,
      }),
    );

    expect(holdCount).toEqual(1);

    // check hold id
    const holdId = await Security.getHoldsIdForByPartition(
      new GetHoldsIdForByPartitionRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        partitionId: _PARTITION_ID_1,
        start: 0,
        end: 1,
      }),
    );

    expect(holdId.length).toEqual(1);

    expect(holdId[0]).toEqual(1);

    expect(
      (
        await Security.releaseHoldByPartition(
          new ReleaseHoldByPartitionRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            holdId: 1,
            partitionId: _PARTITION_ID_1,
            amount: heldAmount,
          }),
        )
      ).payload,
    ).toBe(true);

    expect(
      await Security.getHeldAmountFor(
        new GetHeldAmountForRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        }),
      ),
    ).toEqual("0");

    expect(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual((+issuedAmount).toString());

    await Security.redeem(
      new RedeemRequest({
        securityId: equity.evmDiamondAddress!,
        amount: heldAmount,
      }),
    );

    await Security.controllerRedeem(
      new ForceRedeemRequest({
        securityId: equity.evmDiamondAddress!,
        amount: (+issuedAmount - +heldAmount).toString(),
        sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );
  }, 600_000);

  it("Protect and UnProtect a security", async () => {
    expect(
      (
        await Security.protectPartitions(
          new PartitionsProtectedRequest({
            securityId: equity.evmDiamondAddress!,
          }),
        )
      ).payload,
    ).toBe(true);

    expect(
      await Security.arePartitionsProtected(
        new PartitionsProtectedRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toBe(true);

    await Security.unprotectPartitions(
      new PartitionsProtectedRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );

    expect(
      await Security.arePartitionsProtected(
        new PartitionsProtectedRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      ),
    ).toBe(false);
  }, 120000);

  it("Protected transfer and redeem securities", async () => {
    const issueAmount = "100";
    const protectedTransferAmount = "50";
    const protectedRedeemAmount = "5";
    const partitionBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000001";

    await Security.issue(
      new IssueRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        amount: issueAmount,
      }),
    );

    await Security.protectPartitions(
      new PartitionsProtectedRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );

    const encodedValue = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32"],
      [SecurityRole._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partitionBytes32],
    );
    const hash = keccak256(encodedValue);

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: "0x" + hash,
      }),
    );

    expect(
      (
        await Security.protectedTransferFromByPartition(
          new ProtectedTransferFromByPartitionRequest({
            securityId: equity.evmDiamondAddress!,
            partitionId: partitionBytes32,
            sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            amount: protectedTransferAmount,
            deadline: "9999999999",
            nounce: 1,
            signature: "vvvv",
          }),
        )
      ).payload,
    ).toBe(true);

    expect(
      (
        await Security.protectedRedeemFromByPartition(
          new ProtectedRedeemFromByPartitionRequest({
            securityId: equity.evmDiamondAddress!,
            partitionId: partitionBytes32,
            sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
            amount: protectedRedeemAmount,
            deadline: "9999999999",
            nounce: 2,
            signature: "vvvv",
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
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).value,
    ).toEqual((+issueAmount - +protectedTransferAmount - +protectedRedeemAmount).toString());

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
    ).toEqual((+protectedTransferAmount).toString());

    await Security.unprotectPartitions(
      new PartitionsProtectedRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );
  }, 600_000);

  it("Protected hold securities", async () => {
    const issueAmount = BigInt(100);
    const protectedHoldAmount = BigInt(1);
    const partitionBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000001";

    await Security.protectPartitions(
      new PartitionsProtectedRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );

    const balanceECDSA_A = BigInt(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).value,
    );

    const balanceECDSA = BigInt(
      (
        await Security.getBalanceOf(
          new GetAccountBalanceRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        )
      ).value,
    );

    await Security.issue(
      new IssueRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        amount: issueAmount.toString(),
      }),
    );

    const encodedValue = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32"],
      [SecurityRole._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partitionBytes32],
    );
    const hash = keccak256(encodedValue);

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: "0x" + hash,
      }),
    );

    expect(
      (
        await Security.protectedCreateHoldByPartition(
          new ProtectedCreateHoldByPartitionRequest({
            securityId: equity.evmDiamondAddress!,
            partitionId: partitionBytes32,
            sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            expirationDate: "9999999999",
            amount: protectedHoldAmount.toString(),
            deadline: "9999999999",
            nonce: 3,
            signature: "vvvv",
            escrowId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).payload,
    ).toBe(1);

    expect(
      BigInt(
        (
          await Security.getBalanceOf(
            new GetAccountBalanceRequest({
              securityId: equity.evmDiamondAddress!,
              targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
            }),
          )
        ).value,
      ),
    ).toEqual(balanceECDSA_A + issueAmount - protectedHoldAmount);

    expect(
      (
        await Security.executeHoldByPartition(
          new ExecuteHoldByPartitionRequest({
            securityId: equity.evmDiamondAddress!,
            partitionId: partitionBytes32,
            sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            amount: protectedHoldAmount.toString(),
            holdId: 1,
          }),
        )
      ).payload,
    ).toBe(true);

    expect(
      BigInt(
        (
          await Security.getBalanceOf(
            new GetAccountBalanceRequest({
              securityId: equity.evmDiamondAddress!,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            }),
          )
        ).value,
      ),
    ).toEqual(balanceECDSA + protectedHoldAmount);

    await Security.unprotectPartitions(
      new PartitionsProtectedRequest({
        securityId: equity.evmDiamondAddress!,
      }),
    );

    await Security.controllerRedeem(
      new ForceRedeemRequest({
        securityId: equity.evmDiamondAddress!,
        amount: (balanceECDSA + protectedHoldAmount).toString(),
        sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
      }),
    );
  }, 600_000);

  describe("Clearing tests", () => {
    beforeAll(async () => {
      await Role.grantRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: SecurityRole._CLEARING_ROLE,
        }),
      );

      await Role.grantRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: SecurityRole._CLEARING_VALIDATOR_ROLE,
        }),
      );
    });

    beforeEach(async () => {
      await Security.activateClearing(
        new ActivateClearingRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );
    });

    afterEach(async () => {
      await Security.deactivateClearing(
        new DeactivateClearingRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );
    });

    it("Clearing Create Hold", async () => {
      const issuedAmount = "10";
      const clearedAmount = "2";
      const expirationTimeStamp = "9991976120";
      const date = new Date(Number(BigDecimal.fromString(expirationTimeStamp).toBigInt()) * ONE_THOUSAND);

      await Security.issue(
        new IssueRequest({
          amount: issuedAmount,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          securityId: equity.evmDiamondAddress!,
        }),
      );

      expect(
        (
          await Security.clearingCreateHoldByPartition(
            new ClearingCreateHoldByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              amount: clearedAmount,
              escrowId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              clearingExpirationDate: expirationTimeStamp,
              holdExpirationDate: expirationTimeStamp,
            }),
          )
        ).payload,
      ).toBe(1);

      expect(
        (
          await Security.getBalanceOf(
            new GetAccountBalanceRequest({
              securityId: equity.evmDiamondAddress!,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            }),
          )
        ).value,
      ).toEqual((+issuedAmount - +clearedAmount).toString());

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(+clearedAmount);

      const clearing = await Security.getClearingCreateHoldForByPartition(
        new GetClearingCreateHoldForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingId: 1,
        }),
      );

      expect(clearing.id).toEqual(1);
      expect(clearing.amount).toEqual(clearedAmount);
      expect(clearing.expirationDate).toEqual(date);
      expect(clearing.data).toEqual("0x");
      expect(clearing.operatorData).toEqual("0x");
      expect(clearing.holdEscrowId).toEqual(CLIENT_ACCOUNT_ECDSA_A.id!.toString());
      expect(clearing.holdExpirationDate).toEqual(date);
      expect(clearing.holdTo).toEqual(CLIENT_ACCOUNT_ECDSA.id!.toString());
      expect(clearing.holdData).toEqual("0x");

      const clearingHoldCount = await Security.getClearingCountForByPartition(
        new GetClearingCountForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingOperationType: ClearingOperationType.HoldCreation,
        }),
      );

      expect(clearingHoldCount).toEqual(1);

      const clearingId = await Security.getClearingsIdForByPartition(
        new GetClearingsIdForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingOperationType: ClearingOperationType.HoldCreation,
          start: 0,
          end: 1,
        }),
      );

      expect(clearingId.length).toEqual(1);

      expect(clearingId[0]).toEqual(1);

      expect(
        (
          await Security.reclaimClearingOperationByPartition(
            new ReclaimClearingOperationByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              clearingId: 1,
              clearingOperationType: ClearingOperationType.Redeem,
            }),
          )
        ).payload,
      ).toBe(true);

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(0);

      await Security.deactivateClearing(
        new DeactivateClearingRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      await Security.controllerRedeem(
        new ForceRedeemRequest({
          securityId: equity.evmDiamondAddress!,
          amount: (+issuedAmount).toString(),
          sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        }),
      );
    }, 600_000);

    it("Clearing Create Redeem", async () => {
      const issuedAmount = "10";
      const clearedAmount = "2";
      const expirationTimeStamp = "9991976120";
      const date = new Date(Number(BigDecimal.fromString(expirationTimeStamp).toBigInt()) * ONE_THOUSAND);

      await Security.issue(
        new IssueRequest({
          amount: issuedAmount,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          securityId: equity.evmDiamondAddress!,
        }),
      );

      expect(
        (
          await Security.clearingRedeemByPartition(
            new ClearingRedeemByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              amount: clearedAmount,
              expirationDate: expirationTimeStamp,
            }),
          )
        ).payload,
      ).toBe(1);

      expect(
        (
          await Security.getBalanceOf(
            new GetAccountBalanceRequest({
              securityId: equity.evmDiamondAddress!,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            }),
          )
        ).value,
      ).toEqual((+issuedAmount - +clearedAmount).toString());

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(+clearedAmount);

      const clearing = await Security.getClearingRedeemForByPartition(
        new GetClearingRedeemForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingId: 1,
        }),
      );

      expect(clearing.id).toEqual(1);
      expect(clearing.amount).toEqual(clearedAmount);
      expect(clearing.expirationDate).toEqual(date);
      expect(clearing.data).toEqual("0x");
      expect(clearing.operatorData).toEqual("0x");

      const clearingRedeemCount = await Security.getClearingCountForByPartition(
        new GetClearingCountForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingOperationType: ClearingOperationType.Redeem,
        }),
      );

      expect(clearingRedeemCount).toEqual(1);

      const clearingId = await Security.getClearingsIdForByPartition(
        new GetClearingsIdForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingOperationType: ClearingOperationType.Redeem,
          start: 0,
          end: 1,
        }),
      );

      expect(clearingId.length).toEqual(1);

      expect(clearingId[0]).toEqual(1);

      expect(
        (
          await Security.cancelClearingOperationByPartition(
            new CancelClearingOperationByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              clearingId: 1,
              clearingOperationType: ClearingOperationType.Redeem,
            }),
          )
        ).payload,
      ).toBe(true);

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(0);

      await Security.deactivateClearing(
        new DeactivateClearingRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      await Security.controllerRedeem(
        new ForceRedeemRequest({
          securityId: equity.evmDiamondAddress!,
          amount: (+issuedAmount).toString(),
          sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        }),
      );
    }, 600_000);

    it("Clearing Create Transfer", async () => {
      const issuedAmount = "10";
      const clearedAmount = "2";
      const expirationTimeStamp = "9991976120";
      const date = new Date(Number(BigDecimal.fromString(expirationTimeStamp).toBigInt()) * ONE_THOUSAND);

      await Security.issue(
        new IssueRequest({
          amount: issuedAmount,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          securityId: equity.evmDiamondAddress!,
        }),
      );

      expect(
        (
          await Security.clearingTransferByPartition(
            new ClearingTransferByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              amount: clearedAmount,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              expirationDate: expirationTimeStamp,
            }),
          )
        ).payload,
      ).toBe(1);

      expect(
        (
          await Security.getBalanceOf(
            new GetAccountBalanceRequest({
              securityId: equity.evmDiamondAddress!,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            }),
          )
        ).value,
      ).toEqual((+issuedAmount - +clearedAmount).toString());

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(+clearedAmount);

      const clearing = await Security.getClearingTransferForByPartition(
        new GetClearingTransferForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingId: 1,
        }),
      );

      expect(clearing.id).toEqual(1);
      expect(clearing.amount).toEqual(clearedAmount);
      expect(clearing.expirationDate).toEqual(date);
      expect(clearing.destination).toEqual(CLIENT_ACCOUNT_ECDSA.id!.toString());
      expect(clearing.data).toEqual("0x");
      expect(clearing.operatorData).toEqual("0x");

      const clearingTransferCount = await Security.getClearingCountForByPartition(
        new GetClearingCountForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingOperationType: ClearingOperationType.Transfer,
        }),
      );

      expect(clearingTransferCount).toEqual(1);

      const clearingId = await Security.getClearingsIdForByPartition(
        new GetClearingsIdForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingOperationType: ClearingOperationType.Transfer,
          start: 0,
          end: 1,
        }),
      );

      expect(clearingId.length).toEqual(1);
      expect(clearingId[0]).toEqual(1);

      expect(
        (
          await Security.approveClearingOperationByPartition(
            new ApproveClearingOperationByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              clearingId: 1,
              clearingOperationType: ClearingOperationType.Transfer,
            }),
          )
        ).payload,
      ).toBe(true);

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(0);

      await Security.deactivateClearing(
        new DeactivateClearingRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      await Security.controllerRedeem(
        new ForceRedeemRequest({
          securityId: equity.evmDiamondAddress!,
          amount: (+issuedAmount).toString(),
          sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        }),
      );
    }, 600_000);

    it("Operator clearing Create Transfer", async () => {
      const issuedAmount = "10";
      const clearedAmount = "2";
      const expirationTimeStamp = "9991976120";

      await Security.issue(
        new IssueRequest({
          amount: issuedAmount,
          targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          securityId: equity.evmDiamondAddress!,
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
        (
          await Security.operatorClearingTransferByPartition(
            new OperatorClearingTransferByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              amount: clearedAmount,
              sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              expirationDate: expirationTimeStamp,
            }),
          )
        ).payload,
      ).toBe(1);

      expect(
        (
          await Security.getBalanceOf(
            new GetAccountBalanceRequest({
              securityId: equity.evmDiamondAddress!,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            }),
          )
        ).value,
      ).toEqual((+issuedAmount - +clearedAmount).toString());

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(+clearedAmount);

      const clearingTransferCount = await Security.getClearingCountForByPartition(
        new GetClearingCountForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingOperationType: ClearingOperationType.Transfer,
        }),
      );

      expect(clearingTransferCount).toEqual(1);

      const clearingId = await Security.getClearingsIdForByPartition(
        new GetClearingsIdForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingOperationType: ClearingOperationType.Transfer,
          start: 0,
          end: 1,
        }),
      );

      expect(clearingId.length).toEqual(1);
      expect(clearingId[0]).toEqual(1);

      expect(
        (
          await Security.cancelClearingOperationByPartition(
            new CancelClearingOperationByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              clearingId: 1,
              clearingOperationType: ClearingOperationType.Redeem,
            }),
          )
        ).payload,
      ).toBe(true);

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(0);

      await Security.deactivateClearing(
        new DeactivateClearingRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      await Security.controllerRedeem(
        new ForceRedeemRequest({
          securityId: equity.evmDiamondAddress!,
          amount: (+issuedAmount).toString(),
          sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        }),
      );
    }, 600_000);

    it("Operator Clearing Create Redeem", async () => {
      const issuedAmount = "10";
      const clearedAmount = "2";
      const expirationTimeStamp = "9991976120";

      await Security.issue(
        new IssueRequest({
          amount: issuedAmount,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          securityId: equity.evmDiamondAddress!,
        }),
      );

      expect(
        (
          await Security.operatorClearingRedeemByPartition(
            new OperatorClearingRedeemByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              amount: clearedAmount,
              expirationDate: expirationTimeStamp,
            }),
          )
        ).payload,
      ).toBe(1);

      expect(
        (
          await Security.getBalanceOf(
            new GetAccountBalanceRequest({
              securityId: equity.evmDiamondAddress!,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            }),
          )
        ).value,
      ).toEqual((+issuedAmount - +clearedAmount).toString());

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(+clearedAmount);

      const clearingRedeemCount = await Security.getClearingCountForByPartition(
        new GetClearingCountForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingOperationType: ClearingOperationType.Redeem,
        }),
      );

      expect(clearingRedeemCount).toEqual(1);

      const clearingId = await Security.getClearingsIdForByPartition(
        new GetClearingsIdForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingOperationType: ClearingOperationType.Redeem,
          start: 0,
          end: 1,
        }),
      );

      expect(clearingId.length).toEqual(1);

      expect(clearingId[0]).toEqual(1);

      expect(
        (
          await Security.cancelClearingOperationByPartition(
            new CancelClearingOperationByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              clearingId: 1,
              clearingOperationType: ClearingOperationType.Redeem,
            }),
          )
        ).payload,
      ).toBe(true);

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(0);

      await Security.deactivateClearing(
        new DeactivateClearingRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      await Security.controllerRedeem(
        new ForceRedeemRequest({
          securityId: equity.evmDiamondAddress!,
          amount: (+issuedAmount).toString(),
          sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        }),
      );
    }, 600_000);

    it("Operator Clearing Create Hold", async () => {
      const issuedAmount = "10";
      const clearedAmount = "2";
      const expirationTimeStamp = "9991976120";

      await Security.issue(
        new IssueRequest({
          amount: issuedAmount,
          targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          securityId: equity.evmDiamondAddress!,
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
        (
          await Security.operatorClearingCreateHoldByPartition(
            new OperatorClearingCreateHoldByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              amount: clearedAmount,
              sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
              escrowId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              clearingExpirationDate: expirationTimeStamp,
              holdExpirationDate: expirationTimeStamp,
            }),
          )
        ).payload,
      ).toBe(1);

      expect(
        (
          await Security.getBalanceOf(
            new GetAccountBalanceRequest({
              securityId: equity.evmDiamondAddress!,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            }),
          )
        ).value,
      ).toEqual((+issuedAmount - +clearedAmount).toString());

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(+clearedAmount);

      const clearingHoldCount = await Security.getClearingCountForByPartition(
        new GetClearingCountForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingOperationType: ClearingOperationType.HoldCreation,
        }),
      );

      expect(clearingHoldCount).toEqual(1);

      const clearingId = await Security.getClearingsIdForByPartition(
        new GetClearingsIdForByPartitionRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          partitionId: _PARTITION_ID_1,
          clearingOperationType: ClearingOperationType.HoldCreation,
          start: 0,
          end: 1,
        }),
      );

      expect(clearingId.length).toEqual(1);

      expect(clearingId[0]).toEqual(1);

      expect(
        (
          await Security.reclaimClearingOperationByPartition(
            new ReclaimClearingOperationByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              clearingId: 1,
              clearingOperationType: ClearingOperationType.Redeem,
            }),
          )
        ).payload,
      ).toBe(true);

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(0);

      await Security.deactivateClearing(
        new DeactivateClearingRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      await Security.controllerRedeem(
        new ForceRedeemRequest({
          securityId: equity.evmDiamondAddress!,
          amount: (+issuedAmount).toString(),
          sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        }),
      );
      await Security.controllerRedeem(
        new ForceRedeemRequest({
          securityId: equity.evmDiamondAddress!,
          amount: (+issuedAmount).toString(),
          sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        }),
      );
      await Security.controllerRedeem(
        new ForceRedeemRequest({
          securityId: equity.evmDiamondAddress!,
          amount: (+issuedAmount).toString(),
          sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        }),
      );
    }, 600_000);

    it("Protected Clearing Hold securities", async () => {
      const issueAmount = BigInt(100);
      const protectedClearingAmount = BigInt(1);
      const partitionBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000001";

      await Security.protectPartitions(
        new PartitionsProtectedRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      const balanceECDSA_A = BigInt(
        (
          await Security.getBalanceOf(
            new GetAccountBalanceRequest({
              securityId: equity.evmDiamondAddress!,
              targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
            }),
          )
        ).value,
      );

      await Security.issue(
        new IssueRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          amount: issueAmount.toString(),
        }),
      );

      const encodedValue = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes32"],
        [SecurityRole._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partitionBytes32],
      );
      const hash = keccak256(encodedValue);

      await Role.grantRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: "0x" + hash,
        }),
      );

      expect(
        (
          await Security.protectedClearingCreateHoldByPartition(
            new ProtectedClearingCreateHoldByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: partitionBytes32,
              sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              holdExpirationDate: "9999999999",
              clearingExpirationDate: "9999999999",
              amount: protectedClearingAmount.toString(),
              deadline: "9999999999",
              nonce: 3,
              signature: "vvvv",
              escrowId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
            }),
          )
        ).payload,
      ).toBe(1);

      expect(
        BigInt(
          (
            await Security.getBalanceOf(
              new GetAccountBalanceRequest({
                securityId: equity.evmDiamondAddress!,
                targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
              }),
            )
          ).value,
        ),
      ).toEqual(balanceECDSA_A + issueAmount - protectedClearingAmount);

      expect(
        (
          await Security.cancelClearingOperationByPartition(
            new CancelClearingOperationByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
              clearingId: 1,
              clearingOperationType: ClearingOperationType.Redeem,
            }),
          )
        ).payload,
      ).toBe(true);

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        ),
      ).toEqual(0);

      await Security.unprotectPartitions(
        new PartitionsProtectedRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      await Security.deactivateClearing(
        new DeactivateClearingRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      await Security.controllerRedeem(
        new ForceRedeemRequest({
          securityId: equity.evmDiamondAddress!,
          amount: issueAmount.toString(),
          sourceId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        }),
      );
    }, 600_000);

    it("Protected Clearing Redeem securities", async () => {
      const issueAmount = BigInt(100);
      const protectedClearingAmount = BigInt(1);
      const partitionBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000001";

      await Security.protectPartitions(
        new PartitionsProtectedRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      const balanceECDSA = BigInt(
        (
          await Security.getBalanceOf(
            new GetAccountBalanceRequest({
              securityId: equity.evmDiamondAddress!,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            }),
          )
        ).value,
      );

      await Security.issue(
        new IssueRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          amount: issueAmount.toString(),
        }),
      );

      const encodedValue = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes32"],
        [SecurityRole._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partitionBytes32],
      );
      const hash = keccak256(encodedValue);

      await Role.grantRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: "0x" + hash,
        }),
      );

      expect(
        (
          await Security.protectedClearingRedeemByPartition(
            new ProtectedClearingRedeemByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: partitionBytes32,
              sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              expirationDate: "9999999999",
              amount: protectedClearingAmount.toString(),
              deadline: "9999999999",
              nonce: 3,
              signature: "vvvv",
            }),
          )
        ).payload,
      ).toBe(1);

      expect(
        BigInt(
          (
            await Security.getBalanceOf(
              new GetAccountBalanceRequest({
                securityId: equity.evmDiamondAddress!,
                targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              }),
            )
          ).value,
        ),
      ).toEqual(balanceECDSA + issueAmount - protectedClearingAmount);

      expect(
        (
          await Security.cancelClearingOperationByPartition(
            new CancelClearingOperationByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              clearingId: 1,
              clearingOperationType: ClearingOperationType.Redeem,
            }),
          )
        ).payload,
      ).toBe(true);

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(0);

      await Security.unprotectPartitions(
        new PartitionsProtectedRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      await Security.deactivateClearing(
        new DeactivateClearingRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      await Security.controllerRedeem(
        new ForceRedeemRequest({
          securityId: equity.evmDiamondAddress!,
          amount: issueAmount.toString(),
          sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        }),
      );
    }, 600_000);
    it("Protected Clearing Transfer securities", async () => {
      const issueAmount = BigInt(100);
      const protectedClearingAmount = BigInt(1);
      const partitionBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000001";

      await Security.protectPartitions(
        new PartitionsProtectedRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      const balanceECDSA = BigInt(
        (
          await Security.getBalanceOf(
            new GetAccountBalanceRequest({
              securityId: equity.evmDiamondAddress!,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
            }),
          )
        ).value,
      );

      await Security.issue(
        new IssueRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          amount: issueAmount.toString(),
        }),
      );

      const encodedValue = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes32"],
        [SecurityRole._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partitionBytes32],
      );
      const hash = keccak256(encodedValue);

      await Role.grantRole(
        new RoleRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          role: "0x" + hash,
        }),
      );

      expect(
        (
          await Security.protectedClearingTransferByPartition(
            new ProtectedClearingTransferByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: partitionBytes32,
              sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
              expirationDate: "9999999999",
              amount: protectedClearingAmount.toString(),
              deadline: "9999999999",
              nonce: 3,
              signature: "vvvv",
            }),
          )
        ).payload,
      ).toBe(1);

      expect(
        BigInt(
          (
            await Security.getBalanceOf(
              new GetAccountBalanceRequest({
                securityId: equity.evmDiamondAddress!,
                targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              }),
            )
          ).value,
        ),
      ).toEqual(balanceECDSA + issueAmount - protectedClearingAmount);

      expect(
        (
          await Security.cancelClearingOperationByPartition(
            new CancelClearingOperationByPartitionRequest({
              securityId: equity.evmDiamondAddress!,
              partitionId: _PARTITION_ID_1,
              targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
              clearingId: 1,
              clearingOperationType: ClearingOperationType.Redeem,
            }),
          )
        ).payload,
      ).toBe(true);

      expect(
        await Security.getClearedAmountFor(
          new GetClearedAmountForRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
          }),
        ),
      ).toEqual(0);

      await Security.unprotectPartitions(
        new PartitionsProtectedRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      await Security.deactivateClearing(
        new DeactivateClearingRequest({
          securityId: equity.evmDiamondAddress!,
        }),
      );

      await Security.controllerRedeem(
        new ForceRedeemRequest({
          securityId: equity.evmDiamondAddress!,
          amount: issueAmount.toString(),
          sourceId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        }),
      );
    }, 600_000);
  });
});
