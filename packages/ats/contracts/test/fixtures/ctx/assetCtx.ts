// SPDX-License-Identifier: Apache-2.0

/**
 * AssetMock context factory — deploys one asset against ASSET_MOCK_CONFIG_ID
 * via MockFactory.deployAssetMock() and binds all contract handles to the
 * same proxy address.
 *
 * Every integration suite that migrates to the shared fixture uses
 * `deployAssetMockCtx()` via `loadFixture` and rebinds from it on each
 * `beforeEach`. `assertHandlesBound` fails fast if any handle points to a
 * different proxy than `diamond`.
 *
 * @see openspec/changes/test-optimization-shared-fixtures
 */

import type {
  ResolverProxy,
  IAssetMock,
  MockedWhitelist,
  MockedBlacklist,
  MockedExternalKycList,
  MockedExternalPause,
} from "@contract-types";
import {
  IAssetMock__factory,
  MockedBlacklist__factory,
  MockedExternalKycList__factory,
  MockedExternalPause__factory,
  MockedWhitelist__factory,
  ResolverProxy__factory,
} from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFullAssetFixture } from "../deploy/fullAsset";

// ============================================================================
// Types
// ============================================================================

/**
 * Infrastructure context type returned by deployAtsInfrastructureFullAssetFixture.
 */
type InfraData = Awaited<ReturnType<typeof deployAtsInfrastructureFullAssetFixture>>;

/**
 * Resolved AssetMock context with every contract handle bound to the same proxy.
 *
 * - `asset` — typed as IAssetMock (full IAsset + MockDiamondCut interface)
 * - `diamond` — the ResolverProxy (diamond) contract instance
 * - All infrastructure handles from the base fixture (blr, factory, accessControl,
 *   signers, etc.) — inherited via the spread of InfraData.
 */
export interface AssetMockCtx extends InfraData {
  /** IAssetMock handle bound to the diamond proxy address (combines IAsset + MockDiamondCut). */
  asset: IAssetMock;
  /** The deployed ResolverProxy (diamond) contract. */
  diamond: ResolverProxy;
  /** Pool of external mock contracts deployed alongside the asset for external-control-list tests. */
  externalMocks: {
    whitelist: MockedWhitelist[];
    blacklist: MockedBlacklist[];
    kyc: MockedExternalKycList[];
    pause: MockedExternalPause[];
  };
}

// ============================================================================
// Asset deployment
// ============================================================================

/**
 * Deploy an asset diamond proxy against ASSET_MOCK_CONFIG_ID via
 * MockFactory.deployAssetMock().
 *
 * This is a test-only e2e deploy path that skips per-facet initialisers and
 * force-readies every facet before marking the proxy operational. The caller
 * (the test deployer) is granted DEFAULT_ADMIN_ROLE on the proxy so per-suite test
 * reconfiguration remains possible.
 *
 * @param infra - Deployed ATS infrastructure context
 * @returns The deployed ResolverProxy (diamond) contract instance
 */
async function deployAssetMockToken(infra: InfraData): Promise<ResolverProxy> {
  const { factory, blr, deployer } = infra;

  // Deploy via MockFactory.deployAssetMock(blr) — test-only e2e path.
  // Use staticCall to get the deterministic CREATE address, then send the tx.
  const assetAddress: string = await factory.deployAssetMock.staticCall(blr);
  const tx = await factory.deployAssetMock(blr);
  await tx.wait();
  return ResolverProxy__factory.connect(assetAddress, deployer);
}

// ============================================================================
// Context assembly
// ============================================================================

/**
 * Assemble the AssetMockCtx from base infrastructure + deployed diamond.
 *
 * Binds `asset` (IAssetMock) to `diamond.target`, spreads all
 * infrastructure handles, and asserts the invariant before returning.
 *
 * @param base - Infrastructure data combined with the deployed diamond
 * @returns Fully bound AssetMockCtx
 */
