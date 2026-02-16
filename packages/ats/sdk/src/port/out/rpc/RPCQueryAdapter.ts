// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ethers } from "ethers";
import { singleton } from "tsyringe";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import NetworkService from "@service/network/NetworkService";
import LogService from "@service/log/LogService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { MirrorNodeAdapter } from "../mirror/MirrorNodeAdapter";
import { Security } from "@domain/context/security/Security";
import { BondDetails } from "@domain/context/bond/BondDetails";
import { Dividend } from "@domain/context/equity/Dividend";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { HederaId } from "@domain/context/shared/HederaId";
import {
  AccessControlFacet__factory,
  BondRead__factory,
  CapFacet__factory,
  ClearingActionsFacet__factory,
  ClearingHoldCreationFacet__factory,
  ClearingReadFacet__factory,
  ClearingRedeemFacet__factory,
  ClearingTransferFacet__factory,
  ControlListFacet__factory,
  DiamondFacet__factory,
  Equity__factory,
  ERC1410ReadFacet__factory,
  ERC20Votes__factory,
  ERC1594Facet__factory,
  ERC1643Facet__factory,
  ERC1644Facet__factory,
  ERC20Facet__factory,
  ExternalControlListManagementFacet__factory,
  ExternalKycListManagementFacet__factory,
  ExternalPauseManagementFacet__factory,
  Factory__factory,
  FixedRate__factory,
  FreezeFacet__factory,
  HoldReadFacet__factory,
  KycFacet__factory,
  LockFacet__factory,
  MockedBlacklist__factory,
  MockedExternalKycList__factory,
  MockedExternalPause__factory,
  MockedWhitelist__factory,
  PauseFacet__factory,
  ProtectedPartitionsFacet__factory,
  ScheduledSnapshotsFacet__factory,
  Security__factory,
  SnapshotsFacet__factory,
  SsiManagementFacet__factory,
  ERC3643ReadFacet__factory,
  TREXFactoryAts__factory,
  ProceedRecipientsFacet__factory,
  CorporateActionsFacet__factory,
  NoncesFacet__factory,
  Kpis__factory, KpiLinkedRate__factory,
  ScheduledCouponListingFacet__factory
} from "@hashgraph/asset-tokenization-contracts";
import { ScheduledSnapshot } from "@domain/context/security/ScheduledSnapshot";
import { VotingRights } from "@domain/context/equity/VotingRights";
import { Coupon } from "@domain/context/bond/Coupon";
import { EquityDetails } from "@domain/context/equity/EquityDetails";
import { CastDividendType } from "@domain/context/equity/DividendType";
import { CastSecurityType } from "@domain/context/factory/SecurityType";
import { Regulation } from "@domain/context/factory/Regulation";
import { _PARTITION_ID_1 } from "@core/Constants";
import {
  CastAccreditedInvestors,
  CastInternationalInvestorscation,
  CastManualInvestorVerification,
  CastRegulationSubType,
  CastRegulationType,
  CastResaleHoldPeriodorscation,
} from "@domain/context/factory/RegulationType";
import { ScheduledBalanceAdjustment } from "@domain/context/equity/ScheduledBalanceAdjustment";
import { DividendFor } from "@domain/context/equity/DividendFor";
import { VotingFor } from "@domain/context/equity/VotingFor";
import { Kyc } from "@domain/context/kyc/Kyc";
import { KycAccountData } from "@domain/context/kyc/KycAccountData";
import {
  CastClearingOperationType,
  ClearingHoldCreation,
  ClearingOperationType,
  ClearingRedeem,
  ClearingTransfer,
} from "@domain/context/security/Clearing";
import { HoldDetails } from "@domain/context/security/Hold";
import { CouponAmountFor } from "@domain/context/bond/CouponAmountFor";
import { PrincipalFor } from "@domain/context/bond/PrincipalFor";
import { DividendAmountFor } from "@domain/context/equity/DividendAmountFor";
import { CastRateStatus } from "@domain/context/bond/RateStatus";
import { CouponFor } from "@domain/context/bond/CouponFor";

const LOCAL_JSON_RPC_RELAY_URL = "http://127.0.0.1:7546/api";

type StaticConnect = { connect: (...args: any[]) => any };

type FactoryContract<T extends StaticConnect> = T["connect"] extends (...args: any[]) => infer K ? K : never;

@singleton()
export class RPCQueryAdapter {
  provider: ethers.JsonRpcProvider;

  constructor(
    @lazyInject(NetworkService)
    private readonly networkService: NetworkService,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNode: MirrorNodeAdapter,
  ) {}

  async init(urlRpcProvider?: string, apiKey?: string): Promise<string> {
    const url = urlRpcProvider ? (apiKey ? urlRpcProvider + apiKey : urlRpcProvider) : LOCAL_JSON_RPC_RELAY_URL;
    this.provider = new ethers.JsonRpcProvider(url);
    LogService.logTrace("RPC Query Adapter Initialized on: ", url);

    return this.networkService.environment;
  }

  connect<T extends StaticConnect>(fac: T, address: string): FactoryContract<T> {
    return fac.connect(address, this.provider);
  }

  async balanceOf(address: EvmAddress, target: EvmAddress): Promise<bigint> {
    LogService.logTrace(`Getting balance of ${address.toString()} security for the account ${target.toString()}`);

    return await this.connect(ERC1410ReadFacet__factory, address.toString()).balanceOf(target.toString());
  }

  async balanceOfByPartition(address: EvmAddress, target: EvmAddress, partitionId: string): Promise<bigint> {
    LogService.logTrace(
      `Getting balance of ${address.toString()} security for partition ${partitionId} for the account ${target.toString()}`,
    );

    return await this.connect(ERC1410ReadFacet__factory, address.toString()).balanceOfByPartition(
      partitionId,
      target.toString(),
    );
  }

  async balanceOfAtSnapshot(address: EvmAddress, target: EvmAddress, snapshotId: number): Promise<bigint> {
    LogService.logTrace(
      `Getting balance of ${address.toString()} security at snapshot ${snapshotId.toString()} for the account ${target.toString()}`,
    );

    return await this.connect(SnapshotsFacet__factory, address.toString()).balanceOfAtSnapshot(
      snapshotId,
      target.toString(),
    );
  }

  async balanceOfAtSnapshotByPartition(
    address: EvmAddress,
    target: EvmAddress,
    partitionId: string,
    snapshotId: number,
  ): Promise<bigint> {
    LogService.logTrace(
      `Getting balance of ${address.toString()} security for partition ${partitionId} at snapshot ${snapshotId.toString()} for the account ${target.toString()}`,
    );

    return await this.connect(SnapshotsFacet__factory, address.toString()).balanceOfAtSnapshotByPartition(
      partitionId,
      snapshotId,
      target.toString(),
    );
  }

