# Test sharding & parallel coverage

This directory + a few test-side files implement two things on top of the ATS mega-asset test suite:

1. **Parallel local test runs** (`npm run test:parallel:ats`) — split the mega-asset core across mocha workers.
2. **Sharded coverage** — run `solidity-coverage` in parallel and merge into one report. Both in CI (a 4-way
   GitHub Actions matrix) and locally (`npm run test:coverage:parallel`, one git worktree per shard).

Net effect: CI coverage ~14m → ~7m, local coverage ~11m → ~5m, with the **same** merged numbers as a serial run.

## The constraint that shapes everything

The IAsset suites export a `…Tests(getCtx)` function and **do not self-register** a `describe`. The only file
that executes them is `ats.test.ts`. Consequences:

- Coverage **cannot** be sharded by directory glob (`--testfiles 'layer_1/**'` would run none of them).
- `mocha --parallel` shards by **file**, so the whole core in one file = one worker = no speedup.

So a single piece of infrastructure feeds both goals: a discovery + balancing core, driven two ways.

## The pieces

| File                                                         | Role                                                                                                                                                                                |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test/contracts/integration/suiteDiscovery.ts`               | Discover the IAsset suite files; `suiteWeight` (an `it()` count) and `assignBalancedShards` (greedy longest-processing-time bin-packing) to split them into evenly-weighted shards. |
| `test/contracts/integration/atsShardRunner.ts`               | `runAtsShard(index, total)` — deploy the mega-asset **once** (`loadFixture`) and run only this shard's balanced slice.                                                              |
| `test/contracts/integration/ats.test.ts`                     | The entry. Reads `ATS_MEGA_SHARD_INDEX/TOTAL` (default `0/1` = every suite, one deploy = the serial CI run).                                                                        |
| `test/contracts/integration/shards/ats.shard.{1..8}.test.ts` | Physical entries for **local** `mocha --parallel` (one file → one worker → `runAtsShard(k-1, 8)`).                                                                                  |
| `scripts/tools/coverage-shard/planShard.ts`                  | A coverage shard's file list: the mega entry (in every shard) + a balanced slice of the standalone suites.                                                                          |
| `scripts/tools/coverage-shard/runShardCoverage.ts`           | Run `hardhat coverage` for ONE shard (CI calls per runner; the local runner calls per worktree).                                                                                    |
| `scripts/tools/coverage-shard/mergeLcov.ts`                  | Union the per-shard lcovs into one report (preserving line/function/branch).                                                                                                        |
| `scripts/tools/coverage-shard/runParallelCoverage.ts`        | Local orchestrator: a git worktree per shard, run them concurrently, merge, tear down.                                                                                              |
| `tasks/compile.ts`                                           | Skips the redundant second compile `hardhat coverage` would trigger (see below).                                                                                                    |
| `.github/workflows/100-flow-ats-test.yaml`                   | The CI matrix (`coverage-ats`, 4 shards) + the `merge-coverage` job.                                                                                                                |

## Two parallelism mechanisms — and why both exist

|                                            | Parallelism unit                 | How a shard is selected                                  |
| ------------------------------------------ | -------------------------------- | -------------------------------------------------------- |
| **Local tests** (`test:parallel:ats`)      | mocha workers (one per **file**) | the 8 physical `shards/ats.shard.N.test.ts` files        |
| **Coverage** (CI matrix & local worktrees) | separate runners / worktrees     | one `ats.test.ts` parametrised by `ATS_MEGA_SHARD_*` env |

mocha can only parallelise across _files_, so local parallel tests need physical shard files. Coverage gets its
isolation from separate runners/worktrees, so it needs no extra files — the shard count is just an env var.

## Why worktrees for local parallel coverage

A coverage run **rewrites generated source in place** — the compile hook regenerates
`contracts/infrastructure/utils/EvmAccessors.sol` and `scripts/domain/atsRegistry.generated.ts`, and
solidity-coverage instruments the build. N concurrent shards in one checkout would race and corrupt each other.
A git worktree per shard gives each an isolated working tree (the same isolation CI gets from separate runners);
`node_modules` is symlinked, not reinstalled. Shard lcovs have worktree-absolute `SF:` paths, so they are
normalised to package-relative before merging (otherwise the merge can't union them).

Each worktree is created at HEAD and then **overlaid with your working tree**, so local parallel coverage
measures uncommitted work — matching serial `npm run test:coverage` — rather than only committed code. The
overlay is a `git diff HEAD --binary` patch (tracked edits, deletions, renames) plus the untracked,
non-`.gitignore`d files from `git ls-files --others --exclude-standard` (so a brand-new test file is included,
while artifacts and the generated registry are not). A clean tree overlays nothing, so the run is identical to
a committed one. No flag to set — for committed-only, `git stash` first.

## Why an in-repo lcov merger (not `lcov` / `lcov-result-merger`)

- `lcov-result-merger` (npm) silently **drops function coverage**.
- The system `lcov` CLI reproduces the numbers only with a large `--rc`/`--ignore-errors` flag soup, emits
  thousands of "inconsistent" warnings on solidity-coverage's output, and rewrites the file in a newer
  function-record format (`FNL`/`FNA`) whose Codecov support is unverified.

`mergeLcov.ts` is ~100 lines, exact, dependency-free, and unit-tested
(`test/scripts/unit/tools/mergeLcov.test.ts`).

## Why the compile-skip in `tasks/compile.ts`

`hardhat coverage` compiles the instrumented sources itself and then runs `TASK_TEST`, which compiles **again**.
That second pass is a wasted ~60s/shard. The override forces `noCompile` while a coverage run is in progress,
detected via solidity-coverage's own `__SOLIDITY_COVERAGE_RUNNING` HRE flag (set only during `hardhat coverage`).

## `runShardCoverage` must not go through a shell

`solidity-coverage --testfiles` takes one glob; for >1 file we pass a brace list `{a,b,c}`. We run Hardhat's CLI
directly under `node` (not `npx`), because a shell brace-expands `{a,b,c}` into separate arguments, which Hardhat
then rejects with `HH308: Unrecognized positional argument …` (verified).

## Running it

```bash
npm run test                  # serial, all suites — the CI gate (ats.test.ts at 0/1)
npm run test:parallel:ats     # local parallel tests across the 8 shard files
npm run test:coverage         # serial single-run coverage (SHARD_TOTAL=1)
npm run test:coverage:parallel  # local parallel coverage (4 worktrees) — needs `lcov`? no, uses mergeLcov.ts
SHARD_INDEX=2 SHARD_TOTAL=4 npm run test:coverage:shard   # reproduce one CI coverage shard locally
```

## Maintenance notes

- **Changing the CI shard count:** edit the matrix `shard: [...]` list AND `SHARD_TOTAL` in
  `100-flow-ats-test.yaml` (keep them equal). `planShard`/`mergeLcov` handle any count. 4 is the measured
  sweet spot — beyond it the per-shard ~2m45s instrument+compile floor dominates and wall-clock stops improving.
- **The 8 local shard files hardcode `N=8`** (`runAtsShard(k-1, 8)`). Changing local parallel granularity means
  adding/removing files and keeping the indices in sync; `MIN_EXPECTED_SUITES` in `suiteDiscovery` fails loudly
  if discovery ever drops suites.
- Adding an IAsset suite needs no changes here — discovery picks up any `…Tests(getCtx)` file automatically.
