// SPDX-License-Identifier: Apache-2.0

/**
 * Loan Portfolio token test fixtures.
 *
 * Provides fixtures for deploying loan portfolio tokens using TestFactory
 * for isolated testing without production factory overhead.
 *
 * TestFactory.deployProxy() creates ResolverProxy without calling any
 * initialize methods, giving tests full control over facet initialization.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { ZeroAddress, ethers as ethersTypes } from "ethers";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture } from "../infrastructure.fixture";
import {
  ATS_ROLES,
  buildRegulationData,
  createLoansPortfolioConfiguration,
  FactoryRegulationDataParams,
  LOANS_PORTFOLIO_CONFIG_ID,
} from "@scripts/domain";
import {
  AccessControlFacet__factory,
  CapFacet__factory,
  ControlListFacet__factory,
  NominalValueFacet__factory,
  CoreFacet__factory,
  ERC20VotesFacet__factory,
  ControllerFacet__factory,
  MintFacet__factory,
  FreezeFacet__factory,
  KycFacet__factory,
  PauseFacet__factory,
  ProtectedPartitionsFacet__factory,
  ClearingFacet__factory,
  ExternalKycListManagementFacet__factory,
  ExternalControlListManagementFacet__factory,
  ExternalPauseManagementFacet__factory,
  ILoansPortfolio__factory,
  ILoansPortfolio,
  InitializerFacet__factory,
  IDiamondFacet__factory,
  IAsset,
} from "@contract-types";
import { decodeEvent } from "@scripts/infrastructure";
import { DeepPartial } from "@scripts";
import { getRegulationData, getSecurityData, TEST_NOMINAL_VALUES } from "@test";

type LoansPortfolioDefaultParamsType = ILoansPortfolio.LoansPortfolioDetailsDataStruct & {
  nominalValue: bigint;
  nominalValueDecimals: number;
};
/**
 * Default loan portfolio token parameters for test fixtures.
 */
export const DEFAULT_LOANS_PORTFOLIO_PARAMS = {
  nominalValue: 100,
  nominalValueDecimals: 2,
  portfolioType: 1, // STATIC
  distributionPolicy: 1, // DIRECT_PASSTHROUGH
} as const;

export function getLoansPortfolioDetails(params?: DeepPartial<LoansPortfolioDefaultParamsType>) {
  return {
    portfolioType: params?.portfolioType ?? DEFAULT_LOANS_PORTFOLIO_PARAMS.portfolioType,
    distributionPolicy: params?.distributionPolicy ?? DEFAULT_LOANS_PORTFOLIO_PARAMS.distributionPolicy,
    nominalValue: params?.nominalValue ?? DEFAULT_LOANS_PORTFOLIO_PARAMS.nominalValue,
    nominalValueDecimals: params?.nominalValueDecimals ?? DEFAULT_LOANS_PORTFOLIO_PARAMS.nominalValueDecimals,
  };
}

/**
 * Fixture: Deploy ATS infrastructure + single Loan Portfolio token via TestFactory
 *
 * Extends deployAtsInfrastructureFixture with:
 * - Loan Portfolio BLR configuration registration
 * - TestFactory deployment
 * - ResolverProxy deployment via TestFactory.deployProxy()
 * - Manual facet initialization with test-specific values
 *
 * @param params - Optional custom loan portfolio token parameters
 * @returns Infrastructure + deployed loan portfolio token + connected facets
 */
