// SPDX-License-Identifier: Apache-2.0

/**
 * ResolverProxy test fixtures.
 *
 * Lightweight fixtures for testing ResolverProxy operations.
 * Builds on deployBlrFixture using composition pattern.
 *
 * **Version Architecture Note:**
 * The ResolverProxy stores a version number that must correspond to a version
 * registered in the BLR's configuration. To update to version N, there must
 * be a configuration at version N in the BLR (created via createConfiguration).
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { ethers } from "hardhat";
import { ZeroHash } from "ethers";
import { deployBlrFixture } from "./integration.fixture";
import { deployContract, registerFacets } from "@scripts/infrastructure";
import { atsRegistry } from "@scripts/domain";
import {
  DiamondFacet__factory,
  AccessControlFacet__factory,
  BusinessLogicResolver__factory,
  ResolverProxy__factory,
} from "@contract-types";
import type { BusinessLogicResolver, DiamondFacet, AccessControlFacet, ResolverProxy } from "@contract-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Test configuration ID.
 * Uses bytes32(0x99) to avoid conflicts with EQUITY (0x01) and BOND (0x02) config IDs.
 */
export const TEST_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000099";

/**
 * Alternative test configuration ID for testing config updates.
 */
export const ALT_CONFIG_ID = "0x00000000000000000000000000000000000000000000000000000000000000aa";

/**
 * Maximum version available in the test configuration.
 * The fixture creates configurations at versions 1 and 2.
 */
export const MAX_TEST_VERSION = 2;

/**
 * Fixture result for ResolverProxy deployment.
 */
export interface ResolverProxyFixtureResult {
  /** Deployer signer with DEFAULT_ADMIN_ROLE */
  deployer: HardhatEthersSigner;
  /** Unknown signer without any roles (for access control tests) */
  unknownSigner: HardhatEthersSigner;
  /** BusinessLogicResolver contract instance */
  blr: BusinessLogicResolver;
  /** BLR proxy address */
  blrAddress: string;
  /** Deployed ResolverProxy contract */
  resolverProxy: ResolverProxy;
  /** ResolverProxy address */
  proxyAddress: string;
  /** DiamondCutFacet interface connected to proxy */
  diamondCutFacet: DiamondFacet;
  /** AccessControlFacet interface connected to proxy */
  accessControlFacet: AccessControlFacet;
  /** Deployed facet addresses by name */
  facetAddresses: Record<string, string>;
  /** Initial configuration ID used for deployment */
  configId: string;
  /** Initial version used for deployment */
  initialVersion: number;
  /** Maximum version available in the BLR configuration */
  maxVersion: number;
}

/**
 * Deploy BLR + minimal facets + ResolverProxy.
 *
 * Creates a lightweight test environment for ResolverProxy operations:
 * - Deploys BLR with proxy
 * - Deploys minimal required facets (DiamondCutFacet, DiamondFacet, AccessControlFacet)
 * - Registers facets in BLR
 * - Creates test configuration in BLR
 * - Deploys ResolverProxy pointing to the configuration
 *
 * @returns Fixture with deployed contracts and test utilities
 */
export async function deployResolverProxyFixture(): Promise<ResolverProxyFixtureResult> {
  const base = await deployBlrFixture();
  const { deployer, blr, blrAddress } = base;

  // Get additional signers for access control tests
  const signers = await ethers.getSigners();
  const unknownSigner = signers.at(-1)!;

  // Deploy minimal required facets for ResolverProxy
  const facetNames = ["DiamondFacet", "AccessControlFacet"];
  const facetAddresses: Record<string, string> = {};

  for (const name of facetNames) {
    const factory = await ethers.getContractFactory(name, deployer);
    const result = await deployContract(factory, {
      confirmations: 0,
      verifyDeployment: false,
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

  // Register facets in BLR
  await registerFacets(blr, { facets: facetsWithKeys });

  // Create configuration at version 1 with registered facets
  const facetConfigs = facetsWithKeys.map((f) => ({
    id: f.resolverKey,
    version: 1,
  }));
  await blr.createConfiguration(TEST_CONFIG_ID, facetConfigs);

  // Create configuration at version 2 (same facets, allows version upgrades)
  // Note: BLR configurations are versioned - to update proxy to version 2,
  // there must be a configuration at version 2 in the BLR
  await blr.createConfiguration(TEST_CONFIG_ID, facetConfigs);

  // Deploy ResolverProxy pointing to BLR and test configuration
  const initialVersion = 1;
  const resolverProxy = await new ResolverProxy__factory(deployer).deploy(
    blrAddress,
    TEST_CONFIG_ID,
    initialVersion,
    [{ role: ZeroHash, members: [deployer.address] }], // Grant DEFAULT_ADMIN_ROLE
  );
  await resolverProxy.waitForDeployment();

  // Connect facet interfaces to proxy for convenient access
  const diamondCutFacet = DiamondFacet__factory.connect(resolverProxy.target as string, deployer);
  const accessControlFacet = AccessControlFacet__factory.connect(resolverProxy.target as string, deployer);

  return {
    deployer,
    unknownSigner,
    blr,
    blrAddress,
    resolverProxy,
    proxyAddress: resolverProxy.target as string,
    diamondCutFacet,
    accessControlFacet,
    facetAddresses,
    configId: TEST_CONFIG_ID,
    initialVersion,
    maxVersion: MAX_TEST_VERSION,
  };
}

/**
 * Deploy ResolverProxy fixture with alternative configuration.
 *
 * Extends the base fixture by creating an additional configuration in BLR
 * that can be used for testing config update operations.
 *
 * @returns Fixture with both initial and alternative configurations
 */
export async function deployResolverProxyWithAltConfigFixture(): Promise<
  ResolverProxyFixtureResult & { altConfigId: string }
> {
  const base = await deployResolverProxyFixture();
  const { blr, facetAddresses } = base;

  // Get facet resolver keys
  const facetNames = Object.keys(facetAddresses);
  const facetsWithKeys = facetNames.map((name) => {
    const facetDef = atsRegistry.getFacetDefinition(name);
    return {
      name,
      address: facetAddresses[name],
      resolverKey: facetDef!.resolverKey!.value,
    };
  });

  // Create alternative configuration at version 1 with same facets
  const facetConfigs = facetsWithKeys.map((f) => ({
    id: f.resolverKey,
    version: 1,
  }));
  await blr.createConfiguration(ALT_CONFIG_ID, facetConfigs);

  // Create alternative configuration at version 2 (allows version upgrades)
  await blr.createConfiguration(ALT_CONFIG_ID, facetConfigs);

  return {
    ...base,
    altConfigId: ALT_CONFIG_ID,
  };
}
