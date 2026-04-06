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
import { ATS_ROLES, createLoanConfiguration, LOAN_CONFIG_ID } from "@scripts/domain";
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
  Factory__factory,
  Loan__factory,
} from "@contract-types";

import { decodeEvent } from "@scripts/infrastructure";
import { DeepPartial } from "@scripts";

/**
 * Default loan token parameters for test fixtures.
 */
export const DEFAULT_LOAN_PARAMS = {
  name: "TESTLOAN",
  symbol: "TLN",
  isin: isinGenerator(),
  decimals: 0,
  maxSupply: ethers.MaxUint256,
  isWhiteList: false,
  isControllable: true,
  arePartitionsProtected: false,
  isMultiPartition: false,
  clearingActive: false,
  internalKycActivated: true,
  nominalValue: 100,
  nominalValueDecimals: 2,
  erc20VotesActivated: false,
} as const;

interface LoanInitData {
  startingDate: number;
  maturityDate: number;
  signingDate: number;
  originatorAccount: string;
  servicerAccount: string;
}

interface DeployLoanTokenFixtureParams {
  name: string;
  symbol: string;
  isin: string;
  decimals: number;
  maxSupply: ethersTypes.BigNumberish;
  isWhiteList: boolean;
  isControllable: boolean;
  arePartitionsProtected: boolean;
  isMultiPartition: boolean;
  clearingActive: boolean;
  internalKycActivated: boolean;
  nominalValueDecimals: number;
  erc20VotesActivated: boolean;
  loanInit: LoanInitData;
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
export async function deployLoanTokenFixture(params: DeepPartial<DeployLoanTokenFixtureParams> = {}) {
  // Merge with defaults
  const p = {
    ...DEFAULT_LOAN_PARAMS,
    ...params,
  };

  // Load base infrastructure (BLR + all facets deployed)
  const infrastructure = await loadFixture(deployAtsInfrastructureFixture);
  const { blr, deployer, factory } = infrastructure;

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

  await controlListFacet.initialize_ControlList(p.isWhiteList);
  await erc1410ManagementFacet.initialize_ERC1410(p.isMultiPartition);
  await erc1644Facet.initialize_ERC1644(p.isControllable);
  await erc20Facet.initialize_ERC20({
    info: { name: p.name, symbol: p.symbol, decimals: p.decimals, isin: p.isin },
    securityType: 1, // SecurityType.Equity (reuse for loan)
  });
  await erc1594Facet.initialize_ERC1594();
  await capFacet.initialize_Cap(p.maxSupply, []);
  await protectedPartitionsFacet.initialize_ProtectedPartitions(p.arePartitionsProtected);
  await clearingActionsFacet.initializeClearing(p.clearingActive);
  await externalPauseManagementFacet.initialize_ExternalPauses([]);
  await externalControlListManagementFacet.initialize_ExternalControlLists([]);
  await kycFacet.initializeInternalKyc(p.internalKycActivated);
  await externalKycListManagementFacet.initialize_ExternalKycLists([]);
  await erc20VotesFacet.initialize_ERC20Votes(p.erc20VotesActivated);
  await erc3643ManagementFacet.initialize_ERC3643(ZeroAddress, ZeroAddress);
  await nominalValueFacet.initialize_NominalValue(p.nominalValue, p.nominalValueDecimals);
  const now = Math.floor(Date.now() / 1000);
  const loanInit = {
    startingDate: p.loanInit?.startingDate ?? now + 3600,
    maturityDate: p.loanInit?.maturityDate ?? now + 3600 + 100_000,
    signingDate: p.loanInit?.signingDate ?? now + 1800,
    originatorAccount: p.loanInit?.originatorAccount ?? deployer.address,
    servicerAccount: p.loanInit?.servicerAccount ?? deployer.address,
  };
  const loanDetailsData = {
    loanBasicData: {
      currency: "0x555344",
      startingDate: loanInit.startingDate,
      maturityDate: loanInit.maturityDate,
      loanStructureType: 1,
      repaymentType: 0,
      interestType: 0,
      signingDate: loanInit.signingDate,
      originatorAccount: loanInit.originatorAccount,
      servicerAccount: loanInit.servicerAccount,
    },
    loanInterestData: {
      baseReferenceRate: 0,
      floorRate: 0,
      capRate: 0,
      rateMargin: 0,
      dayCount: 0,
      paymentFrequency: 0,
      firstAccrualDate: now + 3600,
      prepaymentPenalty: 0,
      commitmentFee: 0,
      utilizationFee: 0,
      utilizationFeeType: 0,
      servicingFee: 0,
    },
    riskData: {
      internalRiskGrade: "test",
      defaultProbability: 0,
      lossGivenDefault: 0,
    },
    collateral: {
      totalCollateralValue: 0,
      loanToValue: 0,
    },
    loanPerformanceStatus: {
      performanceStatus: 0,
      daysPastDue: 0,
    },
  };
  const regulationData = {
    regulationType: 1,
    regulationSubType: 0,
    dealSize: 0,
    accreditedInvestors: 1,
    maxNonAccreditedInvestors: 0,
    manualInvestorVerification: 1,
    internationalInvestors: 1,
    resaleHoldPeriod: 0,
  };
  const additionalSecurityData = {
    countriesControlListType: true,
    listOfCountries: "US",
    info: "test",
    country: "US",
  };
  await loanFacet.initialize_Loan(loanDetailsData, regulationData, additionalSecurityData);

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
