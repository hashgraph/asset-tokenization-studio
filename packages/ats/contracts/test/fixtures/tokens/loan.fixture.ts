// SPDX-License-Identifier: Apache-2.0

/**
 * Loan token test fixtures.
 *
 * Provides fixtures for deploying loan/bond-like tokens using TestFactory
 * for isolated testing without production factory overhead.
 *
 * TestFactory.deployProxy() creates ResolverProxy without calling any
 * initialize methods, giving tests full control over facet initialization.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { ethers } from "hardhat";
import { ZeroAddress } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture } from "../infrastructure.fixture";
import {
  ATS_ROLES,
  buildRegulationData,
  createLoanConfiguration,
  FactoryRegulationDataParams,
  LOAN_CONFIG_ID,
  SecurityDataParams,
} from "@scripts/domain";
import { IAsset__factory, IDiamondFacet__factory } from "@contract-types";
import { decodeEvent } from "@scripts/infrastructure";
import { DeepPartial, TIME_PERIODS_S } from "@scripts";
import { getDltTimestamp } from "../hardhatHelpers";
import { DEFAULT_BOND_PARAMS, executeRbac, getRegulationData, getSecurityData } from "@test";

/**
 * Default loan token parameters for test fixtures.
 */
export const DEFAULT_LOAN_PARAMS = {
  nominalValue: 100,
  nominalValueDecimals: 2,
  // Loan-specific defaults
  currency: "0x555344", // USD
  loanStructureType: 1, // TERM_LOAN
  repaymentType: 0, // BULLET
  interestType: 0, // FIXED
  baseReferenceRate: 0, // NONE
  floorRate: 0,
  capRate: 0,
  rateMargin: 0,
  dayCount: 0, // ACTUAL360
  paymentFrequency: 0, // MONTHLY
  prepaymentPenalty: 0,
  commitmentFee: 0,
  utilizationFee: 0,
  utilizationFeeType: 0, // EMBEDDED
  servicingFee: 0,
  internalRiskGrade: "test",
  defaultProbability: 0,
  lossGivenDefault: 0,
  totalCollateralValue: 0,
  loanToValue: 0,
  performanceStatus: 0, // PERFORMING
  daysPastDue: 0,
  originatorAccount: async () => {
    const wallet = ethers.Wallet.createRandom();
    return wallet.address;
  },
  servicerAccount: async () => {
    const wallet = ethers.Wallet.createRandom();
    return wallet.address;
  },
  startingDate: async () => {
    return (await getDltTimestamp()) + 3600; // block.timestamp + 1 hour
  },
} as const;

interface LoanInitData {
  // LoanBasicData
  currency: string;
  startingDate: number;
  maturityDate: number;
  loanStructureType: number;
  repaymentType: number;
  interestType: number;
  signingDate: number;
  originatorAccount: string;
  servicerAccount: string;
  // LoanInterestData
  baseReferenceRate: number;
  floorRate: number;
  capRate: number;
  rateMargin: number;
  dayCount: number;
  paymentFrequency: number;
  firstAccrualDate: number;
  prepaymentPenalty: number;
  commitmentFee: number;
  utilizationFee: number;
  utilizationFeeType: number;
  servicingFee: number;
  // RiskData
  internalRiskGrade: string;
  defaultProbability: number;
  lossGivenDefault: number;
  // Collateral
  totalCollateralValue: number;
  loanToValue: number;
  // LoanPerformanceStatus
  performanceStatus: number;
  daysPastDue: number;
}

interface DeployLoanTokenFixtureParams {
  nominalValue: 100;
  nominalValueDecimals: 2;
  loanInit: LoanInitData;
  securityDataParams: SecurityDataParams;
}

