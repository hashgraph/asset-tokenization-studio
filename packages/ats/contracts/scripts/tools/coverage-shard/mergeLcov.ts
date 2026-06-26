// SPDX-License-Identifier: Apache-2.0
//
// Merge per-shard LCOV reports into one, summing coverage across shards.
//
// Each coverage shard instruments the SAME contracts but runs a DISJOINT slice of the tests, so the
// full-suite coverage is the union: a line/function/branch counts as "hit" if ANY shard hit it.
// This merger parses the handful of LCOV record types solidity-coverage emits, sums the hit counts
// per source file, and re-emits one report. See ./README.md for the whole shard→merge pipeline.
//
// Why an in-repo merger and not a standard tool:
//   - `lcov-result-merger` (npm) silently DROPS function records → function coverage lost.
//   - `lcov` 2.x reproduces the numbers only with a large --rc/--ignore-errors flag soup, emits
//     thousands of "inconsistent" warnings on solidity-coverage's output, and rewrites the file in a
//     newer function format (FNL/FNA) whose Codecov support is unverified.
//   This stays exact, dependency-free, and unit-tested (test/scripts/unit/tools/mergeLcov.test.ts).
//
// LCOV record types, one block per source file (see `man geninfo`):
//   TN:<test name>                          SF:<source file path>
//   FN:<line>,<name>                        function <name> is defined at <line>
//   FNDA:<hits>,<name>                       function <name> was called <hits> times
//   DA:<line>,<hits>                         line <line> executed <hits> times
//   BRDA:<line>,<block>,<branch>,<taken>     branch outcome; <taken> is a count, or "-" if never reached
//   FNF/FNH · BRF/BRH · LF/LH                found/hit summary counters (RECOMPUTED here on emit)
//   end_of_record
//
// CLI: npx tsx scripts/tools/coverage-shard/mergeLcov.ts <output.info> <input.info|dir ...>

import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

/** Accumulated coverage for ONE source file. Maps are keyed so records across shards sum. */
interface FileCoverage {
  testName: string;
  functionDefLine: Map<string, number>; // FN:   function name -> definition line
  functionHits: Map<string, number>; // FNDA: function name -> summed call count
  lineHits: Map<number, number>; // DA:   line number -> summed execution count
  branchTaken: Map<string, number | "-">; // BRDA: "line,block,branch" -> summed taken, or "-" if unreached
}

type CoverageByFile = Map<string, FileCoverage>;

function newFileCoverage(testName: string): FileCoverage {
  return {
    testName,
    functionDefLine: new Map(),
    functionHits: new Map(),
    lineHits: new Map(),
    branchTaken: new Map(),
  };
}

/** Parse one LCOV report's text and sum its records into `acc` (the running union across shards). */
function accumulate(acc: CoverageByFile, lcovText: string): void {
  // `TN:` precedes `SF:`; hold its value until SF: names the file the block belongs to.
  let pendingTestName = "";
  let current: FileCoverage | undefined;

  for (const raw of lcovText.split("\n")) {
    const line = raw.trim();

    if (line.startsWith("TN:")) {
      pendingTestName = line.slice(3);
    } else if (line.startsWith("SF:")) {
      const sourceFile = line.slice(3);
      current = acc.get(sourceFile);
      if (!current) {
        current = newFileCoverage(pendingTestName);
        acc.set(sourceFile, current);
      }
    } else if (!current) {
      continue; // records before the first SF: have no file to attach to
    } else if (line.startsWith("FN:")) {
      const [defLine, ...nameParts] = line.slice(3).split(",");
      current.functionDefLine.set(nameParts.join(","), Number(defLine));
    } else if (line.startsWith("FNDA:")) {
      const [hits, ...nameParts] = line.slice(5).split(",");
      const name = nameParts.join(",");
      current.functionHits.set(name, (current.functionHits.get(name) ?? 0) + Number(hits));
    } else if (line.startsWith("DA:")) {
      const [lineNo, hits] = line.slice(3).split(",");
      const ln = Number(lineNo);
      current.lineHits.set(ln, (current.lineHits.get(ln) ?? 0) + Number(hits));
    } else if (line.startsWith("BRDA:")) {
      const [ln, block, branch, taken] = line.slice(5).split(",");
      const key = `${ln},${block},${branch}`;
      const previous = current.branchTaken.get(key);
      if (taken === "-") {
        // Only record "unreached" if no shard ever reached this branch.
        if (previous === undefined) current.branchTaken.set(key, "-");
      } else {
        const base = typeof previous === "number" ? previous : 0;
        current.branchTaken.set(key, base + Number(taken));
      }
    }
  }
}

