// SPDX-License-Identifier: Apache-2.0

/**
 * Upgrade Configurations workflow test fixtures.
 *
 * Provides test fixtures for testing the upgradeConfigurations workflow:
 * - Deploy initial BLR with version 1 configurations (baseline)
 * - Deploy sample Equity/Bond tokens for proxy update testing
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { deployAtsInfrastructureFixture } from "./infrastructure.fixture";
import { configureLogger, LogLevel } from "@scripts/infrastructure";
import { deployEquityFromFactory, deployBondFromFactory, BOND_CONFIG_ID } from "@scripts/domain";
import { getSecurityData, getRegulationData } from "./tokens/common.fixture";
import { getEquityDetails } from "./tokens/equity.fixture";
import { getBondDetails } from "./tokens/bond.fixture";
import { DiamondFacet__factory } from "@contract-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { BusinessLogicResolver, IFactory, ProxyAdmin, DiamondFacet, ResolverProxy } from "@contract-types";

/**
 * Result of deploying the upgrade test environment.
 */
export interface UpgradeTestFixtureResult {
  // Signers
  deployer: HardhatEthersSigner;
  unknownSigner: HardhatEthersSigner;

  // Core infrastructure
  blr: BusinessLogicResolver;
  blrAddress: string;
  factory: IFactory;
  proxyAdmin: ProxyAdmin;

  // Initial configuration versions
  initialEquityVersion: number;
  initialBondVersion: number;
  equityConfigId: string;
  bondConfigId: string;

  // Deployed token proxies for testing updates
  equityTokenProxy: ResolverProxy;
  equityTokenAddress: string;
  equityDiamondCut: DiamondFacet;

  bondTokenProxy: ResolverProxy;
  bondTokenAddress: string;
  bondDiamondCut: DiamondFacet;

  // Facet addresses from initial deployment
  facetAddresses: Record<string, string>;
}

/**
 * Deploy complete infrastructure + sample tokens for upgrade testing.
 *
 * Creates a test environment with:
 * 1. Full ATS infrastructure (BLR, Factory, all facets, configurations)
 * 2. One deployed Equity token (ResolverProxy)
 * 3. One deployed Bond token (ResolverProxy)
 *
 * This allows testing:
 * - Upgrading configurations without affecting existing tokens
 * - Upgrading existing tokens to new configuration versions
 * - Partial failure scenarios (some tokens fail to update)
 *
 * @returns Complete test fixture with infrastructure and sample tokens
 */
export async function deployUpgradeTestFixture(): Promise<UpgradeTestFixtureResult> {
  // Configure logger to SILENT for tests
  configureLogger({ level: LogLevel.SILENT });

  // Deploy full ATS infrastructure
  const infrastructure = await deployAtsInfrastructureFixture(true, false);

  const { deployer, unknownSigner, blr, factory, proxyAdmin, deployment } = infrastructure;

  // Extract configuration info from deployment
  const equityConfigId = deployment.configurations.equity.configId;
  const bondConfigId = deployment.configurations.bond.configId;
  const initialEquityVersion = deployment.configurations.equity.version;
  const initialBondVersion = deployment.configurations.bond.version;

  // Build facet addresses map
  const facetAddresses: Record<string, string> = {};
  for (const facet of deployment.facets) {
    facetAddresses[facet.name] = facet.address;
  }

  // Deploy sample Equity token via Factory
  const equitySecurityData = getSecurityData(blr);
  const equityDetails = getEquityDetails();
  const equityRegulationData = getRegulationData();

  const equityTokenProxy = await deployEquityFromFactory(
    {
      adminAccount: deployer.address,
      factory,
      securityData: equitySecurityData,
      equityDetails,
    },
    equityRegulationData,
  );

  const equityTokenAddress = await equityTokenProxy.getAddress();
  const equityDiamondCut = DiamondFacet__factory.connect(equityTokenAddress, deployer);

  // Deploy sample Bond token via Factory
  const bondSecurityData = getSecurityData(blr, {
    resolverProxyConfiguration: {
      key: BOND_CONFIG_ID,
      version: 1,
    },
  });
  const bondDetails = await getBondDetails();
  const bondRegulationData = getRegulationData();

  const bondTokenProxy = await deployBondFromFactory(
    {
      adminAccount: deployer.address,
      factory,
      securityData: bondSecurityData,
      bondDetails,
      proceedRecipients: [],
      proceedRecipientsData: [],
    },
    bondRegulationData,
  );

  const bondTokenAddress = await bondTokenProxy.getAddress();
  const bondDiamondCut = DiamondFacet__factory.connect(bondTokenAddress, deployer);

  return {
    // Signers
    deployer,
    unknownSigner,

    // Core infrastructure
    blr,
    blrAddress: await blr.getAddress(),
    factory,
    proxyAdmin,

    // Initial configuration versions
    initialEquityVersion,
    initialBondVersion,
    equityConfigId,
    bondConfigId,

    // Deployed token proxies
    equityTokenProxy,
    equityTokenAddress,
    equityDiamondCut,

    bondTokenProxy,
    bondTokenAddress,
    bondDiamondCut,

    // Facet addresses
    facetAddresses,
  };
}

/**
 * Deploy infrastructure only (no tokens) for basic upgrade testing.
 *
 * Lighter weight fixture when proxy update testing is not needed.
 *
 * @returns Infrastructure fixture without sample tokens
 */
export async function deployUpgradeInfrastructureOnlyFixture() {
  // Configure logger to SILENT for tests
  configureLogger({ level: LogLevel.SILENT });

  // Deploy full ATS infrastructure
  const infrastructure = await deployAtsInfrastructureFixture(true, false);

  const { deployer, unknownSigner, blr, factory, proxyAdmin, deployment } = infrastructure;

  // Extract configuration info
  const equityConfigId = deployment.configurations.equity.configId;
  const bondConfigId = deployment.configurations.bond.configId;
  const initialEquityVersion = deployment.configurations.equity.version;
  const initialBondVersion = deployment.configurations.bond.version;

  // Build facet addresses map
  const facetAddresses: Record<string, string> = {};
  for (const facet of deployment.facets) {
    facetAddresses[facet.name] = facet.address;
  }

  return {
    deployer,
    unknownSigner,
    blr,
    blrAddress: await blr.getAddress(),
    factory,
    proxyAdmin,
    initialEquityVersion,
    initialBondVersion,
    equityConfigId,
    bondConfigId,
    facetAddresses,
    deployment,
  };
}
