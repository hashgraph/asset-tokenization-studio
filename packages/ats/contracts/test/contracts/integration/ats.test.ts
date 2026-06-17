// SPDX-License-Identifier: Apache-2.0

/**
 * ATS Contract Suite — single central entry point for all IAsset (mega-asset) tests.
 *
 * Every IAsset suite exports an `xTests(getCtx)` function (it does NOT self-register a
 * top-level `describe`). This file discovers those suites and invokes them all inside ONE
 * `describe` that shares a single `loadFixture(deployAssetMockCtx)` snapshot.
 *
 * Why one central file — do NOT convert the suites to self-registering files:
 *  - The mega-asset deploy (full infra + all-facet diamond, force-readied) is expensive. One
 *    contiguous block lets `loadFixture` deploy it ONCE and every test revert the snapshot.
 *    Self-registering files scatter the suites among the ~50 other-fixture suites; because
 *    `loadFixture` reverting to an older snapshot drops the newer ones, the other fixtures
 *    re-deploy repeatedly (serial), and under `mocha --parallel` (which splits by FILE) the
 *    mega-asset deploys once PER WORKER. Measured: distribution is slower in BOTH modes;
 *    behaviour is identical, the cost is purely timing.
 *
 * The suite list is DISCOVERED, not hand-maintained: every `*.test.ts` under this tree that
 * exports an `xTests(getCtx)` function is picked up automatically (sorted, for deterministic
 * order). Add a suite by dropping in a file with that signature — no edits here. The
 * other-fixture suites (equity/bond/loan/infra) self-register via `describe` and carry no such
 * export, so they are filtered out by a cheap source scan and never `require`d here (which
 * would otherwise double-register them).
 *
 * To run a single suite, filter by its `describe` name, e.g.:
 *   npx hardhat test test/contracts/integration/ats.test.ts --grep "Freeze Tests"
 */

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAssetMockCtx, type AssetMockCtx } from "@test";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

/** Marker every IAsset suite carries: `export function <name>Tests(getCtx: () => AssetMockCtx)`. */
const SUITE_SIGNATURE = /export\s+function\s+\w+Tests\s*\(\s*getCtx/;

/** Lower bound that fails loudly if a convention/regex drift would silently drop suites. */
const MIN_EXPECTED_SUITES = 50;

type SuiteFn = (getCtx: () => AssetMockCtx) => void;

/** Recursively collect absolute paths of IAsset suite files (those exporting an xTests fn). */
function findIAssetSuites(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      found.push(...findIAssetSuites(path));
    } else if (
      entry.endsWith(".test.ts") &&
      entry !== "ats.test.ts" &&
      SUITE_SIGNATURE.test(readFileSync(path, "utf8"))
    ) {
      found.push(path);
    }
  }
  return found;
}

describe("ATS — IAsset Suites", () => {
  let ctx: AssetMockCtx;

  beforeEach(async () => {
    ctx = await loadFixture(deployAssetMockCtx);
  });

  const suiteFiles = findIAssetSuites(__dirname).sort();
  if (suiteFiles.length < MIN_EXPECTED_SUITES) {
    throw new Error(
      `ats.test.ts discovered only ${suiteFiles.length} IAsset suites (expected >= ${MIN_EXPECTED_SUITES}); ` +
        `the suite signature ${SUITE_SIGNATURE} may have drifted.`,
    );
  }

  for (const file of suiteFiles) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(file) as Record<string, unknown>;
    const suite = Object.entries(mod).find(([name, value]) => name.endsWith("Tests") && typeof value === "function");
    if (suite) (suite[1] as SuiteFn)(() => ctx);
  }
});
