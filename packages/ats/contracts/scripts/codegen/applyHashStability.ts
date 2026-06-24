// SPDX-License-Identifier: Apache-2.0
//
// Hash-stability check. Compares the set of annotated `(kind, arg) -> hex`
// triples between a base git ref (typically `origin/<pr-base>`) and the
// current working tree. Flags two breakages that matter for on-chain
// compatibility:
//
//   1. A `(kind, arg)` pair present on BOTH sides whose hex differs.
//      → the formula or the canonical input changed; deployed contracts can
//        no longer find their roles / slots / resolver keys.
//
//   2. A `(kind, arg)` pair that existed on base and is GONE from HEAD.
//      → the on-chain identifier was retired; any deployed contract still
//        registering or granting under that hash is now orphaned.
//
// New `(kind, arg)` pairs on HEAD are silent — additions are safe.
//
// BOOTSTRAP CASE: when the base ref pre-dates the introduction of the
// `@custom:hash` annotation system (i.e. base has zero annotated constants),
// every constant on HEAD is a "new" pair and the checker reports clean. The
// BBND-1674 commit itself falls in this case — there is no prior annotation
// set to compare against, so the migration's hash changes are evaluated by
// human review + the changeset note instead. From the first post-BBND-1674
// PR onwards, the base set is non-empty and the checker provides real cover.
//
// Modes:
//   --base <ref>   Required. Git ref to compare against (e.g.
//                  `origin/development`).
//   --soft         Default. Print `::warning::`-style annotations and exit 0
//                  so this can roll out without blocking PRs while the team
//                  gets used to it.
//   --strict       Exit 1 on any change. Use once the warning rollout has
//                  bedded in.

import { execFileSync } from "child_process";
import path from "path";

import { HashKind, isHashKind, isValidPascalArg } from "./hashGen";

const PKG_ROOT = path.resolve(__dirname, "..", "..");
const REPO_ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: PKG_ROOT, encoding: "utf8" }).trim();
// Path of the contracts source tree relative to the repository root. Both
// `git ls-tree` output and `git show <ref>:<path>` argument MUST use this
// repo-root-relative form, even though the script's invocation cwd is the
// package root.
const REPO_REL_SCAN_PREFIX = path.relative(REPO_ROOT, path.join(PKG_ROOT, "contracts")).replace(/\\/g, "/") + "/";
const ANNOTATION = /^\s*\/\/\/\s*@custom:hash\s+(\S+)\s+(\S+)\s*$/;
const CONSTANT = /^\s*bytes32\s+constant\s+(\w+)\s*=\s*(0x[0-9a-fA-F]{64})\s*;.*$/;
const EXCLUDE_SUBPATHS = ["factory/ERC3643/", "hardhat-dependency-compiler/", "test/"];
const EXCLUDE_PATTERN = /\/test\//;

interface Entry {
  file: string;
  line: number;
  kind: HashKind;
  arg: string;
  identifier: string;
  hex: string;
}

function git(args: string[]): string {
  return execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function isInScope(repoRelPath: string): boolean {
  if (!repoRelPath.endsWith(".sol")) return false;
  if (!repoRelPath.startsWith(REPO_REL_SCAN_PREFIX)) return false;
  const sub = repoRelPath.slice(REPO_REL_SCAN_PREFIX.length);
  if (EXCLUDE_SUBPATHS.some((pre) => sub.startsWith(pre))) return false;
  if (EXCLUDE_PATTERN.test(sub)) return false;
  return true;
}

function listFilesAtRef(ref: string): string[] {
  const out = git(["ls-tree", "-r", "--name-only", ref, "--", REPO_REL_SCAN_PREFIX]);
  return out.split("\n").filter(isInScope);
}

function readFileAtRef(ref: string, repoRelPath: string): string {
  return git(["show", `${ref}:${repoRelPath}`]);
}

function listFilesOnDisk(): string[] {
  // Cheapest portable file walker that respects the same excludes.
  const out = git(["ls-files", REPO_REL_SCAN_PREFIX]);
  return out.split("\n").filter(isInScope);
}

function parse(file: string, content: string): Entry[] {
  const out: Entry[] = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const ann = lines[i].match(ANNOTATION);
    if (!ann) continue;
    const [, kind, arg] = ann;
    if (!isHashKind(kind) || !isValidPascalArg(arg)) continue;
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      const m = lines[j].match(CONSTANT);
      if (m) {
        const [, identifier, hex] = m;
        out.push({ file, line: j + 1, kind: kind as HashKind, arg, identifier, hex });
        break;
      }
    }
  }
  return out;
}

