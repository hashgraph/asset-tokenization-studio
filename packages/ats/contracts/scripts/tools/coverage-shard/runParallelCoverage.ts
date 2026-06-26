// SPDX-License-Identifier: Apache-2.0
//
// Local parallel coverage — the local twin of the CI coverage matrix. Runs each shard concurrently,
// each in its OWN ephemeral git worktree (required: a coverage run rewrites generated source in
// place, so N shards in one checkout would corrupt each other). Each worktree is created at HEAD and
// then OVERLAID with the main checkout's uncommitted state (tracked edits/deletes/renames via a git
// patch + untracked, non-ignored files), so the run measures your working tree — matching serial
// `npm run test:coverage`. A clean tree overlays nothing, so the run is identical to a committed one.
// The per-shard lcovs are merged into the main checkout's coverage/lcov.info; node_modules is
// symlinked, not reinstalled. See ./README.md for the full rationale.
//
// Usage: SHARD_TOTAL=4 npx tsx scripts/tools/coverage-shard/runParallelCoverage.ts
//   SHARD_TOTAL            number of shards / worktrees (default 4)
//   COVERAGE_MAX_PARALLEL  cap concurrent shards (default = SHARD_TOTAL)

import { spawn, execFileSync } from "child_process";
import { mkdtempSync, rmSync, mkdirSync, symlinkSync, existsSync, readFileSync, writeFileSync, copyFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve, dirname } from "path";

const PACKAGE_DIR = process.cwd(); // always the contracts package dir via its npm scripts
const REPO_ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: PACKAGE_DIR }).toString().trim();
const PACKAGE_REL = "packages/ats/contracts";
const PACKAGE_ANCHOR = "/packages/ats/contracts/";

const shardTotal = Number.parseInt(process.env.SHARD_TOTAL ?? "4", 10);
const maxParallel = Number.parseInt(process.env.COVERAGE_MAX_PARALLEL ?? String(shardTotal), 10);

if (!Number.isInteger(shardTotal) || shardTotal < 1) {
  process.stderr.write(`runParallelCoverage: invalid SHARD_TOTAL=${process.env.SHARD_TOTAL}\n`);
  process.exit(1);
}

interface ShardResult {
  index: number;
  ok: boolean;
  lcov: string | null;
}

/** The main checkout's uncommitted state, captured once so every worktree can be overlaid to match
 *  it. `patchFile` holds tracked edits/deletes/renames (a binary git patch) or is null when there are
 *  none; `untracked` lists new, non-ignored files. Both empty ⇒ clean tree ⇒ worktrees stay at HEAD. */
interface WorkingTreeOverlay {
  patchFile: string | null;
  trackedCount: number;
  untracked: string[];
}

/** Create a detached worktree at HEAD (avoids the "branch already checked out" conflict). It is then
 *  overlaid with the working tree by applyWorkingTree, so it reflects uncommitted changes too. */
function addWorktree(path: string): void {
  execFileSync("git", ["worktree", "add", "--detach", path, "HEAD"], { cwd: REPO_ROOT, stdio: "ignore" });
}

function removeWorktree(path: string): void {
  try {
    execFileSync("git", ["worktree", "remove", "--force", path], { cwd: REPO_ROOT, stdio: "ignore" });
  } catch {
    // The worktree may not have been created (early failure) — nothing to remove.
  }
}

/** Symlink the main checkout's node_modules into the worktree so the shard resolves deps without a
 *  reinstall: the workspace-hoisted root plus the contracts package dir. */
function linkNodeModules(worktree: string): void {
  const links: Array<[string, string]> = [
    [join(REPO_ROOT, "node_modules"), join(worktree, "node_modules")],
    [join(REPO_ROOT, PACKAGE_REL, "node_modules"), join(worktree, PACKAGE_REL, "node_modules")],
  ];
  for (const [target, linkPath] of links) {
    if (existsSync(target) && !existsSync(linkPath)) symlinkSync(target, linkPath, "junction");
  }
}

/** Capture the main checkout's uncommitted changes. `git diff HEAD --binary` covers every tracked
 *  modification, deletion and rename; `git ls-files --others --exclude-standard` lists untracked files
 *  while honouring .gitignore — so node_modules, artifacts, coverage and the generated registry are
 *  excluded automatically, and only genuine new sources/tests are carried. */
function captureWorkingTree(baseDir: string): WorkingTreeOverlay {
  const patch = execFileSync("git", ["diff", "HEAD", "--binary"], { cwd: REPO_ROOT, maxBuffer: 1024 ** 3 });
  const trackedCount = execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: REPO_ROOT })
    .toString()
    .split("\n")
    .filter(Boolean).length;
  const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard", "-z"], { cwd: REPO_ROOT })
    .toString()
    .split("\0")
    .filter(Boolean);
  let patchFile: string | null = null;
  if (patch.length > 0) {
    patchFile = join(baseDir, "worktree.patch");
    writeFileSync(patchFile, patch);
  }
  return { patchFile, trackedCount, untracked };
}

/** Overlay the captured working-tree state onto a fresh worktree so the shard measures what the
 *  developer currently has, not just HEAD. The worktree shares the main repo's HEAD, so the patch
 *  always applies cleanly; a failure means a broken overlay, so fail loudly rather than silently
 *  measure stale code. No-op when the capture is empty (clean tree). */
