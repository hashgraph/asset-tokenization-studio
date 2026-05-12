// SPDX-License-Identifier: Apache-2.0

/**
 * Initializer test fixtures.
 *
 * Lightweight fixtures for testing facet initialisation lifecycle.
 * Builds on deployBlrFixture using the same composition pattern as
 * resolverProxy.fixture.ts.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { ethers } from "hardhat";
import { ZeroHash } from "ethers";
import { deployBlrFixture } from "./integration.fixture";
import { deployContract, registerFacets } from "@scripts/infrastructure";
import { atsRegistry } from "@scripts/domain";
import {
  MockInitializableFacet__factory,
  MockStatefulFacet__factory,
  MockBatchFacet__factory,
  DiamondCut__factory,
  ResolverProxy__factory,
} from "@contract-types";
import type {
  BusinessLogicResolver,
  MockInitializableFacet,
  MockStatefulFacet,
  DiamondCut,
  IInitializer,
  ResolverProxy,
} from "@contract-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Test configuration ID (bytes32(0x99) to avoid conflicts with EQUITY/BOND).
 */
export const TEST_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000099";

/**
 * MockStatefulFacet facet ID: keccak256("test.MockStatefulFacet").
 * Used to reference the mock across tests without calling the contract.
 */
export const MOCK_FACET_ID = ethers.id("test.MockStatefulFacet");

/**
 * Synthetic resolver key for MockStatefulFacet (also keccak256 of same string).
 */
export const MOCK_STATEFUL_KEY = ethers.id("test.MockStatefulFacet");

export interface InitializerFixtureResult {
  deployer: HardhatEthersSigner;
  unknownSigner: HardhatEthersSigner;
  blr: BusinessLogicResolver;
  blrAddress: string;
  resolverProxy: ResolverProxy;
  proxyAddress: string;
  /** Initializer interface connected to the proxy */
  initializer: IInitializer;
  /** MockInitializableFacet connected to the proxy (provides initializeMockFacet, initializeInitializer, setOperationalStatus) */
  mockInitializableFacet: MockInitializableFacet;
  /** MockStatefulFacet connected to the proxy (provides initializeMock, reinitializeMock, doSomething) */
  mockFacet: MockStatefulFacet;
  /** DiamondCut interface connected to the proxy (for updateConfigVersion) */
  diamondCut: DiamondCut;
  /** Deployed facet addresses keyed by name */
  facetAddresses: Record<string, string>;
  /** Resolver keys for deployed facets keyed by name */
  facetKeys: Record<string, string>;
  /** Configuration ID used for deployment */
  configId: string;
  /** Initial BLR version */
  initialVersion: number;
}

/**
 * Deploy BLR + facets + ResolverProxy for initializer tests.
 *
 * Setup:
 * 1. Deploy BLR
 * 2. Deploy DiamondFacet, AccessControlFacet, MockInitializableFacet, MockStatefulFacet
 * 3. Register all 4 facets in BLR
 * 4. Create configuration at v1 and v2
 * 5. Deploy ResolverProxy pointing to config v1
 * 6. Connect convenience interfaces
 */
