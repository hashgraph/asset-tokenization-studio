// SPDX-License-Identifier: Apache-2.0

/**
 * Entry point for the ATS mega-asset (IAsset) suites — runs the discovered suites in one
 * `describe` sharing a single `loadFixture(deployAssetMockCtx)` deploy.
 *
 * By default (no env) it runs ALL suites in one deploy — the serial CI path (`npm run test`).
 * The coverage sharding sets `ATS_MEGA_SHARD_INDEX` / `ATS_MEGA_SHARD_TOTAL` so each coverage
 * runner deploys the mega-asset ONCE and runs only its weight-balanced slice (see
 * `assignBalancedShards` in ./suiteDiscovery). The slices form a disjoint, complete partition,
 * so the union of shards covers every suite with no double-run.
 *
 * For parallel LOCAL test runs the same suites are instead sharded across the physical
 * `shards/ats.shard.{1..N}.test.ts` files (one worker per file). To run a single suite:
 *   npx hardhat test test/contracts/integration/ats.test.ts --grep "Freeze Tests"
 *
 * Part of the test-sharding / coverage pipeline — see scripts/tools/coverage-shard/README.md.
 */

import { runAtsShard } from "./atsShardRunner";

const shardIndex = Number(process.env.ATS_MEGA_SHARD_INDEX ?? "0");
const shardTotal = Number(process.env.ATS_MEGA_SHARD_TOTAL ?? "1");

runAtsShard(shardIndex, shardTotal);
