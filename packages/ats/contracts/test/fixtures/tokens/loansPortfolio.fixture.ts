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

import { ZeroAddress } from "ethers";
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
  TimeTravelFacet__factory,
  ILoansPortfolio__factory,
  ILoansPortfolio,
} from "@contract-types";

import { decodeEvent } from "@scripts/infrastructure";
import { DeepPartial } from "@scripts";
import { getRegulationData, getSecurityData } from "@test";

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
}: {
  loanPortfolioParams?: DeepPartial<LoansPortfolioDefaultParamsType>;
  regulationTypeParams?: DeepPartial<FactoryRegulationDataParams>;
  useLoadFixture?: boolean;
} = {}) {
  // Load base infrastructure (BLR + all facets deployed)
  const infrastructure = useLoadFixture
    ? await loadFixture(deployAtsInfrastructureFixture)
    : await deployAtsInfrastructureFixture();
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

  const rbacs = [{ role: ATS_ROLES._DEFAULT_ADMIN_ROLE, members: [deployer.address] }];

  const blrProxyAddress = infrastructure.deployment.infrastructure.blr.proxy;

  const tx = await factory.deployProxy(blrProxyAddress, LOANS_PORTFOLIO_CONFIG_ID, 1, rbacs);
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
  const nominalValueFacet = NominalValueFacet__factory.connect(proxyAddress, deployer);
  const protectedPartitionsFacet = ProtectedPartitionsFacet__factory.connect(proxyAddress, deployer);
  const clearingActionsFacet = ClearingActionsFacet__factory.connect(proxyAddress, deployer);
  const externalKycListManagementFacet = ExternalKycListManagementFacet__factory.connect(proxyAddress, deployer);
  const externalControlListManagementFacet = ExternalControlListManagementFacet__factory.connect(
    proxyAddress,
    deployer,
  );
  const externalPauseManagementFacet = ExternalPauseManagementFacet__factory.connect(proxyAddress, deployer);
  const loanPortfolioFacet = ILoansPortfolio__factory.connect(proxyAddress, deployer);
  const timeTravelFacet = TimeTravelFacet__factory.connect(proxyAddress, deployer);

  await controlListFacet.initializeControlList(securityData.isWhiteList);
  await erc1410ManagementFacet.initialize_ERC1410(securityData.isMultiPartition);
  await erc1644Facet.initialize_ERC1644(securityData.isControllable);
  await erc20Facet.initialize_ERC20({
    info: {
      name: securityData.erc20MetadataInfo.name,
      symbol: securityData.erc20MetadataInfo.symbol,
      decimals: securityData.erc20MetadataInfo.decimals,
      isin: securityData.erc20MetadataInfo.isin,
    },
    securityType: 1, // SecurityType.Equity (reuse for loan portfolio)
  });
  await erc1594Facet.initialize_ERC1594();
  await capFacet.initialize_Cap(securityData.maxSupply, []);
  await protectedPartitionsFacet.initialize_ProtectedPartitions(securityData.arePartitionsProtected);
  await clearingActionsFacet.initializeClearing(securityData.clearingActive);
  await externalPauseManagementFacet.initialize_ExternalPauses([]);
  await externalControlListManagementFacet.initialize_ExternalControlLists([]);
  await kycFacet.initializeInternalKyc(securityData.internalKycActivated);
  await externalKycListManagementFacet.initialize_ExternalKycLists([]);
  await erc20VotesFacet.initialize_ERC20Votes(false);
  await erc3643ManagementFacet.initialize_ERC3643(ZeroAddress, ZeroAddress);
  await nominalValueFacet.initialize_NominalValue(
    loanPortfolioDetails.nominalValue,
    loanPortfolioDetails.nominalValueDecimals,
  );
  await loanPortfolioFacet.initializeLoansPortfolio(
    {
      portfolioType: loanPortfolioDetails.portfolioType,
      distributionPolicy: loanPortfolioDetails.distributionPolicy,
    },
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
  };
}
