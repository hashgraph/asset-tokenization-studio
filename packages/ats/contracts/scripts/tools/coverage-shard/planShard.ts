// SPDX-License-Identifier: Apache-2.0
//
// Compute the test files for ONE coverage shard:
//   - the mega-asset entry `ats.test.ts` — in EVERY shard; it deploys once and runs only this
//     shard's balanced slice via ATS_MEGA_SHARD_* (set by runShardCoverage.ts).
//   - a weight-balanced slice of the standalone, self-registering suites.
// The discovered mega suites and the physical `ats.shard.*.test.ts` files are excluded (the former
// run only via the entry; the latter are local-parallel-test files). Paths are relative to
// `process.cwd()` (always the contracts package dir under npm).
//
// See ./README.md for the whole shard pipeline and why it's shaped this way.

import { join, relative } from "path";
import {
  assignBalancedShards,
  isMegaSuiteFile,
  isShardEntryFile,
  walkTestFiles,
} from "../../../test/contracts/integration/suiteDiscovery";

const INTEGRATION_DIR = join(process.cwd(), "test", "contracts", "integration");
const MEGA_ENTRY = "ats.test.ts";

/** Contracts-relative test files for coverage shard `index` of `count` (0 <= index < count). */
export function planShard(index: number, count: number): string[] {
  if (!Number.isInteger(index) || !Number.isInteger(count) || count < 1 || index < 0 || index >= count) {
    throw new Error(`planShard: invalid (index=${index}, count=${count}); require 0 <= index < count`);
  }

  const allFiles = walkTestFiles(INTEGRATION_DIR).sort();

  const megaEntry = allFiles.find((path) => (path.split("/").pop() ?? "") === MEGA_ENTRY);
  if (!megaEntry) {
    throw new Error(`planShard: mega-asset entry ${MEGA_ENTRY} not found under ${INTEGRATION_DIR}`);
  }

  // Standalone suites: exclude shard entries (ats.test.ts / ats.shard.*) and the discovered mega
  // suites (which run only via the entry). Weight-balance the remainder across shards.
  const standalone = allFiles.filter((path) => {
    const base = path.split("/").pop() ?? "";
    return !isShardEntryFile(base) && !isMegaSuiteFile(path);
  });
  const shardStandalone = assignBalancedShards(standalone, count)[index];

  // The mega entry runs in every shard (a different slice each, via env); standalone is partitioned.
  return [megaEntry, ...shardStandalone].map((path) => relative(process.cwd(), path));
}