/** Render merged coverage back to LCOV text, recomputing the found/hit (`*F`/`*H`) counters. */
function render(acc: CoverageByFile): string {
  const out: string[] = [];
  for (const [sourceFile, fc] of acc) {
    out.push(`TN:${fc.testName}`);
    out.push(`SF:${sourceFile}`);

    for (const [name, defLine] of fc.functionDefLine) out.push(`FN:${defLine},${name}`);
    for (const [name, hits] of fc.functionHits) out.push(`FNDA:${hits},${name}`);
    out.push(`FNF:${fc.functionDefLine.size}`);
    out.push(`FNH:${countHit(fc.functionHits.values())}`);

    for (const [key, taken] of fc.branchTaken) out.push(`BRDA:${key},${taken}`);
    out.push(`BRF:${fc.branchTaken.size}`);
    out.push(`BRH:${[...fc.branchTaken.values()].filter((t) => typeof t === "number" && t > 0).length}`);

    for (const [ln, hits] of [...fc.lineHits.entries()].sort((a, b) => a[0] - b[0])) out.push(`DA:${ln},${hits}`);
    out.push(`LF:${fc.lineHits.size}`);
    out.push(`LH:${countHit(fc.lineHits.values())}`);

    out.push("end_of_record");
  }
  return out.join("\n") + "\n";
}

/** Number of entries with a positive hit count (the `*H` half of an LCOV found/hit pair). */
function countHit(hits: Iterable<number>): number {
  let n = 0;
  for (const h of hits) if (h > 0) n++;
  return n;
}

/**
 * Merge several LCOV report CONTENTS (not file paths) into one LCOV text. Pure and order-independent
 * over the union — the unit-test entry point.
 */
export function mergeLcovReports(reports: string[]): string {
  const acc: CoverageByFile = new Map();
  for (const text of reports) accumulate(acc, text);
  return render(acc);
}

/** Recursively collect `*.info` files under the given paths (a path may be a file or a directory). */
function collectInfoFiles(paths: string[]): string[] {
  const files: string[] = [];
  for (const p of paths) {
    if (statSync(p).isDirectory()) {
      for (const entry of readdirSync(p)) files.push(...collectInfoFiles([join(p, entry)]));
    } else if (p.endsWith(".info")) {
      files.push(p);
    }
  }
  return files;
}

function main(): void {
  const [output, ...inputs] = process.argv.slice(2);
  if (!output || inputs.length === 0) {
    process.stderr.write("usage: mergeLcov.ts <output.info> <input.info|dir ...>\n");
    process.exit(1);
  }
  const files = collectInfoFiles(inputs);
  if (files.length === 0) {
    process.stderr.write(`mergeLcov: no .info files found under ${inputs.join(", ")}\n`);
    process.exit(1);
  }
  const merged = mergeLcovReports(files.map((f) => readFileSync(f, "utf8")));
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, merged);
  const fileCount = (merged.match(/^SF:/gm) || []).length;
  process.stdout.write(`mergeLcov: merged ${files.length} reports → ${output} (${fileCount} files)\n`);
}

// Run only when invoked as a CLI; importing the module (e.g. from the unit test) does not run main.
if (require.main === module) main();