export async function getLoanDetails(params?: DeepPartial<LoanInitData>) {
  const maturityDate =
    params?.maturityDate ??
    (params?.startingDate
      ? params.startingDate + TIME_PERIODS_S.YEAR
      : (await DEFAULT_BOND_PARAMS.startingDate()) + TIME_PERIODS_S.YEAR);
  return {
    collateral: {
      loanToValue: params?.loanToValue ?? DEFAULT_LOAN_PARAMS.loanToValue,
      totalCollateralValue: params?.totalCollateralValue ?? DEFAULT_LOAN_PARAMS.totalCollateralValue,
    },
    riskData: {
      internalRiskGrade: params?.internalRiskGrade ?? DEFAULT_LOAN_PARAMS.internalRiskGrade,
      defaultProbability: params?.defaultProbability ?? DEFAULT_LOAN_PARAMS.defaultProbability,
      lossGivenDefault: params?.lossGivenDefault ?? DEFAULT_LOAN_PARAMS.lossGivenDefault,
    },
    loanBasicData: {
      currency: params?.currency ?? DEFAULT_LOAN_PARAMS.currency,
      startingDate: params?.startingDate ?? (await DEFAULT_LOAN_PARAMS.startingDate()),
      maturityDate: maturityDate,
      loanStructureType: params?.loanStructureType ?? DEFAULT_LOAN_PARAMS.loanStructureType,
      repaymentType: params?.repaymentType ?? DEFAULT_LOAN_PARAMS.repaymentType,
      interestType: params?.interestType ?? DEFAULT_LOAN_PARAMS.interestType,
      originatorAccount: params?.originatorAccount ?? (await DEFAULT_LOAN_PARAMS.originatorAccount()),
      servicerAccount: params?.servicerAccount ?? (await DEFAULT_LOAN_PARAMS.servicerAccount()),
      signingDate:
        params?.signingDate ??
        (params?.startingDate ? params.startingDate - 1800 : await DEFAULT_LOAN_PARAMS.startingDate()),
    },
    loanInterestData: {
      baseReferenceRate: params?.baseReferenceRate ?? DEFAULT_LOAN_PARAMS.baseReferenceRate,
      floorRate: params?.floorRate ?? DEFAULT_LOAN_PARAMS.floorRate,
      capRate: params?.capRate ?? DEFAULT_LOAN_PARAMS.capRate,
      rateMargin: params?.rateMargin ?? DEFAULT_LOAN_PARAMS.rateMargin,
      dayCount: params?.dayCount ?? DEFAULT_LOAN_PARAMS.dayCount,
      paymentFrequency: params?.paymentFrequency ?? DEFAULT_LOAN_PARAMS.paymentFrequency,
      firstAccrualDate:
        params?.firstAccrualDate ??
        (params?.startingDate ? params.startingDate : await DEFAULT_LOAN_PARAMS.startingDate()),
      prepaymentPenalty: params?.prepaymentPenalty ?? DEFAULT_LOAN_PARAMS.prepaymentPenalty,
      commitmentFee: params?.commitmentFee ?? DEFAULT_LOAN_PARAMS.commitmentFee,
      utilizationFee: params?.utilizationFee ?? DEFAULT_LOAN_PARAMS.utilizationFee,
      utilizationFeeType: params?.utilizationFeeType ?? DEFAULT_LOAN_PARAMS.utilizationFeeType,
      servicingFee: params?.servicingFee ?? DEFAULT_LOAN_PARAMS.servicingFee,
    },
    loanPerformanceStatus: {
      performanceStatus: params?.performanceStatus ?? DEFAULT_LOAN_PARAMS.performanceStatus,
      daysPastDue: params?.daysPastDue ?? DEFAULT_LOAN_PARAMS.daysPastDue,
    },
  };
}

/**
 * Fixture: Deploy ATS infrastructure + single Loan token via TestFactory
 *
 * Extends deployAtsInfrastructureFixture with:
 * - Loan BLR configuration registration
 * - TestFactory deployment
 * - ResolverProxy deployment via TestFactory.deployProxy()
 * - Manual facet initialization with test-specific values
 *
 * @param params - Optional custom loan token parameters
 * @returns Infrastructure + deployed loan token + connected facets
 */