function applyWorkingTree(worktree: string, overlay: WorkingTreeOverlay): void {
  if (overlay.patchFile) {
    try {
      execFileSync("git", ["apply", "--whitespace=nowarn", overlay.patchFile], { cwd: worktree, stdio: "ignore" });
    } catch (err) {
      throw new Error(
        `failed to overlay working-tree changes onto ${worktree}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  for (const rel of overlay.untracked) {
    const src = join(REPO_ROOT, rel);
    if (!existsSync(src)) continue; // removed between capture and copy — skip
    const dest = join(worktree, rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
  }
}

/** Rewrite a shard lcov's `SF:` lines from worktree-absolute to package-relative, so every shard
 *  names the same source files and the merge unions them (otherwise each worktree's distinct path
 *  prefix keeps files separate — N×461 entries instead of 461). Anchor on the package-path substring,
 *  not the worktree string: on macOS the temp dir resolves through a /tmp → /private/tmp symlink, so
 *  the literal worktree prefix would not match the realpath'd SF line. */
function normaliseSfPaths(srcLcov: string, dest: string): void {
  const rewritten = readFileSync(srcLcov, "utf8")
    .split("\n")
    .map((line) => {
      if (!line.startsWith("SF:")) return line;
      const at = line.indexOf(PACKAGE_ANCHOR);
      return at === -1 ? line : `SF:${line.slice(at + PACKAGE_ANCHOR.length)}`;
    })
    .join("\n");
  writeFileSync(dest, rewritten);
}

/** Run one shard's coverage in its own worktree; resolves with the shard's lcov path (or null). */
async function runShard(index: number, baseDir: string, overlay: WorkingTreeOverlay): Promise<ShardResult> {
  const worktree = join(baseDir, `shard-${index}`);
  addWorktree(worktree);
  linkNodeModules(worktree);
  applyWorkingTree(worktree, overlay);

  const cwd = join(worktree, PACKAGE_REL);
  return new Promise<ShardResult>((resolveShard) => {
    const child = spawn("npm", ["run", "test:coverage:shard"], {
      cwd,
      stdio: ["ignore", "inherit", "inherit"],
      env: { ...process.env, SHARD_INDEX: String(index), SHARD_TOTAL: String(shardTotal) },
    });
    child.on("exit", (code) => {
      const lcov = join(cwd, "coverage", "lcov.info");
      resolveShard({ index, ok: code === 0, lcov: existsSync(lcov) ? lcov : null });
    });
  });
}

/** Run all shards with a bounded-concurrency pool: `maxParallel` workers each pull the next index. */
async function runAll(baseDir: string, overlay: WorkingTreeOverlay): Promise<ShardResult[]> {
  const results: ShardResult[] = [];
  let next = 0;
  async function worker(): Promise<void> {
    while (next < shardTotal) {
      results.push(await runShard(next++, baseDir, overlay));
    }
  }
  await Promise.all(Array.from({ length: Math.min(maxParallel, shardTotal) }, () => worker()));
  return results.sort((a, b) => a.index - b.index);
}

/** Merge the successful shards' (path-normalised) lcovs into the main checkout's coverage/lcov.info. */
function mergeShardLcovs(results: ShardResult[]): number {
  const shardDir = join(PACKAGE_DIR, "coverage", "parallel-shards");
  mkdirSync(shardDir, { recursive: true });
  const collected: string[] = [];
  for (const r of results) {
    if (r.ok && r.lcov) {
      const dest = join(shardDir, `shard-${r.index}.info`);
      normaliseSfPaths(r.lcov, dest);
      collected.push(dest);
    }
  }
  if (collected.length > 0) {
    const merger = resolve(PACKAGE_DIR, "scripts/tools/coverage-shard/mergeLcov.ts");
    const out = join(PACKAGE_DIR, "coverage", "lcov.info");
    execFileSync(process.execPath, ["--import", "tsx", merger, out, ...collected], { stdio: "inherit" });
    process.stdout.write(`runParallelCoverage: merged ${collected.length} shard(s) → ${out}\n`);
  }
  return collected.length;
}

async function main(): Promise<void> {
  const baseDir = mkdtempSync(join(tmpdir(), "ats-coverage-parallel-"));
  const overlay = captureWorkingTree(baseDir);
  if (overlay.patchFile || overlay.untracked.length > 0) {
    process.stdout.write(
      `runParallelCoverage: overlaying your working tree onto each shard ` +
        `(${overlay.trackedCount} changed, ${overlay.untracked.length} untracked) — coverage reflects uncommitted changes\n`,
    );
  }
  process.stdout.write(`runParallelCoverage: ${shardTotal} shards (≤${maxParallel} concurrent) in ${baseDir}\n`);

  try {
    const results = await runAll(baseDir, overlay);
    mergeShardLcovs(results);
    const failed = results.filter((r) => !r.ok).map((r) => r.index);
    if (failed.length > 0) {
      process.stderr.write(`runParallelCoverage: shard(s) ${failed.join(", ")} failed\n`);
      process.exitCode = 1;
    }
  } finally {
    for (let i = 0; i < shardTotal; i++) removeWorktree(join(baseDir, `shard-${i}`));
    rmSync(baseDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  process.stderr.write(`runParallelCoverage: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
