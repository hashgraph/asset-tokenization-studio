// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test fixtures.
 *
 * Lightweight fixtures for integration tests that don't need the full system.
 * Provides:
 * - BLR deployed and initialized
 * - BLR + Common facets registered
 *
 * Uses Hardhat's loadFixture for snapshot/restore performance.
 */

import { ethers } from "hardhat";
import { BusinessLogicResolver__factory } from "@contract-types";
import type { BusinessLogicResolver } from "@contract-types";
import { deployContract, deployProxy, registerFacets } from "@scripts/infrastructure";
import { atsRegistry } from "@scripts/domain";
import {
  deployOrchestratorLibraries,
  getFacetLibraryLinks,
  LIBRARY_DEPENDENT_FACETS,
  hasOrchestratorLibraryAddresses,
  getOrchestratorLibraryAddresses,
  type OrchestratorLibraryAddresses,
} from "@scripts/domain";
import type { Signer } from "ethers";

/**
 * Cached orchestrator library addresses for test fixtures.
 * Deployed once and reused across fixtures.
 */
let _cachedLibraryAddresses: OrchestratorLibraryAddresses | null = null;

/**
 * Deploy and cache orchestrator libraries for tests.
 * Libraries are deployed once per test session and reused.
 */
async function getOrDeployLibraries(signer: Signer): Promise<OrchestratorLibraryAddresses> {
  if (!_cachedLibraryAddresses) {
    if (hasOrchestratorLibraryAddresses()) {
      _cachedLibraryAddresses = getOrchestratorLibraryAddresses();
    } else {
      _cachedLibraryAddresses = await deployOrchestratorLibraries(signer);
    }
  }
  return _cachedLibraryAddresses;
}

/**
 * Deploy and initialize BLR
 */
export async function deployBlrFixture() {
  const [deployer] = await ethers.getSigners();

  // Deploy BLR with proxy
  const implementationFactory = await ethers.getContractFactory("BusinessLogicResolver", deployer);
  const blrResult = await deployProxy(deployer, {
    implementationFactory,
    confirmations: 0, // No confirmations needed for Hardhat
    verifyDeployment: false, // No verification needed for tests
  });

  // Get contract instance and initialize
  const blr = BusinessLogicResolver__factory.connect(blrResult.proxyAddress, deployer) as BusinessLogicResolver;
  await blr.initialize_BusinessLogicResolver();

  return {
    deployer,
    blr,
    blrAddress: blrResult.proxyAddress,
  };
}

/**
 * BLR + Common facets registered (AccessControl, Kyc, Pause)
 */
export async function registerCommonFacetsFixture() {
  const base = await deployBlrFixture();
  const { deployer, blr } = base;

  // Deploy common facets
  const facetNames = ["AccessControlFacet", "KycFacet", "PauseFacet"];
  const facetAddresses: Record<string, string> = {};

  for (const name of facetNames) {
    const factory = await ethers.getContractFactory(name, deployer);
    const result = await deployContract(factory, {
      confirmations: 0, // No confirmations needed for Hardhat
      verifyDeployment: false, // No verification needed for tests
    });
    facetAddresses[name] = result.address!;
  }

  // Prepare facet data with resolver keys
  const facetsWithKeys = facetNames.map((name) => {
    const facetDef = atsRegistry.getFacetDefinition(name);
    if (!facetDef?.resolverKey?.value) {
      throw new Error(`No resolver key found for ${name}`);
    }
    return {
      name,
      address: facetAddresses[name],
      resolverKey: facetDef.resolverKey.value,
    };
  });

  // Register facets
  await registerFacets(blr, {
    facets: facetsWithKeys,
  });

  return {
    ...base,
    facetNames,
    facetAddresses,
    facetsWithKeys,
  };
}

/**
 * BLR + TransferFacet registered for testing SelectorAlreadyRegistered error.
 *
 * Provides a fixture for testing duplicate selector detection:
 * - BLR with proxy
 * - AccessControlFacet, KycFacet, PauseFacet (common facets)
 * - TransferFacet (has transfer.selector = 0xa9059cbb)
 *
 * Use this fixture together with DuplicateSelectorFacetTest to verify that
 * the SelectorAlreadyRegistered error is thrown when two facets share the same selector.
 */