export async function deployLoanTokenFixture({
  loanParams,
  regulationTypeParams,
  useLoadFixture = true,
  infrastructure: providedInfrastructure,
}: {
  loanParams?: DeepPartial<DeployLoanTokenFixtureParams>;
  regulationTypeParams?: DeepPartial<FactoryRegulationDataParams>;
  useLoadFixture?: boolean;
  infrastructure?: Awaited<ReturnType<typeof deployAtsInfrastructureFixture>>;
} = {}) {
  // Reuse already-loaded infrastructure when provided to avoid nested loadFixture
  // calls that would revert the chain and wipe previously-deployed sibling tokens.
  const infrastructure =
    providedInfrastructure ??
    (useLoadFixture ? await loadFixture(deployAtsInfrastructureFixture) : await deployAtsInfrastructureFixture());
  const { factory, blr, deployer } = infrastructure;

  const securityData = getSecurityData(blr, {
    ...loanParams?.securityDataParams,
    resolverProxyConfiguration: {
      key: LOAN_CONFIG_ID,
      version: 1,
    },
  });

  const loanDetails = await getLoanDetails(loanParams?.loanInit);
  const regulationData = getRegulationData(regulationTypeParams);
  // Build facet addresses map from deployment.facets array
  const facetAddresses: Record<string, string> = {};
  for (const facet of infrastructure.deployment.facets) {
    facetAddresses[facet.name] = facet.address;
  }

  // Create Loan configuration in BLR (registers all 45 facets including AmortizationFacet)
  await createLoanConfiguration(blr, facetAddresses, true);

  const version = 1;

  // Deploy TestFactory

  // Deploy ResolverProxy via TestFactory
  const rbacs = [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [deployer.address] }];

  // Get BLR proxy address (use deployment data to avoid TypeScript type mismatch)
  const blrProxyAddress = infrastructure.deployment.infrastructure.blr.proxy;

  const tx = await factory.deployProxy(blrProxyAddress, LOAN_CONFIG_ID, 1, rbacs);
  const receipt = await tx.wait();
  const proxyAddress = (await decodeEvent(factory, "ProxyDeployed", receipt)).proxyAddress;

  // Connected facets (most commonly used)
  const accessControlFacet = IAsset__factory.connect(proxyAddress, deployer);
  const pauseFacet = IAsset__factory.connect(proxyAddress, deployer);
  const kycFacet = IAsset__factory.connect(proxyAddress, deployer);
  const controlListFacet = IAsset__factory.connect(proxyAddress, deployer);
  const coreFacet = IAsset__factory.connect(proxyAddress, deployer);
  const freezeFacet = IAsset__factory.connect(proxyAddress, deployer);
  const capFacet = IAsset__factory.connect(proxyAddress, deployer);
  const controllerFacet = IAsset__factory.connect(proxyAddress, deployer);
  const mintFacet = IAsset__factory.connect(proxyAddress, deployer);
  const burnFacet = IAsset__factory.connect(proxyAddress, deployer);
  const erc1410ManagementFacet = IAsset__factory.connect(proxyAddress, deployer);
  const erc3643ManagementFacet = IAsset__factory.connect(proxyAddress, deployer);
  const erc20VotesFacet = IAsset__factory.connect(proxyAddress, deployer);
  const couponFacet = IAsset__factory.connect(proxyAddress, deployer);
  const nominalValueFacet = IAsset__factory.connect(proxyAddress, deployer);
  const protectedPartitionsFacet = IAsset__factory.connect(proxyAddress, deployer);
  const clearingFacet = IAsset__factory.connect(proxyAddress, deployer);
  const externalKycListManagementFacet = IAsset__factory.connect(proxyAddress, deployer);
  const externalControlListManagementFacet = IAsset__factory.connect(proxyAddress, deployer);
  const externalPauseManagementFacet = IAsset__factory.connect(proxyAddress, deployer);
  const proceedRecipientsFacet = IAsset__factory.connect(proxyAddress, deployer);
  const timeTravelFacet = IAsset__factory.connect(proxyAddress, deployer);

  await controlListFacet.initializeControlList(securityData.isWhiteList);
  await controllerFacet.initializeController(securityData.isControllable);
  await coreFacet.initializeCore({
    info: {
      name: securityData.erc20MetadataInfo.name,
      symbol: securityData.erc20MetadataInfo.symbol,
      decimals: securityData.erc20MetadataInfo.decimals,
      isin: securityData.erc20MetadataInfo.isin,
    },
    securityType: 1, // SecurityType.Equity (reuse for loan)
  });
  await mintFacet.initializeERC1594();
  await capFacet.initializeCap(securityData.maxSupply, []);
  await protectedPartitionsFacet.initializeProtectedPartitions(securityData.arePartitionsProtected);
  await clearingFacet.initializeClearing(securityData.clearingActive);
  await externalPauseManagementFacet.initializeExternalPauses([]);
  await externalControlListManagementFacet.initializeExternalControlLists([]);
  await kycFacet.initializeInternalKyc(securityData.internalKycActivated);
  await externalKycListManagementFacet.initializeExternalKycLists([]);
  await erc20VotesFacet.initializeERC20Votes(securityData.erc20VotesActivated);
  await nominalValueFacet.initializeNominalValue(
    loanParams?.nominalValue ?? DEFAULT_LOAN_PARAMS.nominalValue,
    loanParams?.nominalValueDecimals ?? DEFAULT_LOAN_PARAMS.nominalValueDecimals,
    loanParams?.loanInit?.currency ?? DEFAULT_LOAN_PARAMS.currency,
  );

  const asset = IAsset__factory.connect(proxyAddress, deployer);

  // Initialize remaining essential facets identified
  await IDiamondFacet__factory.connect(proxyAddress, deployer).initializeDiamondCut();
  await asset.initializeTransferAndLock();

  await asset.initializeLoan(loanDetails);
  await asset.initializeAccessControl();

  // Call all other initializations provided by the user list that are present in IAsset
  await asset.initializeAllowance();
  await asset.initializeBurn();
  await asset.initializeSecurityHolders();
  await asset.initializeHold();
  await asset.initializeBatchMint();
  await asset.initializeBatchTransfer();
  await asset.initializeBatchBurn();
  await asset.initializeFreeze();
  await asset.initializeBalanceTrackerAdjusted();
  await asset.initializeFreezeAtSnapshot();
  await asset.initializeClearingHoldByPartition();
  await asset.initializeOperatorClearingByPartition();
  await asset.initializeControllerHoldByPartition();
  await asset.initializeProtectedHoldByPartition();
  await asset.initializeRecovery();
  await asset.initializeProtectedClearingByPartition();
  await asset.initializeProtectedClearingHoldByPartition();
  await asset.initializeBurnByPartition();
  await asset.initializeNominalValueAtSnapshot();
  await asset.initializeClearingAtSnapshot();
  await asset.initializeControllerByPartition();
  await asset.initializeBatchFreeze();
  await asset.initializeClearingByPartition();
  await asset.initializeSnapshotsByPartition();
  await asset.initializeIdentity(ZeroAddress);
  await asset.initializeSecurityHoldersAtSnapshot();
  await asset.initializeFreezeAtSnapshotByPartition();
  await asset.initializeProtectedByPartition();
  await asset.initializeEIP712();
  await asset.initializeDocumentation();
  await asset.initializeTransferAndLockByPartition();
  await asset.initializeHoldAtSnapshot();
  await asset.initializeLock();
  await asset.initializeOperatorClearingHoldByPartition();
  await asset.initializeSnapshots();
  await asset.initializeERC20Permit();
  await asset.initializeLockAtSnapshotByPartition();
  await asset.initializeOperator();
  await asset.initializeTransfer();
  await asset.initializeLockAtSnapshot();
  await asset.initializeHoldAtSnapshotByPartition();
  await asset.initializeBalanceTrackerAtSnapshotByPartition();
  await asset.initializeCouponSecurityHolders();
  await asset.initializeTransferByPartition();
  await asset.initializeBalanceTrackerAtSnapshot();
  await asset.initializePartitions(securityData.isMultiPartition);
  await asset.initializeBalanceTrackerByPartition();
  await asset.initializeSsiManagement();
  await asset.initializeOperatorByPartition();
  await asset.initializeAmortization();
  await asset.initializeProceedRecipients([], []);
  await asset.initializeScheduledCrossOrderedTasks();
  await asset.initializeCorporateActions();
  await asset.initializeMintByPartition();
  await asset.initializeClearingAtSnapshotByPartition();
  await asset.initializeBatchController();
  await asset.initializeCoreAtSnapshot();
  await asset.initializeComplianceByPartition();
  await asset.initializeCoupon();
  await asset.initializeLockByPartition();
  await asset.initializeHoldByPartition();
  await asset.initializeDeactivate();
  await asset.initializeOperatorHoldByPartition();
  await asset.initializeCoreAdjusted();
  await asset.initializeCustomData();
  await asset.initializeCompliance(ZeroAddress);
  await asset.initializeCouponListing();
  await asset.initializeCapByPartition();
  await asset.initializePause();
  await asset.initializeBalanceTracker();
  await asset.initializeBalanceAdjustments();
  await asset.initializeScheduledBalanceAdjustment();
  await asset.initializeTimeTravel();

  await asset.connect(deployer).initializeInitializer(150);
  await asset.connect(deployer).setOperationalStatus();

  return {
    ...infrastructure,

    // TestFactory
    testFactory: factory,

    // Token
    tokenAddress: proxyAddress,

    // Connected facets (most commonly used)
    accessControlFacet,
    pauseFacet,
    kycFacet,
    controlListFacet,
    coreFacet,
    freezeFacet,
    capFacet,
    controllerFacet,
    mintFacet,
    burnFacet,
    erc1410ManagementFacet,
    erc3643ManagementFacet,
    erc20VotesFacet,
    couponFacet,
    nominalValueFacet,
    protectedPartitionsFacet,
    clearingFacet,
    externalKycListManagementFacet,
    externalControlListManagementFacet,
    externalPauseManagementFacet,
    proceedRecipientsFacet,
    timeTravelFacet,
  };
}