export async function deployLoansPortfolioTokenFixture({
  loanPortfolioParams,
  regulationTypeParams,
  useLoadFixture = true,
  infrastructure: providedInfrastructure,
}: {
  loanPortfolioParams?: DeepPartial<LoansPortfolioDefaultParamsType>;
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
    resolverProxyConfiguration: {
      key: LOANS_PORTFOLIO_CONFIG_ID,
      version: 1,
    },
  });

  // Merge with defaults
  const loanPortfolioDetails = getLoansPortfolioDetails(loanPortfolioParams);
  const regulationData = getRegulationData(regulationTypeParams);
  // Build facet addresses map from deployment.facets array
  const facetAddresses: Record<string, string> = {};
  for (const facet of infrastructure.deployment.facets) {
    facetAddresses[facet.name] = facet.address;
  }

  await createLoansPortfolioConfiguration(blr, facetAddresses, true);

  const rbacs = [{ role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [deployer.address] }];

  const blrProxyAddress = infrastructure.deployment.infrastructure.blr.proxy;

  const tx = await factory.deployProxy(blrProxyAddress, LOANS_PORTFOLIO_CONFIG_ID, 1, rbacs, "0x");
  const receipt = await tx.wait();
  const proxyAddress = (await decodeEvent(factory, "ProxyDeployed", receipt)).proxyAddress;

  // Common facets connects (pointing to proxy)
  const accessControlFacet = AccessControlFacet__factory.connect(proxyAddress, deployer);
  const pauseFacet = PauseFacet__factory.connect(proxyAddress, deployer);
  const kycFacet = KycFacet__factory.connect(proxyAddress, deployer);
  const controlListFacet = ControlListFacet__factory.connect(proxyAddress, deployer);
  const coreFacet = CoreFacet__factory.connect(proxyAddress, deployer);
  const capFacet = CapFacet__factory.connect(proxyAddress, deployer);
  const controllerFacet = ControllerFacet__factory.connect(proxyAddress, deployer);
  const mintFacet = MintFacet__factory.connect(proxyAddress, deployer);
  const erc20VotesFacet = ERC20VotesFacet__factory.connect(proxyAddress, deployer);
  const nominalValueFacet = NominalValueFacet__factory.connect(proxyAddress, deployer);
  const protectedPartitionsFacet = ProtectedPartitionsFacet__factory.connect(proxyAddress, deployer);
  const clearingFacet = ClearingFacet__factory.connect(proxyAddress, deployer);
  const externalKycListManagementFacet = ExternalKycListManagementFacet__factory.connect(proxyAddress, deployer);
  const externalControlListManagementFacet = ExternalControlListManagementFacet__factory.connect(
    proxyAddress,
    deployer,
  );
  const externalPauseManagementFacet = ExternalPauseManagementFacet__factory.connect(proxyAddress, deployer);
  const loanPortfolioFacet = ILoansPortfolio__factory.connect(proxyAddress, deployer);

  const initializerFacet = InitializerFacet__factory.connect(proxyAddress, deployer);
  const diamondFacet = IDiamondFacet__factory.connect(proxyAddress, deployer);
  const asset = await ethers.getContractAt("IAsset", proxyAddress, deployer);

  await controlListFacet.initializeControlList(securityData.isWhiteList);
  await controllerFacet.initializeController(securityData.isControllable);
  await coreFacet.initializeCore({
    info: {
      name: securityData.erc20MetadataInfo.name,
      symbol: securityData.erc20MetadataInfo.symbol,
      decimals: securityData.erc20MetadataInfo.decimals,
      isin: securityData.erc20MetadataInfo.isin,
    },
    securityType: 1, // SecurityType.Equity (reuse for loan portfolio)
  });
  await mintFacet.initializeERC1594();
  await capFacet.initializeCap(securityData.maxSupply, []);
  await protectedPartitionsFacet.initializeProtectedPartitions(securityData.arePartitionsProtected);
  await clearingFacet.initializeClearing(securityData.clearingActive);
  await externalPauseManagementFacet.initializeExternalPauses([]);
  await externalControlListManagementFacet.initializeExternalControlLists([]);
  await kycFacet.initializeInternalKyc(securityData.internalKycActivated);
  await externalKycListManagementFacet.initializeExternalKycLists([]);
  await erc20VotesFacet.initializeERC20Votes(false);
  // Loan portfolios don't carry a per-token currency; pass bytes3(0).
  await nominalValueFacet.initializeNominalValue(
    loanPortfolioDetails.nominalValue,
    loanPortfolioDetails.nominalValueDecimals,
    TEST_NOMINAL_VALUES.CURRENCY_ZERO,
  );
  await loanPortfolioFacet.initializeLoansPortfolio({
    portfolioType: loanPortfolioDetails.portfolioType,
    distributionPolicy: loanPortfolioDetails.distributionPolicy,
  });
  await diamondFacet.initializeDiamondCut();
  await accessControlFacet.initializeAccessControl();

  // Initialize remaining registered facets so setOperationalStatus() passes.
  await asset.initializeTransferAndLock();
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
  await asset.initializeTransferByPartition();
  await asset.initializeBalanceTrackerAtSnapshot();
  await asset.initializePartitions(securityData.isMultiPartition);
  await asset.initializeBalanceTrackerByPartition();
  await asset.initializeSsiManagement();
  await asset.initializeOperatorByPartition();
  await asset.initializeScheduledCrossOrderedTasks();
  await asset.initializeCorporateActions();
  await asset.initializeMintByPartition();
  await asset.initializeClearingAtSnapshotByPartition();
  await asset.initializeBatchController();
  await asset.initializeCoreAtSnapshot();
  await asset.initializeComplianceByPartition();
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
  await asset.initializeNonces();
  await asset.initializeEvmAccessors();

  await initializerFacet.connect(deployer).initializeInitializer(150);
  await initializerFacet.connect(deployer).setOperationalStatus();

  return {
    ...infrastructure,

    // TestFactory
    testFactory: factory,

    // Token
    tokenAddress: proxyAddress,

    // Connected facets
    accessControlFacet: AccessControlFacet__factory.connect(proxyAddress, deployer),
    pauseFacet: PauseFacet__factory.connect(proxyAddress, deployer),
    kycFacet: KycFacet__factory.connect(proxyAddress, deployer),
    controlListFacet: ControlListFacet__factory.connect(proxyAddress, deployer),
    asset,
  };
}