function collectAtRef(ref: string): Entry[] {
  const files = listFilesAtRef(ref);
  const all: Entry[] = [];
  for (const f of files) {
    let content: string;
    try {
      content = readFileAtRef(ref, f);
    } catch {
      // File may have been added later. Skip silently.
      continue;
    }
    all.push(...parse(f, content));
  }
  return all;
}

function collectOnDisk(): Entry[] {
  const fs = require("fs");
  const files = listFilesOnDisk();
  const all: Entry[] = [];
  for (const f of files) {
    const content = fs.readFileSync(path.join(REPO_ROOT, f), "utf8");
    all.push(...parse(f, content));
  }
  return all;
}

interface Diff {
  kind: "changed" | "removed";
  pair: string; // "kind::arg"
  baseHex: string;
  headHex?: string;
  baseLocation: string;
  headLocation?: string;
}

function diffEntries(base: Entry[], head: Entry[]): Diff[] {
  const headByPair = new Map<string, Entry>();
  for (const e of head) {
    headByPair.set(`${e.kind}::${e.arg}`, e);
  }
  const baseByPair = new Map<string, Entry>();
  for (const e of base) {
    baseByPair.set(`${e.kind}::${e.arg}`, e);
  }

  const diffs: Diff[] = [];
  for (const [pair, baseEntry] of baseByPair) {
    const headEntry = headByPair.get(pair);
    const baseLoc = `${baseEntry.file}:${baseEntry.line} (${baseEntry.identifier})`;
    if (!headEntry) {
      diffs.push({ kind: "removed", pair, baseHex: baseEntry.hex, baseLocation: baseLoc });
      continue;
    }
    if (baseEntry.hex.toLowerCase() !== headEntry.hex.toLowerCase()) {
      diffs.push({
        kind: "changed",
        pair,
        baseHex: baseEntry.hex,
        headHex: headEntry.hex,
        baseLocation: baseLoc,
        headLocation: `${headEntry.file}:${headEntry.line} (${headEntry.identifier})`,
      });
    }
  }
  return diffs;
}

function main(): void {
  const argv = process.argv.slice(2);
  let base: string | undefined;
  let strict = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--base") base = argv[++i];
    else if (argv[i] === "--strict") strict = true;
    else if (argv[i] === "--soft") strict = false;
    else {
      console.error(`Unknown argument: ${argv[i]}`);
      process.exit(2);
    }
  }
  if (!base) {
    console.error("Usage: applyHashStability.ts --base <ref> [--soft | --strict]");
    process.exit(2);
  }

  // Verify the base ref exists locally — fail clearly if the CI step didn't
  // fetch it.
  try {
    git(["rev-parse", "--verify", base]);
  } catch {
    console.error(`❌ hash stability: base ref '${base}' does not exist locally. Did you forget 'git fetch'?`);
    process.exit(2);
  }

  const baseEntries = collectAtRef(base);
  const headEntries = collectOnDisk();
  const diffs = diffEntries(baseEntries, headEntries);

  if (diffs.length === 0) {
    console.log(`✅ hash stability: no pre-existing hash changed vs ${base}`);
    return;
  }

  const annotate = strict ? "::error::" : "::warning::";
  console.log("");
  console.log(`${strict ? "❌" : "⚠️ "} hash stability: ${diffs.length} pre-existing hash(es) changed vs ${base}`);
  console.log("");
  for (const d of diffs) {
    if (d.kind === "changed") {
      console.log(`${annotate}Hash changed for @custom:hash ${d.pair.replace("::", " ")}`);
      console.log(`   base: ${d.baseHex}  @ ${d.baseLocation}`);
      console.log(`   head: ${d.headHex}  @ ${d.headLocation}`);
    } else {
      console.log(`${annotate}Hash removed for @custom:hash ${d.pair.replace("::", " ")}`);
      console.log(`   base: ${d.baseHex}  @ ${d.baseLocation}`);
      console.log(`   head: (removed)`);
    }
    console.log("");
  }
  console.log(`   ⓘ Deployed contracts that registered under these hashes may be affected.`);
  console.log(`     Confirm with the team before merging.`);

  if (strict) process.exit(1);
}

if (require.main === module) {
  main();
}