  async getNonceFor(address: EvmAddress, target: EvmAddress): Promise<bigint> {
    LogService.logTrace(`Getting Nounce`);

    return await this.connect(NoncesFacet__factory, address.toString()).nonces(target.toString());
  }

  async partitionsOf(address: EvmAddress, targetId: EvmAddress): Promise<string[]> {
    LogService.logTrace(`Getting partitions for account ${targetId.toString()}`);

    return await this.connect(ERC1410ReadFacet__factory, address.toString()).partitionsOf(targetId.toString());
  }

  async partitionsOfAtSnapshot(address: EvmAddress, targetId: EvmAddress, snapshotId: number): Promise<string[]> {
    LogService.logTrace(`Getting partitions for account ${targetId.toString()} at snapshot ${snapshotId.toString()}`);

    return await this.connect(SnapshotsFacet__factory, address.toString()).partitionsOfAtSnapshot(
      snapshotId,
      targetId.toString(),
    );
  }

  async totalSupply(address: EvmAddress): Promise<bigint> {
    LogService.logTrace(`Getting total supply of ${address.toString()} security`);

    return await this.connect(ERC1410ReadFacet__factory, address.toString()).totalSupply();
  }

  async totalSupplyAtSnapshot(address: EvmAddress, snapshotId: number): Promise<bigint> {
    LogService.logTrace(`Getting total supply of ${address.toString()} security at snapshot ${snapshotId.toString()}`);

    return await this.connect(SnapshotsFacet__factory, address.toString()).totalSupplyAtSnapshot(snapshotId);
  }

  async getRolesFor(address: EvmAddress, target: EvmAddress, start: number, end: number): Promise<string[]> {
    LogService.logTrace(`Getting roles for ${target.toString()} from ${start} to ${end}`);

    return await this.connect(AccessControlFacet__factory, address.toString()).getRolesFor(
      target.toString(),
      start,
      end,
    );
  }

  async getRoleMembers(address: EvmAddress, role: string, start: number, end: number): Promise<string[]> {
    LogService.logTrace(`Getting roles members for role ${role} from ${start} to ${end}`);

    return await this.connect(AccessControlFacet__factory, address.toString()).getRoleMembers(role, start, end);
  }

  async getRoleCountFor(address: EvmAddress, target: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting role count for ${target.toString()}`);

    const roleCount = await this.connect(AccessControlFacet__factory, address.toString()).getRoleCountFor(
      target.toString(),
    );

    return Number(roleCount);
  }

  async getRoleMemberCount(address: EvmAddress, role: string): Promise<number> {
    LogService.logTrace(`Getting role member count for ${role}`);

    const membersCount = await this.connect(AccessControlFacet__factory, address.toString()).getRoleMemberCount(role);

    return Number(membersCount);
  }

  async hasRole(address: EvmAddress, target: EvmAddress, role: string): Promise<boolean> {
    LogService.logTrace(`Getting if the account ${target.toString()} has the role ${address.toString()}`);

    return await this.connect(AccessControlFacet__factory, address.toString()).hasRole(role, target.toString());
  }

  async getSecurity(address: EvmAddress): Promise<Security> {
    LogService.logTrace(`Requesting security details for security: ${address.toString()}`);

    const erc20Metadata = await this.connect(ERC20Facet__factory, address.toString()).getERC20Metadata();
    const totalSupply = await this.connect(ERC1410ReadFacet__factory, address.toString()).totalSupply();
    const maxSupply = await this.connect(CapFacet__factory, address.toString()).getMaxSupply();
    const isWhiteList = await this.connect(ControlListFacet__factory, address.toString()).getControlListType();
    const erc20VotesActivated = await this.connect(ERC20Votes__factory, address.toString()).isActivated();
    const isControllable = await this.connect(ERC1644Facet__factory, address.toString()).isControllable();
    const arePartitionsProtected = await this.connect(
      ProtectedPartitionsFacet__factory,
      address.toString(),
    ).arePartitionsProtected();
    const clearingActive = await this.connect(ClearingActionsFacet__factory, address.toString()).isClearingActivated();
    const internalKycActivated = await this.connect(KycFacet__factory, address.toString()).isInternalKycActivated();
    const isMultiPartition = await this.connect(ERC1410ReadFacet__factory, address.toString()).isMultiPartition();
    const isIssuable = await this.connect(ERC1594Facet__factory, address.toString()).isIssuable();
    const isPaused = await this.connect(PauseFacet__factory, address.toString()).isPaused();
    const regulationInfo = await this.connect(Security__factory, address.toString()).getSecurityRegulationData();
    const diamondAddress = await this.mirrorNode.getHederaIdfromContractAddress(address.toString());
    const regulation: Regulation = {
      type: CastRegulationType.fromBigint(regulationInfo.regulationData.regulationType),
      subType: CastRegulationSubType.fromBigint(regulationInfo.regulationData.regulationSubType),
      dealSize: regulationInfo.regulationData.dealSize.toString(),
      accreditedInvestors: CastAccreditedInvestors.fromBigint(regulationInfo.regulationData.accreditedInvestors),
      maxNonAccreditedInvestors: Number(regulationInfo.regulationData.maxNonAccreditedInvestors),
      manualInvestorVerification: CastManualInvestorVerification.fromBigint(
        regulationInfo.regulationData.manualInvestorVerification,
      ),
      internationalInvestors: CastInternationalInvestorscation.fromBigint(
        regulationInfo.regulationData.internationalInvestors,
      ),
      resaleHoldPeriod: CastResaleHoldPeriodorscation.fromBigint(regulationInfo.regulationData.resaleHoldPeriod),
    };

    return new Security({
      name: erc20Metadata.info.name,
      symbol: erc20Metadata.info.symbol,
      isin: erc20Metadata.info.isin,
      type: CastSecurityType.fromBigint(erc20Metadata.securityType),
      decimals: Number(erc20Metadata.info.decimals),
      isWhiteList: isWhiteList,
      erc20VotesActivated: erc20VotesActivated,
      isControllable: isControllable,
      arePartitionsProtected: arePartitionsProtected,
      clearingActive: clearingActive,
      internalKycActivated: internalKycActivated,
      isMultiPartition: isMultiPartition,
      isIssuable: isIssuable,
      totalSupply: new BigDecimal(totalSupply.toString()),
      maxSupply: new BigDecimal(maxSupply.toString()),
      diamondAddress: HederaId.from(diamondAddress),
      evmDiamondAddress: address,
      paused: isPaused,
      regulationType: CastRegulationType.fromBigint(regulationInfo.regulationData.regulationType),
      regulationsubType: CastRegulationSubType.fromBigint(regulationInfo.regulationData.regulationSubType),
      regulation: regulation,
      isCountryControlListWhiteList: regulationInfo.additionalSecurityData.countriesControlListType,
      countries: regulationInfo.additionalSecurityData.listOfCountries,
      info: regulationInfo.additionalSecurityData.info,
    });
  }

  async getEquityDetails(address: EvmAddress): Promise<EquityDetails> {
    LogService.logTrace(`Requesting equity details for equity: ${address.toString()}`);

    const res = await this.connect(Equity__factory, address.toString()).getEquityDetails();

    return new EquityDetails(
      res.votingRight,
      res.informationRight,
      res.liquidationRight,
      res.subscriptionRight,
      res.conversionRight,
      res.redemptionRight,
      res.putRight,
      CastDividendType.fromBigint(res.dividendRight),
      res.currency,
      new BigDecimal(res.nominalValue.toString()),
      Number(res.nominalValueDecimals),
    );
  }

  async getBondDetails(address: EvmAddress): Promise<BondDetails> {
    LogService.logTrace(`Requesting bond details for bond: ${address.toString()}`);

    const res = await this.connect(BondRead__factory, address.toString()).getBondDetails();

    return new BondDetails(
      res.currency,
      new BigDecimal(res.nominalValue.toString()),
      Number(res.nominalValueDecimals),
      Number(res.startingDate),
      Number(res.maturityDate),
    );
  }

  async getControlListMembers(address: EvmAddress, start: number, end: number): Promise<string[]> {
    LogService.logTrace(`Getting control list members from ${start} to ${end}`);

    return await this.connect(ControlListFacet__factory, address.toString()).getControlListMembers(start, end);
  }

  async getControlListCount(address: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting control list count`);