export async function registerTransferFacetFixture() {
  const base = await registerCommonFacetsFixture();
  const { deployer, blr, facetAddresses } = base;

  // Deploy orchestrator libraries first (required for TransferFacet)
  await getOrDeployLibraries(deployer);

  // Deploy TransferFacet with library linking - only TokenCoreOps needed
  const transferLibraryLinks = getFacetLibraryLinks("TransferFacet");
  const transferFactory = await ethers.getContractFactory("TransferFacet", {
    signer: deployer,
    libraries: transferLibraryLinks,
  });
  const transferResult = await deployContract(transferFactory as any, {
    confirmations: 0,
    verifyDeployment: false,
  });
  const transferFacetAddress = transferResult.address!;

  // Get resolver key for TransferFacet
  const transferFacetDef = atsRegistry.getFacetDefinition("TransferFacet");
  if (!transferFacetDef?.resolverKey?.value) {
    throw new Error("No resolver key found for TransferFacet");
  }

  // Register TransferFacet in BLR
  await registerFacets(blr, {
    facets: [
      {
        name: "TransferFacet",
        address: transferFacetAddress,
        resolverKey: transferFacetDef.resolverKey.value,
      },
    ],
  });

  return {
    ...base,
    facetAddresses: {
      ...facetAddresses,
      TransferFacet: transferFacetAddress,
    },
    transferFacetAddress,
    transferResolverKey: transferFacetDef.resolverKey.value,
  };
}

/**
 * BLR + Common facets + MigrationFacetTest registered.
 *
 * Provides a fixture for testing ERC20 storage migration:
 * - BLR with proxy
 * - Common facets (AccessControl, Kyc, Pause)
 * - MigrationFacetTest with legacy balance/totalSupply setters
 *
 * Use this fixture when you need to:
 * 1. Set up legacy ERC1410 storage with balances and totalSupply
 * 2. Trigger migration via transfer operations
 * 3. Verify legacy storage is cleared and new storage has values
 */
export async function registerMigrationFacetFixture() {
  const base = await registerCommonFacetsFixture();
  const { deployer, blr, facetAddresses } = base;

  // Deploy MigrationFacetTest
  const factory = await ethers.getContractFactory("MigrationFacetTest", deployer);
  const result = await deployContract(factory, {
    confirmations: 0,
    verifyDeployment: false,
  });
  const migrationFacetAddress = result.address!;

  // Prepare facet data with resolver key
  const facetDef = atsRegistry.getFacetDefinition("MigrationFacetTest");
  if (!facetDef?.resolverKey?.value) {
    throw new Error("No resolver key found for MigrationFacetTest");
  }
  const migrationFacetWithKey = {
    name: "MigrationFacetTest",
    address: migrationFacetAddress,
    resolverKey: facetDef.resolverKey.value,
  };

  // Register MigrationFacetTest in BLR
  await registerFacets(blr, {
    facets: [migrationFacetWithKey],
  });

  // Create a configuration that includes MigrationFacetTest
  // Use a unique config ID for migration tests
  const MIGRATION_TEST_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000055";
  const facetConfigs = [
    ...Object.entries(facetAddresses).map(([name]) => {
      const def = atsRegistry.getFacetDefinition(name);
      return { id: def!.resolverKey!.value, version: 1 };
    }),
    { id: facetDef.resolverKey.value, version: 1 },
  ];
  await blr.createConfiguration(MIGRATION_TEST_CONFIG_ID, facetConfigs);

  return {
    ...base,
    facetAddresses: {
      ...facetAddresses,
      MigrationFacetTest: migrationFacetAddress,
    },
    migrationFacet: factory.attach(migrationFacetAddress) as any,
    migrationConfigId: MIGRATION_TEST_CONFIG_ID,
  };
}
