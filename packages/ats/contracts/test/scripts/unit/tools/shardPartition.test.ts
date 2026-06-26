// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the shard partitioner — the "no suite is silently dropped" guarantee.
 *
 * The whole parallel/coverage scheme trusts that splitting the suites into shards is a DISJOINT,
 * COMPLETE partition: every suite runs in exactly one shard, none dropped or doubled. These tests
 * assert that property of `assignBalancedShards` directly (with synthetic inputs + an injected
 * weight, so no filesystem), and check the real coverage `planShard` partition end to end. They go
 * red if a future edit to the balancing or planning logic ever drops, duplicates, or misroutes a
 * suite — which a coverage % alone would not reveal.
 *
 * @module test/scripts/unit/tools/shardPartition.test
 */

import { expect } from "chai";
import {
  assignBalancedShards,
  isMegaSuiteFile,
  isShardEntryFile,
  walkTestFiles,
} from "@test/contracts/integration/suiteDiscovery";
import { join } from "path";
// planShard reads the integration tree and imports test/ helpers, so it can't live in the @scripts
// barrel (that would pull test/ into the scripts build) — import it directly.
import { planShard } from "../../../../scripts/tools/coverage-shard/planShard";

/** Assert `shards` is a disjoint, complete partition of `input` (order-independent). */
function expectPartition(shards: string[][], input: string[]): void {
  const flat = shards.flat();
  expect(flat.length, "no suite dropped or doubled").to.equal(input.length);
  expect(new Set(flat).size, "no suite appears twice").to.equal(flat.length);
  expect([...flat].sort()).to.deep.equal([...input].sort());
}

describe("assignBalancedShards — partition invariant", () => {
  // A synthetic weight so the test never touches the filesystem (real suiteWeight reads each file).
  const weight = (p: string) => p.length;
  const files = ["aaaa", "bbb", "cc", "d", "eeeee", "ff", "ggggggg", "h", "iii", "jjjj"];

  for (const n of [1, 2, 3, 4, 8]) {
    it(`is disjoint + complete for ${n} shard(s)`, () => {
      const shards = assignBalancedShards(files, n, weight);
      expect(shards.length).to.equal(n);
      expectPartition(shards, files);
    });
  }

  it("handles more shards than files (some shards empty, still complete)", () => {
    const few = ["x", "yy", "zzz"];
    const shards = assignBalancedShards(few, 8, weight);
    expect(shards.length).to.equal(8);
    expect(shards.filter((s) => s.length === 0).length).to.equal(5);
    expectPartition(shards, few);
  });

  it("is deterministic — same input yields the same partition", () => {
    expect(assignBalancedShards(files, 4, weight)).to.deep.equal(assignBalancedShards(files, 4, weight));
  });

  it("balances weight: the heaviest shard exceeds the lightest by at most one suite's weight", () => {
    const shards = assignBalancedShards(files, 4, weight);
    const loads = shards.map((s) => s.reduce((sum, p) => sum + weight(p), 0));
    const maxSingle = Math.max(...files.map(weight));
    // Greedy LPT guarantees the spread is bounded by the largest single item.
    expect(Math.max(...loads) - Math.min(...loads)).to.be.at.most(maxSingle);
  });
});

describe("planShard — the real coverage shards cover every integration suite", () => {
  const N = 4;
  const shards = Array.from({ length: N }, (_, i) => planShard(i, N).map((p) => p.split("/integration/")[1] ?? p));
  const integrationDir = join(process.cwd(), "test", "contracts", "integration");

  it("includes the mega entry (ats.test.ts) in EVERY shard", () => {
    for (let i = 0; i < N; i++) expect(shards[i], `shard ${i}`).to.include("ats.test.ts");
  });

  it("never lists a local parallel shard file or a discovered mega suite", () => {
    for (const shard of shards) {
      for (const f of shard) {
        expect(f.startsWith("ats.shard."), `${f} is a local-parallel file`).to.be.false;
      }
    }
  });

  it("partitions the standalone suites disjointly and completely", () => {
    const expectedStandalone = walkTestFiles(integrationDir)
      .filter((p) => {
        const base = p.split("/").pop() ?? "";
        return !isShardEntryFile(base) && !isMegaSuiteFile(p);
      })
      .map((p) => p.split("/integration/")[1])
      .sort();

    const standaloneAcrossShards = shards.flat().filter((f) => f !== "ats.test.ts");
    expect(new Set(standaloneAcrossShards).size, "no standalone suite duplicated").to.equal(
      standaloneAcrossShards.length,
    );
    expect([...standaloneAcrossShards].sort()).to.deep.equal(expectedStandalone);
  });
});
