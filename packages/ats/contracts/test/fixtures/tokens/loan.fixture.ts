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

import { isinGenerator } from "@thomaschaplin/isin-generator";
import { ethers } from "hardhat";
import { ZeroAddress, ethers as ethersTypes } from "ethers";
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
import {
  AccessControlFacet__factory,
  CapFacet__factory,
  ControlListFacet__factory,
  CouponFacet__factory,
  NominalValueFacet__factory,
  ERC20Facet__factory,
  ERC3643ManagementFacet__factory,
  ERC20VotesFacet__factory,
  ERC1644Facet__factory,
  ERC1594Facet__factory,
  ERC1410ManagementFacet__factory,
  FreezeFacet__factory,
  KycFacet__factory,
  PauseFacet__factory,
  ProtectedPartitionsFacet__factory,
  ClearingActionsFacet__factory,
  ExternalKycListManagementFacet__factory,
  ExternalControlListManagementFacet__factory,
  ExternalPauseManagementFacet__factory,
  ProceedRecipientsFacet__factory,
  TimeTravelFacet__factory,
  Loan__factory,
} from "@contract-types";
import { decodeEvent } from "@scripts/infrastructure";
import { DeepPartial, TIME_PERIODS_S } from "@scripts";
import { getDltTimestamp } from "../hardhatHelpers";
import { DEFAULT_BOND_PARAMS, getRegulationData, getSecurityData } from "@test";

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
}: {
  loanParams?: DeepPartial<DeployLoanTokenFixtureParams>;
  regulationTypeParams?: DeepPartial<FactoryRegulationDataParams>;
  useLoadFixture?: boolean;
} = {}) {
  // Load base infrastructure (BLR + all facets deployed)
  const infrastructure = useLoadFixture
    ? await loadFixture(deployAtsInfrastructureFixture)
    : await deployAtsInfrastructureFixture();
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

  // Deploy TestFactory

  // Deploy ResolverProxy via TestFactory
  const rbacs = [{ role: ATS_ROLES._DEFAULT_ADMIN_ROLE, members: [deployer.address] }];

  // Get BLR proxy address (use deployment data to avoid TypeScript type mismatch)
  const blrProxyAddress = infrastructure.deployment.infrastructure.blr.proxy;

  const tx = await factory.deployProxy(blrProxyAddress, LOAN_CONFIG_ID, 1, rbacs);
  const receipt = await tx.wait();
  const proxyAddress = (await decodeEvent(factory, "ProxyDeployed", receipt)).proxyAddress;

  // Connect commonly used facets to the proxy
  const accessControlFacet = AccessControlFacet__factory.connect(proxyAddress, deployer);
  const pauseFacet = PauseFacet__factory.connect(proxyAddress, deployer);
  const kycFacet = KycFacet__factory.connect(proxyAddress, deployer);
  const controlListFacet = ControlListFacet__factory.connect(proxyAddress, deployer);
  const erc20Facet = ERC20Facet__factory.connect(proxyAddress, deployer);
  const freezeFacet = FreezeFacet__factory.connect(proxyAddress, deployer);
  const capFacet = CapFacet__factory.connect(proxyAddress, deployer);
  const erc1644Facet = ERC1644Facet__factory.connect(proxyAddress, deployer);
  const erc1594Facet = ERC1594Facet__factory.connect(proxyAddress, deployer);
  const erc1410ManagementFacet = ERC1410ManagementFacet__factory.connect(proxyAddress, deployer);
  const erc3643ManagementFacet = ERC3643ManagementFacet__factory.connect(proxyAddress, deployer);
  const erc20VotesFacet = ERC20VotesFacet__factory.connect(proxyAddress, deployer);
  const couponFacet = CouponFacet__factory.connect(proxyAddress, deployer);
  const nominalValueFacet = NominalValueFacet__factory.connect(proxyAddress, deployer);
  const protectedPartitionsFacet = ProtectedPartitionsFacet__factory.connect(proxyAddress, deployer);
  const clearingActionsFacet = ClearingActionsFacet__factory.connect(proxyAddress, deployer);
  const externalKycListManagementFacet = ExternalKycListManagementFacet__factory.connect(proxyAddress, deployer);
  const externalControlListManagementFacet = ExternalControlListManagementFacet__factory.connect(
    proxyAddress,
    deployer,
  );
  const externalPauseManagementFacet = ExternalPauseManagementFacet__factory.connect(proxyAddress, deployer);
  const proceedRecipientsFacet = ProceedRecipientsFacet__factory.connect(proxyAddress, deployer);
  const timeTravelFacet = TimeTravelFacet__factory.connect(proxyAddress, deployer);
  const loanFacet = Loan__factory.connect(proxyAddress, deployer);

  await controlListFacet.initialize_ControlList(securityData.isWhiteList);
  await erc1410ManagementFacet.initialize_ERC1410(securityData.isMultiPartition);
  await erc1644Facet.initialize_ERC1644(securityData.isControllable);
  await erc20Facet.initialize_ERC20({
    info: {
      name: securityData.erc20MetadataInfo.name,
      symbol: securityData.erc20MetadataInfo.symbol,
      decimals: securityData.erc20MetadataInfo.decimals,
      isin: securityData.erc20MetadataInfo.isin,
    },
    securityType: 1, // SecurityType.Equity (reuse for loan)
  });
  await erc1594Facet.initialize_ERC1594();
  await capFacet.initialize_Cap(securityData.maxSupply, []);
  await protectedPartitionsFacet.initialize_ProtectedPartitions(securityData.arePartitionsProtected);
  await clearingActionsFacet.initializeClearing(securityData.clearingActive);
  await externalPauseManagementFacet.initialize_ExternalPauses([]);
  await externalControlListManagementFacet.initialize_ExternalControlLists([]);
  await kycFacet.initializeInternalKyc(securityData.internalKycActivated);
  await externalKycListManagementFacet.initialize_ExternalKycLists([]);
  await erc20VotesFacet.initialize_ERC20Votes(securityData.erc20VotesActivated);
  await erc3643ManagementFacet.initialize_ERC3643(ZeroAddress, ZeroAddress);
  await nominalValueFacet.initialize_NominalValue(
    loanParams?.nominalValue ?? DEFAULT_LOAN_PARAMS.nominalValue,
    loanParams?.nominalValueDecimals ?? DEFAULT_LOAN_PARAMS.nominalValueDecimals,
  );

  await loanFacet.initialize_Loan(
    loanDetails,
    buildRegulationData(regulationData.regulationType, regulationData.regulationSubType),
    {
      countriesControlListType: regulationData.additionalSecurityData.countriesControlListType,
      listOfCountries: regulationData.additionalSecurityData.listOfCountries,
      info: regulationData.additionalSecurityData.info,
    },
  );

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
    erc20Facet,
    freezeFacet,
    capFacet,
    erc1644Facet,
    erc1594Facet,
    erc1410ManagementFacet,
    erc3643ManagementFacet,
    erc20VotesFacet,
    couponFacet,
    nominalValueFacet,
    protectedPartitionsFacet,
    clearingActionsFacet,
    externalKycListManagementFacet,
    externalControlListManagementFacet,
    externalPauseManagementFacet,
    proceedRecipientsFacet,
    timeTravelFacet,
  };
}
