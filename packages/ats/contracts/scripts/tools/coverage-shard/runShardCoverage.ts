// SPDX-License-Identifier: Apache-2.0
//
// Run `hardhat coverage` for ONE shard. Reads SHARD_INDEX / SHARD_TOTAL from the environment
// (defaults 0 / 1 → the whole set in one shard), asks planShard for this shard's test files, and
// runs solidity-coverage over just those. See ./README.md for the whole shard pipeline.
//
// CI calls this once per matrix runner; runParallelCoverage calls it once per local worktree.
//
// Usage: SHARD_INDEX=0 SHARD_TOTAL=4 npx tsx scripts/tools/coverage-shard/runShardCoverage.ts

import { spawnSync } from "child_process";
import { createRequire } from "module";
import { join } from "path";
import { planShard } from "./planShard";

const index = Number.parseInt(process.env.SHARD_INDEX ?? "0", 10);
const count = Number.parseInt(process.env.SHARD_TOTAL ?? "1", 10);

const files = planShard(index, count);
if (files.length === 0) {
  process.stderr.write(`coverage shard ${index}/${count} resolved to no test files\n`);
  process.exit(1);
}

// solidity-coverage's --testfiles takes ONE glob; for >1 file we pass a brace list `{a,b,c}`, which
// its globby understands. (A single-element `{x}` is NOT expanded by globby, so pass the bare path.)
const testfiles = files.length === 1 ? files[0] : `{${files.join(",")}}`;

// solidity-coverage stat()s --testfiles as a single path-like glob, so an over-long value overflows
// the OS path limit (ENAMETOOLONG). Guard with an actionable message; realistic shard lists are far
// shorter (~900 leaves margin under the 1024 macOS limit).
const MAX_TESTFILES_LENGTH = 900;
if (testfiles.length > MAX_TESTFILES_LENGTH) {
  process.stderr.write(
    `coverage shard ${index}/${count}: --testfiles glob is ${testfiles.length} chars (> ${MAX_TESTFILES_LENGTH}); ` +
      `raise SHARD_TOTAL (more, smaller shards) or run the full local coverage via 'npm run test:coverage'.\n`,
  );
  process.exit(1);
}

process.stdout.write(`coverage shard ${index}/${count}: ${files.length} test files\n`);

// We must NOT go through `npx` (or any shell): a shell brace-expands the `{a,b,c}` glob into separate
// arguments, which Hardhat then rejects with "HH308: Unrecognized positional argument …" (verified).
// So run Hardhat's CLI entry directly under `node` — that is hardhat's package.json `bin.hardhat`
// target — passing the glob as a single literal argv element so solidity-coverage's globby expands it.
const hardhatCli = createRequire(join(process.cwd(), "package.json")).resolve("hardhat/internal/cli/bootstrap.js");

// The mega-asset entry (ats.test.ts) is in every shard's file list; it reads ATS_MEGA_SHARD_* to run
// only this shard's balanced slice in a single deploy (see ats.test.ts).
const result = spawnSync(process.execPath, [hardhatCli, "coverage", "--testfiles", testfiles], {
  stdio: "inherit",
  shell: false,
  env: { ...process.env, ATS_MEGA_SHARD_INDEX: String(index), ATS_MEGA_SHARD_TOTAL: String(count) },
});
process.exit(result.status ?? 1);
