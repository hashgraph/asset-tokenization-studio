// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the coverage-shard LCOV merger (`mergeLcovReports`).
 *
 * The merger's job is to UNION coverage across shards that instrument the same files but run
 * disjoint tests: a line/function/branch is hit if ANY shard hit it, and hit counts sum. These
 * tests assert that union behaviour and the recomputed found/hit counters on tiny hand-written
 * fragments — they go red if the merger stops summing, drops functions, or mishandles "-" branches.
 *
 * @module test/scripts/unit/tools/mergeLcov.test
 */

import { expect } from "chai";
import { mergeLcovReports } from "@scripts/tools";

/** Extract the record block for one source file from a merged LCOV report. */
function blockFor(lcov: string, sourceFile: string): string[] {
  const lines = lcov.split("\n");
  const start = lines.findIndex((l) => l === `SF:${sourceFile}`);
  if (start === -1) throw new Error(`SF:${sourceFile} not found in merged report`);
  const end = lines.indexOf("end_of_record", start);
  return lines.slice(start, end + 1);
}

/** First value of a single-valued record (e.g. `LF:` → number, `DA:10,3` → "10,3"). */
function recordValue(block: string[], prefix: string): string {
  const found = block.find((l) => l.startsWith(prefix));
  if (!found) throw new Error(`record ${prefix} not found`);
  return found.slice(prefix.length);
}

describe("mergeLcovReports", () => {
  // Same file, DISJOINT coverage: shard A hits line 10 + branch 0 + fn alpha; shard B hits line 11,
  // line 20, branch 1, fn beta. The union should hit everything both touched and sum the counts.
  const shardA = [
    "TN:",
    "SF:contracts/Foo.sol",
    "FN:10,alpha",
    "FN:20,beta",
    "FNDA:1,alpha",
    "FNDA:0,beta",
    "DA:10,1",
    "DA:11,0",
    "DA:20,0",
    "BRDA:11,0,0,1",
    "BRDA:11,0,1,-",
    "end_of_record",
    "",
  ].join("\n");

  const shardB = [
    "TN:",
    "SF:contracts/Foo.sol",
    "FN:10,alpha",
    "FN:20,beta",
    "FNDA:0,alpha",
    "FNDA:2,beta",
    "DA:10,0",
    "DA:11,1",
    "DA:20,3",
    "BRDA:11,0,0,0",
    "BRDA:11,0,1,2",
    "end_of_record",
    // a file only shard B saw, fully uncovered
    "SF:contracts/Bar.sol",
    "FN:5,gamma",
    "FNDA:0,gamma",
    "DA:5,0",
    "end_of_record",
    "",
  ].join("\n");

  it("unions line hits across shards and recomputes LF/LH", () => {
    const foo = blockFor(mergeLcovReports([shardA, shardB]), "contracts/Foo.sol");
    // DA:10 = 1+0, DA:11 = 0+1, DA:20 = 0+3 → all three lines hit
    expect(foo).to.include("DA:10,1");
    expect(foo).to.include("DA:11,1");
    expect(foo).to.include("DA:20,3");
    expect(recordValue(foo, "LF:")).to.equal("3");
    expect(recordValue(foo, "LH:")).to.equal("3");
  });

  it("sums function call counts and counts only called functions in FNH", () => {
    const foo = blockFor(mergeLcovReports([shardA, shardB]), "contracts/Foo.sol");
    // alpha = 1+0, beta = 0+2 → both called
    expect(foo).to.include("FNDA:1,alpha");
    expect(foo).to.include("FNDA:2,beta");
    expect(recordValue(foo, "FNF:")).to.equal("2");
    expect(recordValue(foo, "FNH:")).to.equal("2");
  });

  it("treats a branch as hit if any shard took it, even when another marked it unreached", () => {
    const foo = blockFor(mergeLcovReports([shardA, shardB]), "contracts/Foo.sol");
    // branch (11,0,0): 1+0 = 1; branch (11,0,1): "-" then 2 → 2. Both taken.
    expect(foo).to.include("BRDA:11,0,0,1");
    expect(foo).to.include("BRDA:11,0,1,2");
    expect(recordValue(foo, "BRF:")).to.equal("2");
    expect(recordValue(foo, "BRH:")).to.equal("2");
  });

  it("keeps a file seen in only one shard, with its uncovered counters", () => {
    const merged = mergeLcovReports([shardA, shardB]);
    const bar = blockFor(merged, "contracts/Bar.sol");
    expect(recordValue(bar, "LF:")).to.equal("1");
    expect(recordValue(bar, "LH:")).to.equal("0"); // DA:5,0 → not hit
    expect(recordValue(bar, "FNH:")).to.equal("0"); // gamma never called
  });

  it("is order-independent (union is commutative)", () => {
    const ab = mergeLcovReports([shardA, shardB]);
    const ba = mergeLcovReports([shardB, shardA]);
    // Same Foo.sol summary counters regardless of input order.
    for (const rec of ["LF:", "LH:", "FNF:", "FNH:", "BRF:", "BRH:"]) {
      expect(recordValue(blockFor(ab, "contracts/Foo.sol"), rec)).to.equal(
        recordValue(blockFor(ba, "contracts/Foo.sol"), rec),
      );
    }
  });
});
