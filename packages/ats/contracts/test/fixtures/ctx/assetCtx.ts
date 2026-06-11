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

import type { ResolverProxy, IAsset, MockDiamondCut } from "@contract-types";
import { ResolverProxy__factory, IAsset__factory, MockDiamondCut__factory } from "@contract-types";
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
 * - `asset` — typed as IAsset (full ERC-1400 + ERC-20 interface)
 * - `mockDiamondCut` — typed as MockDiamondCut (forceNonOperational, etc.)
 * - `diamond` — the ResolverProxy (diamond) contract instance
 * - All infrastructure handles from the base fixture (blr, factory, accessControl,
 *   signers, etc.) — inherited via the spread of InfraData.
 */
export interface AssetMockCtx extends InfraData {
  /** IAsset handle bound to the diamond proxy address. */
  asset: IAsset;
  /** MockDiamondCut handle bound to the diamond proxy address. */
  mockDiamondCut: MockDiamondCut;
  /** The deployed ResolverProxy (diamond) contract. */
  diamond: ResolverProxy;
}

// ============================================================================
// Asset deployment
// ============================================================================

/**
 * Deploy an asset diamond proxy against ASSET_MOCK_CONFIG_ID via
 * MockFactory.deployAssetMock().
 *
 * This is a test-only e2e deploy path that skips per-facet initialisers and
 * force-readies every facet before marking the proxy operational.  The factory
 * retains DEFAULT_ADMIN_ROLE so per-suite test reconfiguration remains possible.
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
 * Binds `asset` and `mockDiamondCut` to `diamond.target`, spreads all
 * infrastructure handles, and asserts the invariant before returning.
 *
 * @param base - Infrastructure data combined with the deployed diamond
 * @returns Fully bound AssetMockCtx
 */
export async function buildAssetMockCtx(base: InfraData & { diamond: ResolverProxy }): Promise<AssetMockCtx> {
  const target = await base.diamond.getAddress();

  const ctx: AssetMockCtx = {
    ...base,
    diamond: base.diamond,
    asset: IAsset__factory.connect(target, base.deployer),
    mockDiamondCut: MockDiamondCut__factory.connect(target, base.deployer),
  };

  assertHandlesBound(ctx);
  return ctx;
}

// ============================================================================
// Invariant guard
// ============================================================================

/**
 * Assert that every contract handle in the context points to the same proxy address.
 *
 * Throws with a descriptive message if any handle's `.target` differs from
 * `diamond.target`.
 *
 * @param ctx - The AssetMockCtx to validate
 */
export function assertHandlesBound(ctx: AssetMockCtx): void {
  const diamondTarget = ctx.diamond.target as string;

  const contractHandles: [string, object | undefined][] = [
    ["asset", ctx.asset],
    ["mockDiamondCut", ctx.mockDiamondCut],
  ];

  for (const [name, handle] of contractHandles) {
    if (handle && typeof handle === "object" && "target" in handle) {
      const target = (handle as { target: string }).target;
      if (typeof target === "string" && target !== diamondTarget) {
        throw new Error(
          `AssetMockCtx invariant violated: handle '${name}'.target=${target} != diamond.target=${diamondTarget}`,
        );
      }
    }
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
 * // ctx.asset, ctx.mockDiamondCut, ctx.diamond all point to the same address
 * ```
 */
export async function deployAssetMockCtx(): Promise<AssetMockCtx> {
  const infra = await loadFixture(deployAtsInfrastructureFullAssetFixture);
  const diamond = await deployAssetMockToken(infra);
  return buildAssetMockCtx({ ...infra, diamond });
}