    const controlListCount = await this.connect(ControlListFacet__factory, address.toString()).getControlListCount();

    return Number(controlListCount);
  }

  async getControlListType(address: EvmAddress): Promise<boolean> {
    LogService.logTrace(`Getting control list type`);

    return await this.connect(ControlListFacet__factory, address.toString()).getControlListType();
  }

  async isAccountInControlList(address: EvmAddress, target: EvmAddress): Promise<boolean> {
    LogService.logTrace(`Getting if account ${target.toString()} is in control list`);

    return await this.connect(ControlListFacet__factory, address.toString()).isInControlList(target.toString());
  }

  async getDividendsFor(address: EvmAddress, target: EvmAddress, dividend: number): Promise<DividendFor> {
    LogService.logTrace(`Getting dividends for`);

    const dividendFor = await this.connect(Equity__factory, address.toString()).getDividendsFor(
      dividend,
      target.toString(),
    );

    return new DividendFor(new BigDecimal(dividendFor.tokenBalance), Number(dividendFor.decimals));
  }

  async getDividendAmountFor(address: EvmAddress, target: EvmAddress, dividend: number): Promise<DividendAmountFor> {
    LogService.logTrace(`Getting dividends amount for`);

    const dividendAmountFor = await this.connect(Equity__factory, address.toString()).getDividendAmountFor(
      dividend,
      target.toString(),
    );

    return new DividendAmountFor(
      dividendAmountFor.numerator.toString(),
      dividendAmountFor.denominator.toString(),
      dividendAmountFor.recordDateReached,
    );
  }

  async getDividends(address: EvmAddress, dividend: number): Promise<Dividend> {
    LogService.logTrace(`Getting dividends`);

    const dividendInfo = await this.connect(Equity__factory, address.toString()).getDividends(dividend);

    return new Dividend(
      new BigDecimal(dividendInfo.dividend.amount.toString()),
      Number(dividendInfo.dividend.amountDecimals),
      Number(dividendInfo.dividend.recordDate),
      Number(dividendInfo.dividend.executionDate),
      Number(dividendInfo.snapshotId),
    );
  }

  async getDividendsCount(address: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting dividends count`);

    const dividendsCount = await this.connect(Equity__factory, address.toString()).getDividendsCount();

    return Number(dividendsCount);
  }

  async getVotingFor(address: EvmAddress, target: EvmAddress, voting: number): Promise<VotingFor> {
    LogService.logTrace(`Getting voting for`);

    const votingFor = await this.connect(Equity__factory, address.toString()).getVotingFor(voting, target.toString());

    return new VotingFor(new BigDecimal(votingFor.tokenBalance), Number(votingFor.decimals));
  }

  async getVoting(address: EvmAddress, voting: number): Promise<VotingRights> {
    LogService.logTrace(`Getting voting`);

    const votingInfo = await this.connect(Equity__factory, address.toString()).getVoting(voting);

    return new VotingRights(
      Number(votingInfo.voting.recordDate),
      votingInfo.voting.data,
      Number(votingInfo.snapshotId),
    );
  }

  async getVotingsCount(address: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting votings count`);

    const votingsCount = await this.connect(Equity__factory, address.toString()).getVotingCount();

    return Number(votingsCount);
  }

  async getCouponFor(address: EvmAddress, target: EvmAddress, coupon: number): Promise<CouponFor> {
    LogService.logTrace(`Getting Coupon for`);

    const couponFor = await this.connect(BondRead__factory, address.toString()).getCouponFor(coupon, target.toString());

    return new CouponFor(new BigDecimal(couponFor.tokenBalance), Number(couponFor.decimals));
  }

  async getCouponAmountFor(address: EvmAddress, target: EvmAddress, coupon: number): Promise<CouponAmountFor> {
    LogService.logTrace(`Getting Coupon Amount for`);

    const couponAmountFor = await this.connect(BondRead__factory, address.toString()).getCouponAmountFor(
      coupon,
      target.toString(),
    );

    return new CouponAmountFor(
      couponAmountFor.numerator.toString(),
      couponAmountFor.denominator.toString(),
      couponAmountFor.recordDateReached,
    );
  }

  async getPrincipalFor(address: EvmAddress, target: EvmAddress): Promise<PrincipalFor> {
    LogService.logTrace(`Getting Principal for`);

    const principalFor = await this.connect(BondRead__factory, address.toString()).getPrincipalFor(target.toString());

    return new PrincipalFor(principalFor.numerator.toString(), principalFor.denominator.toString());
  }

  async getCoupon(address: EvmAddress, coupon: number): Promise<Coupon> {
    LogService.logTrace(`Getting Coupon`);

    const couponInfo = await this.connect(BondRead__factory, address.toString()).getCoupon(coupon);

    return new Coupon(
      Number(couponInfo.coupon.recordDate),
      Number(couponInfo.coupon.executionDate),
      new BigDecimal(couponInfo.coupon.rate.toString()),
      Number(couponInfo.coupon.rateDecimals),
      Number(couponInfo.coupon.startDate),
      Number(couponInfo.coupon.endDate),
      Number(couponInfo.coupon.fixingDate),
      CastRateStatus.fromBigint(couponInfo.coupon.rateStatus),
      Number(couponInfo.snapshotId),
    );
  }

  async getCouponCount(address: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting Coupon count`);

    const couponCount = await this.connect(BondRead__factory, address.toString()).getCouponCount();

    return Number(couponCount);
  }

  async isPaused(address: EvmAddress): Promise<boolean> {
    LogService.logTrace(`Checking if the security: ${address.toString()} is paused`);

    return await this.connect(PauseFacet__factory, address.toString()).isPaused();
  }

  async arePartitionsProtected(address: EvmAddress): Promise<boolean> {
    LogService.logTrace(`Checking if the security: ${address.toString()} partitions are protected`);

    return await this.connect(ProtectedPartitionsFacet__factory, address.toString()).arePartitionsProtected();
  }

  async canTransferByPartition(
    address: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
    data: string,
    operatorData: string,
    operatorId: string,
  ): Promise<[boolean, string, string]> {
    LogService.logTrace(`Checking can transfer by partition`);

    return await this.connect(ERC1410ReadFacet__factory, address.toString()).canTransferByPartition(
      sourceId.toString(),
      targetId.toString(),
      partitionId,
      amount.toBigInt(),
      data,
      operatorData,
      {
        from: operatorId,
      },
    );
  }

  async canTransfer(
    address: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    data: string,
    operatorId: string,
  ): Promise<[boolean, string, string]> {
    LogService.logTrace(`Checking can transfer`);

    return await this.connect(ERC1594Facet__factory, address.toString()).canTransfer(
      targetId.toString(),
      amount.toBigInt(),
      data,
      {
        from: operatorId,
      },
    );
  }

  async canRedeemByPartition(
    address: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
    data: string,
    operatorData: string,
    operatorId: string,
  ): Promise<[boolean, string, string]> {
    LogService.logTrace(`Checking can redeem`);

    return await this.connect(ERC1410ReadFacet__factory, address.toString()).canRedeemByPartition(
      sourceId.toString(),
      partitionId,
      amount.toBigInt(),
      data,
      operatorData,
      {
        from: operatorId,
      },
    );
  }

  async getDocument(address: EvmAddress, name: string): Promise<[string, string, bigint]> {
    LogService.logTrace(`Getting document: ${name}`);

    return await this.connect(ERC1643Facet__factory, address.toString()).getDocument(name);
  }

  async getAllDocuments(address: EvmAddress): Promise<string[]> {
    LogService.logTrace(`Getting all documents`);

    return await this.connect(ERC1643Facet__factory, address.toString()).getAllDocuments();
  }

  async isOperatorForPartition(
    address: EvmAddress,
    partitionId: string,
    operator: EvmAddress,
    target: EvmAddress,
  ): Promise<boolean> {
    LogService.logTrace(
      `Checking if the account: ${operator.toString()} is operator for ${target.toString()} and partition ${partitionId}`,
    );

    return await this.connect(ERC1410ReadFacet__factory, address.toString()).isOperatorForPartition(
      partitionId,
      operator.toString(),
      target.toString(),
    );
  }

  async isOperator(address: EvmAddress, operator: EvmAddress, target: EvmAddress): Promise<boolean> {
    LogService.logTrace(`Checking if the account: ${operator.toString()} is operator for ${target.toString()}`);

    return await this.connect(ERC1410ReadFacet__factory, address.toString()).isOperator(
      operator.toString(),
      target.toString(),
    );
  }

  async getScheduledSnapshots(address: EvmAddress, start: number, end: number): Promise<ScheduledSnapshot[]> {
    LogService.logTrace(`Getting scheduled snapshots from ${start} to ${end}`);

    const snapshots = await this.connect(ScheduledSnapshotsFacet__factory, address.toString()).getScheduledSnapshots(
      start,
      end,
    );

    return snapshots.map(
      (s: { scheduledTimestamp: bigint; data: string }) => new ScheduledSnapshot(s.scheduledTimestamp, s.data),
    );
  }

  async scheduledSnapshotCount(address: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting scheduled snapshots count`);

    const scheduledSnapshotsCount = await this.connect(
      ScheduledSnapshotsFacet__factory,
      address.toString(),
    ).scheduledSnapshotCount();

    return Number(scheduledSnapshotsCount);
  }

  async getMaxSupply(address: EvmAddress): Promise<bigint> {
    LogService.logTrace(`Getting max supply for ${address.toString()} security`);

    return await this.connect(CapFacet__factory, address.toString()).getMaxSupply();
  }

  async getMaxSupplyByPartition(address: EvmAddress, partitionId: string): Promise<bigint> {
    LogService.logTrace(`Getting max supply by partition for ${address.toString()} security`);

    return await this.connect(CapFacet__factory, address.toString()).getMaxSupplyByPartition(partitionId);
  }

  async getTotalSupplyByPartition(address: EvmAddress, partitionId: string): Promise<bigint> {
    LogService.logTrace(`Getting max supply by partition for ${address.toString()} security`);

    return await this.connect(ERC1410ReadFacet__factory, address.toString()).totalSupplyByPartition(partitionId);
  }

  async getRegulationDetails(type: number, subType: number, factoryAddress: EvmAddress): Promise<Regulation> {
    LogService.logTrace(
      `Getting regulation for type ${type.toString()} and subtype ${subType.toString()} in factory ${factoryAddress.toString()}`,
    );

    const res = await this.connect(Factory__factory, factoryAddress.toString()).getAppliedRegulationData(type, subType);

    const regulation: Regulation = {
      type: CastRegulationType.fromBigint(res.regulationType),
      subType: CastRegulationSubType.fromBigint(res.regulationSubType),
      dealSize: res.dealSize.toString(),
      accreditedInvestors: CastAccreditedInvestors.fromBigint(res.accreditedInvestors),
      maxNonAccreditedInvestors: Number(res.maxNonAccreditedInvestors),
      manualInvestorVerification: CastManualInvestorVerification.fromBigint(res.manualInvestorVerification),
      internationalInvestors: CastInternationalInvestorscation.fromBigint(res.internationalInvestors),
      resaleHoldPeriod: CastResaleHoldPeriodorscation.fromBigint(res.resaleHoldPeriod),
    };
    return regulation;
  }

  async getLockedBalanceOf(address: EvmAddress, target: EvmAddress): Promise<bigint> {
    LogService.logTrace(
      `Getting locked balance of ${address.toString()} security for the account ${target.toString()}`,
    );

    return await this.connect(LockFacet__factory, address.toString()).getLockedAmountForByPartition(
      _PARTITION_ID_1,
      target.toString(),
    );
  }

  async getLockCount(address: EvmAddress, target: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting lock count of ${address.toString()} security for the account ${target.toString()}`);

    const count = await this.connect(LockFacet__factory, address.toString()).getLockCountForByPartition(
      _PARTITION_ID_1,
      target.toString(),
    );

    return Number(count);
  }

  async getLocksId(address: EvmAddress, target: EvmAddress, start: number, end: number): Promise<bigint[]> {
    LogService.logTrace(
      `Getting locks id of ${address.toString()} security for the account ${target.toString()} from ${start.toString()} to ${end.toString()}`,
    );

    return await this.connect(LockFacet__factory, address.toString()).getLocksIdForByPartition(
      _PARTITION_ID_1,
      target.toString(),
      start,
      end,
    );
  }

  async getLock(address: EvmAddress, target: EvmAddress, lockId: number): Promise<[bigint, bigint]> {
    LogService.logTrace(
      `Getting lock ${lockId.toString()} of ${address.toString()} security for the account ${target.toString()}`,
    );
    return await this.connect(LockFacet__factory, address.toString()).getLockForByPartition(
      _PARTITION_ID_1,
      target.toString(),
      lockId,
    );
  }

  async getConfigInfo(address: EvmAddress): Promise<[string, string, number]> {
    LogService.logTrace(`Getting config info for ${address.toString()}`);
    const configInfo = await this.connect(DiamondFacet__factory, address.toString()).getConfigInfo();

    return [configInfo.resolver_.toString(), configInfo.configurationId_, Number(configInfo.version_)];
  }

  async getScheduledBalanceAdjustment(
    address: EvmAddress,
    balanceAdjustmentId: number,
  ): Promise<ScheduledBalanceAdjustment> {
    LogService.logTrace(`Getting scheduled balance adjustment`);

    const scheduledBalanceAdjustmentInfo = await this.connect(
      Equity__factory,
      address.toString(),
    ).getScheduledBalanceAdjustment(balanceAdjustmentId);

    return new ScheduledBalanceAdjustment(
      Number(scheduledBalanceAdjustmentInfo.executionDate),
      Number(scheduledBalanceAdjustmentInfo.factor),
      Number(scheduledBalanceAdjustmentInfo.decimals),
    );
  }

  async getScheduledBalanceAdjustmentCount(address: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting scheduled balance adjustment count`);

    const scheduledBalanceAdjustmentCount = await this.connect(
      Equity__factory,
      address.toString(),
    ).getScheduledBalanceAdjustmentCount();

    return Number(scheduledBalanceAdjustmentCount);
  }

  async getHeldAmountFor(address: EvmAddress, targetId: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting Held Amount For ${targetId}`);

    const heldAmountFor = await this.connect(HoldReadFacet__factory, address.toString()).getHeldAmountFor(
      targetId.toString(),
    );

    return Number(heldAmountFor);
  }

  async getHeldAmountForByPartition(address: EvmAddress, partitionId: string, targetId: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting Held Amount For ${targetId} by partition ${partitionId}`);

    const heldAmountForByPartition = await this.connect(
      HoldReadFacet__factory,
      address.toString(),
    ).getHeldAmountForByPartition(partitionId, targetId.toString());

    return Number(heldAmountForByPartition);
  }

  async getHoldCountForByPartition(address: EvmAddress, partitionId: string, targetId: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting Hold Count For ${address} by partition ${partitionId}`);

    const holdCountForByPartition = await this.connect(
      HoldReadFacet__factory,
      address.toString(),
    ).getHoldCountForByPartition(partitionId, targetId.toString());

    return Number(holdCountForByPartition);
  }

  async getHoldsIdForByPartition(
    address: EvmAddress,
    partitionId: string,
    target: EvmAddress,
    start: number,
    end: number,
  ): Promise<number[]> {
    LogService.logTrace(`Getting Holds Id For ${target} by partition ${partitionId} from ${start} to ${end}`);

    const holdsIdForByPartition = await this.connect(
      HoldReadFacet__factory,
      address.toString(),
    ).getHoldsIdForByPartition(partitionId, target.toString(), start, end);

    return holdsIdForByPartition.map((id: bigint) => Number(id));
  }

  async getHoldForByPartition(
    address: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    holdId: number,
  ): Promise<HoldDetails> {
    LogService.logTrace(`Getting hold details for ${targetId} id ${holdId} by partition ${partitionId}`);

    const hold = await this.connect(HoldReadFacet__factory, address.toString()).getHoldForByPartition({
      partition: partitionId,
      tokenHolder: targetId.toString(),
      holdId,
    });

    return new HoldDetails(
      Number(hold.expirationTimestamp_),
      hold.amount_,
      hold.escrow_,
      targetId.toString(),
      hold.destination_,
      hold.data_,
      hold.operatorData_,
    );
  }

  async getRevocationRegistryAddress(address: EvmAddress): Promise<string> {
    LogService.logTrace(`Getting Revocation Registry Address of ${address.toString()}`);

    return await this.connect(SsiManagementFacet__factory, address.toString()).getRevocationRegistryAddress();
  }

  async getIssuerListCount(address: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting Issuer List Count of ${address.toString()}`);

    const count = await this.connect(SsiManagementFacet__factory, address.toString()).getIssuerListCount();

    return Number(count);
  }

  async getIssuerListMembers(address: EvmAddress, start: number, end: number): Promise<string[]> {
    LogService.logTrace(`Getting Issuer List Count of ${address.toString()} from ${start} to ${end}`);

    return await this.connect(SsiManagementFacet__factory, address.toString()).getIssuerListMembers(start, end);
  }

  async isIssuer(address: EvmAddress, issuer: EvmAddress): Promise<boolean> {
    LogService.logTrace(`Getting if ${issuer.toString()} is an Issuer`);

    return await this.connect(SsiManagementFacet__factory, address.toString()).isIssuer(issuer.toString());
  }

  async getKycFor(address: EvmAddress, targetId: EvmAddress): Promise<Kyc> {
    LogService.logTrace(`Getting KYC details for ${targetId}}`);

    const kycData = await this.connect(KycFacet__factory, address.toString()).getKycFor(targetId.toString());

    return new Kyc(
      kycData.validFrom.toString(),
      kycData.validTo.toString(),
      kycData.vcId,
      kycData.issuer,
      Number(kycData.status),
    );
  }

  async getKycStatusFor(address: EvmAddress, targetId: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting KYC status for ${targetId}}`);

    const kycData = await this.connect(KycFacet__factory, address.toString()).getKycStatusFor(targetId.toString());

    return Number(kycData);
  }

  async getKycAccountsData(
    address: EvmAddress,
    kycStatus: number,
    start: number,
    end: number,
  ): Promise<KycAccountData[]> {
    LogService.logTrace(`Getting accounts data with KYC status ${kycStatus}`);

    const [accounts, kycAccountsData] = await this.connect(KycFacet__factory, address.toString()).getKycAccountsData(
      kycStatus,
      start,
      end,
    );

    return accounts.map(
      (account: string, index: number) =>
        new KycAccountData(
          account,
          kycAccountsData[index].validFrom.toString(),
          kycAccountsData[index].validTo.toString(),
          kycAccountsData[index].vcId,
          kycAccountsData[index].issuer,
          Number(kycAccountsData[index].status),
        ),
    );
  }

  async getKycAccountsCount(address: EvmAddress, kycStatus: number): Promise<number> {
    LogService.logTrace(`Getting count of accounts with KYC status ${kycStatus}}`);
    const kycAccountsCount = await this.connect(KycFacet__factory, address.toString()).getKycAccountsCount(kycStatus);

    return Number(kycAccountsCount);
  }

  async getClearedAmountFor(address: EvmAddress, targetId: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting Cleared Amount For ${targetId}`);

    const clearedAmountFor = await this.connect(ClearingReadFacet__factory, address.toString()).getClearedAmountFor(
      targetId.toString(),
    );

    return Number(clearedAmountFor);
  }

  async getClearedAmountForByPartition(
    address: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
  ): Promise<number> {
    LogService.logTrace(`Getting Cleared Amount For ${targetId} by partition ${partitionId}`);

    const clearedAmountForByPartition = await this.connect(
      ClearingReadFacet__factory,
      address.toString(),
    ).getClearedAmountForByPartition(partitionId, targetId.toString());

    return Number(clearedAmountForByPartition);
  }

  async getClearingCountForByPartition(
    address: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingOperationType: ClearingOperationType,
  ): Promise<number> {
    LogService.logTrace(`Getting Clearing Count For ${address} by partition ${partitionId}`);

    const clearingCountForByPartition = await this.connect(
      ClearingReadFacet__factory,
      address.toString(),
    ).getClearingCountForByPartition(
      partitionId,
      targetId.toString(),
      CastClearingOperationType.toNumber(clearingOperationType),
    );

    return Number(clearingCountForByPartition);
  }

  async getClearingsIdForByPartition(
    address: EvmAddress,
    partitionId: string,
    target: EvmAddress,
    clearingOperationType: ClearingOperationType,
    start: number,
    end: number,
  ): Promise<number[]> {
    LogService.logTrace(`Getting Clearings Id For ${target} by partition ${partitionId} from ${start} to ${end}`);

    const clearingsIdForByPartition = await this.connect(
      ClearingReadFacet__factory,
      address.toString(),
    ).getClearingsIdForByPartition(
      partitionId,
      target.toString(),
      CastClearingOperationType.toNumber(clearingOperationType),
      start,
      end,
    );

    return clearingsIdForByPartition.map((id: bigint) => Number(id));
  }

  async getClearingCreateHoldForByPartition(
    address: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
  ): Promise<ClearingHoldCreation> {
    LogService.logTrace(
      `Getting Clearing Create Hold details for ${targetId} id ${clearingId} by partition ${partitionId}`,
    );

    const clearing = await this.connect(
      ClearingHoldCreationFacet__factory,
      address.toString(),
    ).getClearingCreateHoldForByPartition(partitionId, targetId.toString(), clearingId);

    return new ClearingHoldCreation(
      new BigDecimal(clearing.amount.toString()),
      Number(clearing.expirationTimestamp),
      clearing.data,
      clearing.operatorData,
      clearing.holdEscrow,
      Number(clearing.holdExpirationTimestamp),
      clearing.holdTo,
      clearing.holdData,
    );
  }

  async getClearingRedeemForByPartition(
    address: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
  ): Promise<ClearingRedeem> {
    LogService.logTrace(`Getting Clearing Redeem details for ${targetId} id ${clearingId} by partition ${partitionId}`);

    const clearing = await this.connect(
      ClearingRedeemFacet__factory,
      address.toString(),
    ).getClearingRedeemForByPartition(partitionId, targetId.toString(), clearingId);

    return new ClearingRedeem(
      new BigDecimal(clearing.amount.toString()),
      Number(clearing.expirationTimestamp),
      clearing.data,
      clearing.operatorData,
    );
  }

  async getClearingTransferForByPartition(
    address: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
  ): Promise<ClearingTransfer> {
    LogService.logTrace(
      `Getting Clearing Transfer details for ${targetId} id ${clearingId} by partition ${partitionId}`,
    );

    const clearing = await this.connect(
      ClearingTransferFacet__factory,
      address.toString(),
    ).getClearingTransferForByPartition(partitionId, targetId.toString(), clearingId);

    return new ClearingTransfer(
      new BigDecimal(clearing.amount.toString()),
      Number(clearing.expirationTimestamp),
      clearing.destination,
      clearing.data,
      clearing.operatorData,
    );
  }

  async isClearingActivated(address: EvmAddress): Promise<boolean> {
    LogService.logTrace(`Getting if clearing is activated to security ${address.toString()}`);

    return await this.connect(ClearingActionsFacet__factory, address.toString()).isClearingActivated();
  }

  async isExternalPause(address: EvmAddress, externalPauseAddress: EvmAddress): Promise<boolean> {
    LogService.logTrace(
      `Checking if the address ${externalPauseAddress.toString()} is a external pause for the security: ${address.toString()}`,
    );

    return await this.connect(ExternalPauseManagementFacet__factory, address.toString()).isExternalPause(
      externalPauseAddress.toString(),
    );
  }

  async getExternalPausesCount(address: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting External Pauses Count for ${address.toString()}`);

    const getExternalPausesCount = await this.connect(
      ExternalPauseManagementFacet__factory,
      address.toString(),
    ).getExternalPausesCount();

    return Number(getExternalPausesCount);
  }

  async getExternalPausesMembers(address: EvmAddress, start: number, end: number): Promise<string[]> {
    LogService.logTrace(`Getting External Pauses Members For security ${address.toString()} from ${start} to ${end}`);

    return await this.connect(ExternalPauseManagementFacet__factory, address.toString()).getExternalPausesMembers(
      start,
      end,
    );
  }

  async isPausedMock(address: EvmAddress): Promise<boolean> {
    LogService.logTrace(`Checking if the external pause mock contract: ${address.toString()} is paused`);

    return await this.connect(MockedExternalPause__factory, address.toString()).isPaused();
  }

  async isExternalControlList(address: EvmAddress, externalControlListAddress: EvmAddress): Promise<boolean> {
    LogService.logTrace(
      `Checking if the address ${externalControlListAddress.toString()} is a external control list for the security: ${address.toString()}`,
    );

    return await this.connect(ExternalControlListManagementFacet__factory, address.toString()).isExternalControlList(
      externalControlListAddress.toString(),
    );
  }

  async getExternalControlListsCount(address: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting External Control Lists Count for ${address.toString()}`);

    const getExternalPausesCount = await this.connect(
      ExternalControlListManagementFacet__factory,
      address.toString(),
    ).getExternalControlListsCount();

    return Number(getExternalPausesCount);
  }

  async getExternalControlListsMembers(address: EvmAddress, start: number, end: number): Promise<string[]> {
    LogService.logTrace(
      `Getting External Control Lists Members For security ${address.toString()} from ${start} to ${end}`,
    );

    return await this.connect(
      ExternalControlListManagementFacet__factory,
      address.toString(),
    ).getExternalControlListsMembers(start, end);
  }

  async isAuthorizedBlackListMock(address: EvmAddress, targetId: EvmAddress): Promise<boolean> {
    LogService.logTrace(
      `Checking if address ${targetId.toString()} is authorized in external black list ${address.toString()}`,
    );

    return await this.connect(MockedBlacklist__factory, address.toString()).isAuthorized(targetId.toString());
  }

  async isAuthorizedWhiteListMock(address: EvmAddress, targetId: EvmAddress): Promise<boolean> {
    LogService.logTrace(
      `Checking if address ${targetId.toString()} is authorized in external white list ${address.toString()}`,
    );

    return await this.connect(MockedWhitelist__factory, address.toString()).isAuthorized(targetId.toString());
  }

  async isExternalKycList(address: EvmAddress, externalKycListAddress: EvmAddress): Promise<boolean> {
    LogService.logTrace(
      `Checking if the address ${externalKycListAddress.toString()} is a external kyc list for the security: ${address.toString()}`,
    );

    return await this.connect(ExternalKycListManagementFacet__factory, address.toString()).isExternalKycList(
      externalKycListAddress.toString(),
    );
  }

  async getExternalKycListsCount(address: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting External Kyc Lists Count for ${address.toString()}`);

    const getExternalKycListsCount = await this.connect(
      ExternalKycListManagementFacet__factory,
      address.toString(),
    ).getExternalKycListsCount();

    return Number(getExternalKycListsCount);
  }

  async getExternalKycListsMembers(address: EvmAddress, start: number, end: number): Promise<string[]> {
    LogService.logTrace(
      `Getting External Kyc Lists Members For security ${address.toString()} from ${start} to ${end}`,
    );

    return await this.connect(ExternalKycListManagementFacet__factory, address.toString()).getExternalKycListsMembers(
      start,
      end,
    );
  }

  async isExternallyGranted(address: EvmAddress, kycStatus: number, targetId: EvmAddress): Promise<boolean> {
    LogService.logTrace(
      `Checking if the address ${targetId.toString()} has the status '${kycStatus}' for the contract: ${address.toString()}`,
    );

    return await this.connect(ExternalKycListManagementFacet__factory, address.toString()).isExternallyGranted(
      targetId.toString(),
      kycStatus,
    );
  }

  async isInternalKycActivated(address: EvmAddress): Promise<boolean> {
    LogService.logTrace(`Checking if the internal kyc is activated for the security: ${address.toString()}`);

    return await this.connect(KycFacet__factory, address.toString()).isInternalKycActivated();
  }

  async getKycStatusMock(address: EvmAddress, targetId: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting Kyc status for account ${targetId}} for the mock contract ${address.toString()}`);

    const kycStatus = await this.connect(MockedExternalKycList__factory, address.toString()).getKycStatus(
      targetId.toString(),
    );

    return Number(kycStatus);
  }

  async onchainID(address: EvmAddress): Promise<string> {
    LogService.logTrace(`Getting OnchainID for security ${address.toString()}`);

    return await this.connect(ERC3643ReadFacet__factory, address.toString()).onchainID();
  }

  async identityRegistry(address: EvmAddress): Promise<string> {
    LogService.logTrace(`Getting IdentityRegistry for security ${address.toString()}`);

    return await this.connect(ERC3643ReadFacet__factory, address.toString()).identityRegistry();
  }

  async compliance(address: EvmAddress): Promise<string> {
    LogService.logTrace(`Getting Compliance for security ${address.toString()}`);

    return await this.connect(ERC3643ReadFacet__factory, address.toString()).compliance();
  }

  async getFrozenPartialTokens(address: EvmAddress, targetId: EvmAddress): Promise<number> {
    LogService.logTrace(
      `Getting frozen partial tokens for account ${targetId}} for the mock contract ${address.toString()}`,
    );

    const frozenTokens = await this.connect(FreezeFacet__factory, address.toString()).getFrozenTokens(
      targetId.toString(),
    );

    return Number(frozenTokens);
  }

  async isAddressRecovered(address: EvmAddress, targetId: EvmAddress): Promise<boolean> {
    LogService.logTrace(`Getting recovery status of ${targetId}`);

    const isAddressRecovered = await this.connect(ERC3643ReadFacet__factory, address.toString()).isAddressRecovered(
      targetId.toString(),
    );

    return isAddressRecovered;
  }

  async getTokenHoldersAtSnapshot(
    address: EvmAddress,
    snapshotId: number,
    start: number,
    end: number,
  ): Promise<string[]> {
    LogService.logTrace(`Getting token holders at snapshot ${snapshotId} for security ${address.toString()}`);
    return await this.connect(SnapshotsFacet__factory, address.toString()).getTokenHoldersAtSnapshot(
      snapshotId,
      start,
      end,
    );
  }

  async getTotalTokenHoldersAtSnapshot(address: EvmAddress, snapshotId: number): Promise<number> {
    LogService.logTrace(`Getting total token holders at snapshot ${snapshotId} for security ${address.toString()}`);

    const total = await this.connect(SnapshotsFacet__factory, address.toString()).getTotalTokenHoldersAtSnapshot(
      snapshotId,
    );

    return Number(total);
  }

  async getCouponHolders(address: EvmAddress, couponId: number, start: number, end: number): Promise<string[]> {
    LogService.logTrace(`Getting coupon holders for coupon ${couponId} for security ${address.toString()}`);
    return await this.connect(BondRead__factory, address.toString()).getCouponHolders(couponId, start, end);
  }

  async getTotalCouponHolders(address: EvmAddress, couponId: number): Promise<number> {
    LogService.logTrace(`Getting total coupon holders for coupon ${couponId} for security ${address.toString()}`);

    const total = await this.connect(BondRead__factory, address.toString()).getTotalCouponHolders(couponId);

    return Number(total);
  }

  async getCouponFromOrderedListAt(address: EvmAddress, pos: number): Promise<number> {
      LogService.logTrace(`Getting coupon from ordered list at position ${pos} for security ${address.toString()}`);

      const couponId = await this.connect(BondRead__factory, address.toString()).getCouponFromOrderedListAt(pos);

      return Number(couponId);
    }

    async getCouponsOrderedList(address: EvmAddress, pageIndex?: number, pageLength?: number): Promise<number[]> {
      LogService.logTrace(`Getting coupons ordered list for security ${address.toString()}, page ${pageIndex}, length ${pageLength}`);

      // If pagination parameters are provided, use paginated call
      if (pageIndex !== undefined && pageLength !== undefined) {
        const couponIds = await this.connect(BondRead__factory, address.toString()).getCouponsOrderedList(pageIndex, pageLength);
        return couponIds.map(id => Number(id));
      }

      // Otherwise get all coupons (simulate by getting first page with large length)
      const couponIds = await this.connect(BondRead__factory, address.toString()).getCouponsOrderedList(0, 1000);
      return couponIds.map(id => Number(id));
    }

    async getCouponsOrderedListTotal(address: EvmAddress): Promise<number> {
      LogService.logTrace(`Getting coupons ordered list total for security ${address.toString()}`);

      const total = await this.connect(BondRead__factory, address.toString()).getCouponsOrderedListTotal();

      return Number(total);
    }

  async getDividendHolders(address: EvmAddress, dividendId: number, start: number, end: number): Promise<string[]> {
    LogService.logTrace(`Getting dividend holders for dividend ${dividendId} for security ${address.toString()}`);
    return await this.connect(Equity__factory, address.toString()).getDividendHolders(dividendId, start, end);
  }

  async getTotalDividendHolders(address: EvmAddress, dividendId: number): Promise<number> {
    LogService.logTrace(`Getting total dividend holders for dividend ${dividendId} for security ${address.toString()}`);

    const total = await this.connect(Equity__factory, address.toString()).getTotalDividendHolders(dividendId);

    return Number(total);
  }

  async getVotingHolders(address: EvmAddress, voteId: number, start: number, end: number): Promise<string[]> {
    LogService.logTrace(`Getting voting holders for vote ${voteId} for security ${address.toString()}`);
    return await this.connect(Equity__factory, address.toString()).getVotingHolders(voteId, start, end);
  }

  async getTotalVotingHolders(address: EvmAddress, voteId: number): Promise<number> {
    LogService.logTrace(`Getting total voting holders for vote ${voteId} for security ${address.toString()}`);

    const total = await this.connect(Equity__factory, address.toString()).getTotalVotingHolders(voteId);

    return Number(total);
  }

  async getSecurityHolders(address: EvmAddress, start: number, end: number): Promise<string[]> {
    LogService.logTrace(`Getting security holders for security ${address.toString()}`);
    return await this.connect(Security__factory, address.toString()).getSecurityHolders(start, end);
  }

  async getTotalSecurityHolders(address: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting total security holders for security ${address.toString()}`);

    const total = await this.connect(Security__factory, address.toString()).getTotalSecurityHolders();

    return Number(total);
  }

  async getTrexTokenBySalt(factory: EvmAddress, salt: string): Promise<string> {
    LogService.logTrace(`Getting TREX token by salt ${salt}`);
    const token = await this.connect(TREXFactoryAts__factory, factory.toString()).getToken(salt);
    return token;
  }

  async isProceedRecipient(address: EvmAddress, proceedRecipient: EvmAddress): Promise<boolean> {
    LogService.logTrace(
      `Checking if the address ${proceedRecipient.toString()} is a proceed recipient for the security: ${address.toString()}`,
    );
    return await this.connect(ProceedRecipientsFacet__factory, address.toString()).isProceedRecipient(
      proceedRecipient.toString(),
    );
  }

  async getProceedRecipientData(address: EvmAddress, proceedRecipient: EvmAddress): Promise<string> {
    LogService.logTrace(
      `Getting proceed recipient data for the address ${proceedRecipient.toString()} for the security: ${address.toString()}`,
    );
    return await this.connect(ProceedRecipientsFacet__factory, address.toString()).getProceedRecipientData(
      proceedRecipient.toString(),
    );
  }

  async getProceedRecipientsCount(address: EvmAddress): Promise<number> {
    LogService.logTrace(`Getting proceedRecipients count for the security: ${address.toString()}`);
    return Number(
      await this.connect(ProceedRecipientsFacet__factory, address.toString()).getProceedRecipientsCount(),
    );
  }

  async getProceedRecipients(address: EvmAddress, page: number, pageLength: number): Promise<string[]> {
    LogService.logTrace(
      `Getting proceedRecipients from ${page} to ${pageLength} for the security: ${address.toString()}`,
    );
    return await this.connect(ProceedRecipientsFacet__factory, address.toString()).getProceedRecipients(
      page,
      pageLength,
    );
  }

  async actionContentHashExists(address: EvmAddress, contentHash: string): Promise<boolean> {
    LogService.logTrace(`Getting actionContentHashExists for ${contentHash} for the security: ${address.toString()}`);
    return await this.connect(CorporateActionsFacet__factory, address.toString()).actionContentHashExists(contentHash);
  }

  async getRate(address: EvmAddress): Promise<[bigint, number]> {
      const result = await this.connect(FixedRate__factory, address.toString()).getRate();
      return [result.rate_, Number(result.decimals_)];
    }

    async getInterestRate(address: EvmAddress): Promise<[bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]> {
      LogService.logTrace(`Getting interest rate for security: ${address.toString()}`);
      const result = await this.connect(KpiLinkedRate__factory, address.toString()).getInterestRate();
      return [
        result.maxRate,
        result.baseRate,
        result.minRate,
        result.startPeriod,
        result.startRate,
        result.missedPenalty,
        result.reportPeriod,
        result.rateDecimals,
      ];
    }

    async getKpiLatestKpiData(address: EvmAddress, from: bigint, to: bigint, kpi: EvmAddress): Promise<{ value: bigint; exists: boolean }> {
      LogService.logTrace(`Getting latest KPI data for the security: ${address.toString()}`);
      const result = await this.connect(Kpis__factory, address.toString()).getLatestKpiData(from, to, kpi.toString());
      return { value: result[0], exists: result[1] };
    }

    async getMinDate(address: EvmAddress): Promise<number> {
      LogService.logTrace(`Getting min date for the security: ${address.toString()}`);
      const result = await this.connect(Kpis__factory, address.toString()).getMinDate();
      return Number(result);
    }

    async getImpactData(address: EvmAddress): Promise<[bigint, bigint, bigint, number, bigint]> {
      LogService.logTrace(`Getting impact data for the security: ${address.toString()}`);
      const result = await this.connect(KpiLinkedRate__factory, address.toString()).getImpactData();
      return [
        result.maxDeviationCap,
        result.baseLine,
        result.maxDeviationFloor,
        Number(result.impactDataDecimals),
        result.adjustmentPrecision,
      ];
    }

    async isCheckPointDate(address: EvmAddress, date: number, project: EvmAddress): Promise<boolean> {
      LogService.logTrace(`Checking if date ${date.toString()} is a checkpoint date for project ${project.toString()}`);
      return await this.connect(Kpis__factory, address.toString()).isCheckPointDate(date, project.toString());
    }

    async scheduledCouponListingCount(address: EvmAddress): Promise<number> {
      LogService.logTrace(`Getting scheduled coupon listing count for security: ${address.toString()}`);
      const result = await this.connect(ScheduledCouponListingFacet__factory, address.toString()).scheduledCouponListingCount();
      return Number(result);
    }

    async getScheduledCouponListing(address: EvmAddress, pageIndex: number, pageLength: number): Promise<any> {
      LogService.logTrace(`Getting scheduled coupon listing for security: ${address.toString()}`);
      return await this.connect(ScheduledCouponListingFacet__factory, address.toString()).getScheduledCouponListing(pageIndex, pageLength);
    }
}