export async function buildAssetMockCtx(base: InfraData & { diamond: ResolverProxy }): Promise<AssetMockCtx> {
  const target = await base.diamond.getAddress();
  const externalMocks = await deployExternalMockPool(base.deployer);

  const ctx: AssetMockCtx = {
    ...base,
    diamond: base.diamond,
    asset: IAssetMock__factory.connect(target, base.deployer),
    externalMocks,
  };

  assertHandlesBound(ctx);
  return ctx;
}

/**
 * Sizes of the external mock pool — how many of each mock to pre-deploy alongside the asset.
 * Sized to the largest count any single external-* suite registers at once; bump a value here
 * if a suite needs more.
 */
const EXTERNAL_MOCK_POOL_SIZES = { whitelist: 3, blacklist: 3, kyc: 5, pause: 5 } as const;

/** Deploy `count` instances from a typed mock factory, awaiting each deployment. */
async function deployMocks<T>(
  make: () => Promise<T & { waitForDeployment(): Promise<T> }>,
  count: number,
): Promise<T[]> {
  return Promise.all(Array.from({ length: count }, async () => (await make()).waitForDeployment()));
}

/**
 * Deploy a pool of external mock contracts for use by external-control-list,
 * external-KYC-list, and external-pause suites. The mocks are stateless until
 * a suite registers and configures them on the shared asset at runtime.
 */
async function deployExternalMockPool(deployer: InfraData["deployer"]): Promise<AssetMockCtx["externalMocks"]> {
  const [whitelist, blacklist, kyc, pause] = await Promise.all([
    deployMocks(() => new MockedWhitelist__factory(deployer).deploy(), EXTERNAL_MOCK_POOL_SIZES.whitelist),
    deployMocks(() => new MockedBlacklist__factory(deployer).deploy(), EXTERNAL_MOCK_POOL_SIZES.blacklist),
    deployMocks(() => new MockedExternalKycList__factory(deployer).deploy(), EXTERNAL_MOCK_POOL_SIZES.kyc),
    deployMocks(() => new MockedExternalPause__factory(deployer).deploy(), EXTERNAL_MOCK_POOL_SIZES.pause),
  ]);

  return { whitelist, blacklist, kyc, pause } as AssetMockCtx["externalMocks"];
}

/**
 * Assert that the `asset` handle is bound to the same proxy address as `diamond`.
 *
 * Throws with a descriptive message if the two `.target`s diverge — a fast guard against a
 * fixture wiring regression before any test runs.
 *
 * @param ctx - The AssetMockCtx to validate
 */
export function assertHandlesBound(ctx: AssetMockCtx): void {
  const assetTarget = ctx.asset.target as string;
  const diamondTarget = ctx.diamond.target as string;
  if (assetTarget !== diamondTarget) {
    throw new Error(`AssetMockCtx invariant violated: asset.target=${assetTarget} != diamond.target=${diamondTarget}`);
  }
}

// ============================================================================
// Named zero-param fixture (loadFixture-compatible)
// ============================================================================

/**
 * Deploy one asset against ASSET_MOCK_CONFIG_ID and return a fully bound context.
 *
 * Zero-param named function required for `loadFixture` caching — every file
 * that calls `loadFixture(deployAssetMockCtx)` shares the same snapshot.
 * First call deploys; subsequent calls restore the EVM snapshot.
 *
 * @returns Fully bound AssetMockCtx with all handles pointing to the same proxy
 *
 * @example
 * ```typescript
 * const ctx = await loadFixture(deployAssetMockCtx);
 * // ctx.asset and ctx.diamond point to the same address
 * ```
 */
export async function deployAssetMockCtx(): Promise<AssetMockCtx> {
  const infra = await loadFixture(deployAtsInfrastructureFullAssetFixture);
  const diamond = await deployAssetMockToken(infra);
  return buildAssetMockCtx({ ...infra, diamond });
}
