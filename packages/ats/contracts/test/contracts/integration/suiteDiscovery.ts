// SPDX-License-Identifier: Apache-2.0
//
// Shared, dependency-free discovery primitive for the ATS mega-asset (IAsset) test suites. Used
// by BOTH shard mechanisms — the parallel test runner (atsShardRunner.ts) and the coverage shard
// planner (scripts/tools/coverage-shard/planShard.ts) — so the suite-signature convention and the
// directory walk live in ONE place and cannot drift apart. Imports only `fs`/`path`, so it is
// cheap to pull into either context. Not a `*.test.ts`, so the test globs never pick it up.
// Part of the test-sharding / coverage pipeline — see scripts/tools/coverage-shard/README.md.

import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";

/** Marker every IAsset suite carries: `export function <name>Tests(getCtx: () => AssetMockCtx)`. */
export const SUITE_SIGNATURE = /export\s+function\s+\w+Tests\s*\(\s*getCtx/;

/** The shard ENTRY files (`ats.test.ts` monolith + `ats.shard.N.test.ts`) — runners, not suites. */
export function isShardEntryFile(basename: string): boolean {
  return basename === "ats.test.ts" || /^ats\.shard\.\d+\.test\.ts$/.test(basename);
}

/** A discovered mega-asset suite: a `*.test.ts` that exports an `xTests(getCtx)` function. */
export function isMegaSuiteFile(path: string): boolean {
  return path.endsWith(".test.ts") && SUITE_SIGNATURE.test(readFileSync(path, "utf8"));
}

/** Recursively collect every `*.test.ts` path under `dir`. */
export function walkTestFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walkTestFiles(path));
    else if (entry.endsWith(".test.ts")) out.push(path);
  }
  return out;
}

/**
 * Static weight for shard balancing: the number of `it(...)` cases a file declares. This tracks
 * the suite's test count closely (the union of `it()` counts matched the live total within ~0.2%),
 * so it is a cheap, deterministic proxy for execution cost — no profiling artifact to maintain.
 * Floored at 1 so a suite never has zero weight.
 */
export function suiteWeight(path: string): number {
  const matches = readFileSync(path, "utf8").match(/\bit(\.only|\.skip)?\s*\(/g);
  return Math.max(1, matches ? matches.length : 0);
}

/**
 * Partition `files` into `shardCount` balanced groups by `suiteWeight`, using greedy
 * longest-processing-time bin-packing: heaviest file first, each assigned to the lightest shard so
 * far. This flattens the slowest shard toward `total / shardCount` instead of the file-count
 * round-robin's "whichever shard drew the heavy suites". Deterministic — files are sorted by weight
 * (desc) then path, and ties pick the lowest-index shard — so a given `shardCount` yields the same
 * partition wherever it is computed (the test entry and the coverage planner must agree).
 *
 * `weightOf` defaults to `suiteWeight` (reads the file); it is a parameter only so the partition
 * invariant can be unit-tested with synthetic inputs that never touch the filesystem.
 */
export function assignBalancedShards(
  files: string[],
  shardCount: number,
  weightOf: (path: string) => number = suiteWeight,
): string[][] {
  const bins: string[][] = Array.from({ length: shardCount }, () => []);
  const loads = new Array<number>(shardCount).fill(0);
  const ordered = files
    .map((path) => ({ path, weight: weightOf(path) }))
    .sort((a, b) => b.weight - a.weight || (a.path < b.path ? -1 : 1));
  for (const { path, weight } of ordered) {
    let lightest = 0;
    for (let i = 1; i < shardCount; i++) if (loads[i] < loads[lightest]) lightest = i;
    bins[lightest].push(path);
    loads[lightest] += weight;
  }

  // Trust invariant — the shards MUST be a disjoint, complete partition of the input: every suite
  // runs in exactly one shard, none dropped or doubled. This is the guarantee the parallel/coverage
  // split rests on, so assert it here rather than hope a future edit preserves it (cheap: O(files)).
  const assigned = bins.flat();
  if (assigned.length !== files.length || new Set(assigned).size !== new Set(files).size) {
    throw new Error(
      `assignBalancedShards: not a disjoint+complete partition — assigned ${assigned.length} ` +
        `(${new Set(assigned).size} distinct) of ${files.length} input files`,
    );
  }
  return bins;
}
