// SPDX-License-Identifier: Apache-2.0

/**
 * Core ATS infrastructure fixtures.
 *
 * Provides base deployment fixtures for:
 * - ProxyAdmin (upgrade management)
 * - BusinessLogicResolver (BLR) with facet registry
 * - Factory for token deployment
 * - All registered facets (equity and bond configurations)
 *
 * Uses Hardhat Network Helpers loadFixture pattern for efficient test setup.
 * Each fixture is executed once and snapshotted, subsequent calls restore state.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { ethers } from "hardhat";
import { deploySystemWithNewBlr, configureLogger, LogLevel } from "../../scripts";
import { Factory__factory, BusinessLogicResolver__factory, ProxyAdmin__factory } from "@contract-types";
import type { IFactory, BusinessLogicResolver, ProxyAdmin } from "@contract-types";

/**
 * Fixture: Deploy complete ATS infrastructure
 *
 * Deploys: ProxyAdmin, BLR, Factory, all Facets, Equity & Bond configurations
 *
 * @param useTimeTravel - Use TimeTravel facet variants (default: true for tests)
 * @returns Complete deployment output + test utilities including separated equity/bond facet addresses
 */
export async function deployAtsInfrastructureFixture(useTimeTravel = true, partialBatchDeploy = false, batchSize = 2) {
  // Configure logger to SILENT for tests (suppress all deployment logs)
  configureLogger({ level: LogLevel.SILENT });

  // Get signers from Hardhat
  const signers = await ethers.getSigners();
  const [deployer, user1, user2, user3, user4, user5] = signers;
  const unknownSigner = signers.at(-1)!;

  // Deploy system with new BLR using new scripts with signer
  // Network config automatically sets: confirmations=0, enableRetry=false, verifyDeployment=false for hardhat
  const deployment = await deploySystemWithNewBlr(deployer, "hardhat", {
    useTimeTravel,
    saveOutput: false, // Don't save deployment files during tests
    partialBatchDeploy,
    batchSize,
  });

  // Get typed contract instances using TypeChain factories
  const factory = Factory__factory.connect(deployment.infrastructure.factory.proxy, deployer) as IFactory;

  const blr = BusinessLogicResolver__factory.connect(
    deployment.infrastructure.blr.proxy,
    deployer,
  ) as BusinessLogicResolver;

  const proxyAdmin = ProxyAdmin__factory.connect(deployment.infrastructure.proxyAdmin.address, deployer) as ProxyAdmin;

  return {
    // Signers
    signers,
    deployer,
    user1,
    user2,
    user3,
    user4,
    user5,
    unknownSigner,

    // Core infrastructure
    factory,
    blr,
    proxyAdmin,

    // Deployment metadata
    deployment,

    // Facet keys (useful for verification)
    facetKeys: deployment.facets.reduce(
      (acc, f) => {
        acc[f.name] = f.key;
        return acc;
      },
      {} as Record<string, string>,
    ),
    equityFacetKeys: deployment.helpers.getEquityFacets().reduce(
      (acc, f) => {
        acc[f.name] = f.key;
        return acc;
      },
      {} as Record<string, string>,
    ),
    bondFacetKeys: deployment.helpers.getBondFacets().reduce(
      (acc, f) => {
        acc[f.name] = f.key;
        return acc;
      },
      {} as Record<string, string>,
    ),
  };
}