async function deployInitializerFixtureBase(): Promise<InitializerFixtureResult> {
  const base = await deployBlrFixture();
  const { deployer, blr, blrAddress } = base;
  const signers = await ethers.getSigners();
  const unknownSigner = signers.at(-1)!;

  // Deploy required facets
  const facetNames = ["DiamondFacet", "AccessControlFacet", "MockInitializableFacet", "MockStatefulFacet"];
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
  const registeredNames = ["DiamondFacet", "AccessControlFacet"];
  const facetsWithKeys = registeredNames.map((name) => {
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

  // MockInitializableFacet uses _INITIALIZER_RESOLVER_KEY from atsRegistry
  const mockInitDef = atsRegistry.getFacetDefinition("InitializerFacet");
  if (!mockInitDef?.resolverKey?.value) {
    throw new Error("No _INITIALIZER_RESOLVER_KEY found in registry");
  }
  facetsWithKeys.push({
    name: "MockInitializableFacet",
    address: facetAddresses["MockInitializableFacet"],
    resolverKey: mockInitDef.resolverKey.value,
  });

  // MockStatefulFacet with synthetic resolver key
  facetsWithKeys.push({
    name: "MockStatefulFacet",
    address: facetAddresses["MockStatefulFacet"],
    resolverKey: MOCK_STATEFUL_KEY,
  });

  // Register facets in BLR — single call so all share BLR version 1
  await registerFacets(blr, { facets: facetsWithKeys });

  // Build facet keys lookup
  const facetKeys: Record<string, string> = {};
  for (const f of facetsWithKeys) {
    facetKeys[f.name] = f.resolverKey;
  }

  const facetConfigs = facetsWithKeys.map((f) => ({ id: f.resolverKey, version: 1 }));

  // Create config at v1
  await blr.createConfiguration(TEST_CONFIG_ID, facetConfigs);

  // Create config at v2 (identical, enables version upgrades)
  await blr.createConfiguration(TEST_CONFIG_ID, facetConfigs);

  // Deploy ResolverProxy pointing to config v1
  const initialVersion = 1;
  const resolverProxy = await new ResolverProxy__factory(deployer).deploy(blrAddress, TEST_CONFIG_ID, initialVersion, [
    { role: ZeroHash, members: [deployer.address] },
  ]);
  await resolverProxy.waitForDeployment();

  // Connect interfaces through the proxy
  const mockInitializableFacet = MockInitializableFacet__factory.connect(
    resolverProxy.target as string,
    deployer,
  ) as unknown as MockInitializableFacet;
  const mockFacet = MockStatefulFacet__factory.connect(resolverProxy.target as string, deployer);
  const diamondCut = DiamondCut__factory.connect(resolverProxy.target as string, deployer);

  return {
    deployer,
    unknownSigner,
    blr,
    blrAddress,
    resolverProxy,
    proxyAddress: resolverProxy.target as string,
    initializer: mockInitializableFacet as unknown as IInitializer,
    mockInitializableFacet,
    mockFacet,
    diamondCut,
    facetAddresses,
    facetKeys,
    configId: TEST_CONFIG_ID,
    initialVersion,
  };
}

/**
 * Standard fixture (4 facets).
 */
export async function deployInitializerFixture(): Promise<InitializerFixtureResult> {
  return deployInitializerFixtureBase();
}

/**
 * Batch fixture: 4 standard facets + 12 MockBatchFacet instances = 16 total.
 *
 * All 16 facets are registered in a single BLR call so they share version 1.
 * The config therefore has 16 entries.  With the v2 refactor, setOperationalStatus
 * processes all 16 in a single pass (no batching).
 */
export async function deployInitializerBatchFixture(): Promise<InitializerFixtureResult & { batchFacetIds: string[] }> {
  const base = await deployBlrFixture();
  const { deployer, blr, blrAddress } = base;
  const signers = await ethers.getSigners();
  const unknownSigner = signers.at(-1)!;

  const batchFacetIds = Array.from({ length: 12 }, (_, i) => ethers.id(`test.BatchFacet${i}`));

  // Deploy standard facets
  const standardNames = ["DiamondFacet", "AccessControlFacet", "MockInitializableFacet", "MockStatefulFacet"];
  const facetAddresses: Record<string, string> = {};
  for (const name of standardNames) {
    const factory = await ethers.getContractFactory(name, deployer);
    const result = await deployContract(factory, { confirmations: 0, verifyDeployment: false });
    facetAddresses[name] = result.address!;
  }

  // Deploy 12 MockBatchFacet instances
  const batchAddresses: string[] = [];
  for (const id of batchFacetIds) {
    const contract = await new MockBatchFacet__factory(deployer).deploy(id);
    await contract.waitForDeployment();
    batchAddresses.push(contract.target as string);
  }

  // Prepare standard facets data
  const registeredNames = ["DiamondFacet", "AccessControlFacet"];
  const standardFacets: { name: string; address: string; resolverKey: string }[] = registeredNames.map((name) => {
    const facetDef = atsRegistry.getFacetDefinition(name);
    if (!facetDef?.resolverKey?.value) throw new Error(`No resolver key for ${name}`);
    return { name, address: facetAddresses[name], resolverKey: facetDef.resolverKey.value };
  });

  const mockInitDef = atsRegistry.getFacetDefinition("InitializerFacet");
  if (!mockInitDef?.resolverKey?.value) throw new Error("No _INITIALIZER_RESOLVER_KEY found");
  standardFacets.push({
    name: "MockInitializableFacet",
    address: facetAddresses["MockInitializableFacet"],
    resolverKey: mockInitDef.resolverKey.value,
  });
  standardFacets.push({
    name: "MockStatefulFacet",
    address: facetAddresses["MockStatefulFacet"],
    resolverKey: MOCK_STATEFUL_KEY,
  });

  // Batch facets data
  const batchFacets = batchFacetIds.map((id, i) => ({
    name: `BatchFacet${i}`,
    address: batchAddresses[i],
    resolverKey: id,
  }));

  // Register ALL in one call so every facet shares BLR version 1.
  await registerFacets(blr, { facets: [...standardFacets, ...batchFacets] });

  // Facet keys (standard only — batch IDs are returned separately as batchFacetIds)
  const facetKeys: Record<string, string> = {};
  for (const f of standardFacets) {
    facetKeys[f.name] = f.resolverKey;
  }

  // Config: all 16 facets at version 1
  const facetConfigs = [...standardFacets, ...batchFacets].map((f) => ({ id: f.resolverKey, version: 1 }));
  await blr.createConfiguration(TEST_CONFIG_ID, facetConfigs);
  await blr.createConfiguration(TEST_CONFIG_ID, facetConfigs); // v2 for upgrade paths

  const initialVersion = 1;
  const resolverProxy = await new ResolverProxy__factory(deployer).deploy(blrAddress, TEST_CONFIG_ID, initialVersion, [
    { role: ZeroHash, members: [deployer.address] },
  ]);
  await resolverProxy.waitForDeployment();

  const mockInitializableFacet = MockInitializableFacet__factory.connect(
    resolverProxy.target as string,
    deployer,
  ) as unknown as MockInitializableFacet;
  const mockFacet = MockStatefulFacet__factory.connect(resolverProxy.target as string, deployer);
  const diamondCut = DiamondCut__factory.connect(resolverProxy.target as string, deployer);

  return {
    deployer,
    unknownSigner,
    blr,
    blrAddress,
    resolverProxy,
    proxyAddress: resolverProxy.target as string,
    initializer: mockInitializableFacet as unknown as IInitializer,
    mockInitializableFacet,
    mockFacet,
    diamondCut,
    facetAddresses,
    facetKeys,
    configId: TEST_CONFIG_ID,
    initialVersion,
    batchFacetIds,
  };
}
