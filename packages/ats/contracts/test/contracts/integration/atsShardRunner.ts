// SPDX-License-Identifier: Apache-2.0

/**
 * Discovery + shard runner for the ATS mega-asset (IAsset) suites.
 *
 * Every IAsset suite exports `function <name>Tests(getCtx: () => AssetMockCtx)` and does NOT
 * self-register a top-level `describe`. `discoverSuites` finds them; `runAtsShard` runs a
 * disjoint slice inside ONE `describe` sharing a single `loadFixture(deployAssetMockCtx)`.
 *
 * Sharding model:
 *  - Serial entry `ats.test.ts` calls `runAtsShard(0, 1)` — every suite, one deploy (the CI
 *    path, `npm run test`). Behaviour is identical to the previous monolithic entry.
 *  - Parallel entries `shards/ats.shard.{1..N}.test.ts` call `runAtsShard(k - 1, N)`. `mocha --parallel`
 *    splits by FILE, so it distributes the N shard files across worker processes; each worker
 *    deploys the mega-asset once and runs its slice. Suites are bin-packed by weight (see
 *    `assignBalancedShards`) into a disjoint, complete partition — no suite is dropped or run twice.
 *
 * The runner is a plain `.ts` (not `*.test.ts`), so the test-file globs never pick it up and it
 * is never discovered as a suite.
 *
 * Part of the test-sharding / coverage pipeline — see scripts/tools/coverage-shard/README.md.
 */

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAssetMockCtx, type AssetMockCtx } from "@test";
import {
  assignBalancedShards,
  isMegaSuiteFile,
  isShardEntryFile,
  SUITE_SIGNATURE,
  walkTestFiles,
} from "./suiteDiscovery";

// The custom `revertedWithCustomError` patch (KNOWN_ERRORS selector fallback for errors not in a
// contract's own ABI) is normally loaded as a side-effect of mocha's `require` (globalSetup.ts).
// mocha --parallel does NOT apply `require` to worker processes, so each shard worker must load
// the patch itself; the import is idempotent (module-cached) and a no-op in the serial run.
import { initCustomChaiMatchers } from "../../helpers/chai-matchers";

/** Lower bound that fails loudly if a convention/regex drift would silently drop suites. */
const MIN_EXPECTED_SUITES = 50;

type SuiteFn = (getCtx: () => AssetMockCtx) => void;

/** All IAsset suite files, sorted for deterministic order; throws if discovery under-collects. */
export function discoverSuites(): string[] {
  const suiteFiles = walkTestFiles(__dirname)
    .filter((path) => !isShardEntryFile(path.split("/").pop() ?? "") && isMegaSuiteFile(path))
    .sort();
  if (suiteFiles.length < MIN_EXPECTED_SUITES) {
    throw new Error(
      `Discovered only ${suiteFiles.length} IAsset suites (expected >= ${MIN_EXPECTED_SUITES}); ` +
        `the suite signature ${SUITE_SIGNATURE} may have drifted.`,
    );
  }
  return suiteFiles;
}

/**
 * Run the suites assigned to `shardIndex` of `shardCount` inside one shared-fixture `describe`.
 * `shardCount === 1` runs every suite (serial entry); N > 1 runs the `i % N === shardIndex` slice.
 */
export function runAtsShard(shardIndex: number, shardCount: number): void {
  const label =
    shardCount === 1 ? "ATS — IAsset Suites" : `ATS — IAsset Suites [shard ${shardIndex + 1}/${shardCount}]`;

  describe(label, () => {
    let ctx: AssetMockCtx;

    before(() => {
      // Ensure chai matchers are initialized after hardhat-chai-matchers has been loaded.
      // In mocha --parallel, globalSetup is NOT applied to workers, so this hook re-initializes
      // in the worker context.
      initCustomChaiMatchers();
    });

    beforeEach(async () => {
      ctx = await loadFixture(deployAssetMockCtx);
    });

    const suiteFiles = assignBalancedShards(discoverSuites(), shardCount)[shardIndex];
    for (const file of suiteFiles) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(file) as Record<string, unknown>;
      const suite = Object.entries(mod).find(([name, value]) => name.endsWith("Tests") && typeof value === "function");
      if (suite) (suite[1] as SuiteFn)(() => ctx);
    }
  });
}
