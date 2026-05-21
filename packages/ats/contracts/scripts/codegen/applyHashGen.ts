// SPDX-License-Identifier: Apache-2.0
//
// Walks every `.sol` source file under `contracts/` and rewrites each
// `bytes32 constant <NAME> = 0x...;` annotated with
// `/// @custom:hash <kind> <arg>` to the canonical hex returned by `HASHES`.
//
// Modes:
//   --write   rewrite drift in place (used by `npm run ats:contracts:hashes:generate`
//             and by the hardhat compile hook in `tasks/generateHashes.ts`).
//   --check   exit non-zero on any drift (used in CI via
//             `npm run ats:contracts:hashes:check` to keep generated hex
//             aligned with the annotations).
//
// Scope: `contracts/` only — explicitly skips `contracts/factory/ERC3643/`
// (mirror-generated) and any `test/` subdirectories.
//
// Architecture: TWO-PHASE.
//   Phase 1 (collect) — scan every in-scope file, parse every annotation +
//                       every `bytes32 constant ... = 0x<64hex>;` declaration.
//   Phase 2 (validate) — uniqueness, identifier-symmetry, hash-shaped-needs-
//                       annotation, malformed-annotation checks. Aborts BEFORE
//                       any file is rewritten if a single rule fails.
//   Phase 3 (apply)   — `--check` reports drift, `--write` does atomic
//                       per-file rewrites (write to tmp, then rename).
//
// All validators run against ALL files unconditionally so a malformed file
// halfway through the scan cannot leave the other files in a partial state.

import fs from "fs";
import path from "path";
import { sync as globSync } from "glob";

import {
  HASHES,
  HashKind,
  canonicalIdentifier,
  canonicalPascalArg,
  isCanonicalPascalArg,
  isHashKind,
  isValidPascalArg,
} from "./hashGen";

const ROOT = path.resolve(__dirname, "..", "..");
const SCAN_GLOB = "contracts/**/*.sol";
const EXCLUDES = [
  "contracts/factory/ERC3643/**",
  "contracts/hardhat-dependency-compiler/**",
  "contracts/test/**",
  "contracts/**/test/**",
];

const ANNOTATION = /^\s*\/\/\/\s*@custom:hash\s+(\S+)\s+(\S+)\s*$/;
const CONSTANT = /^(\s*bytes32\s+constant\s+(\w+)\s*=\s*)(0x[0-9a-fA-F]{64})(\s*;.*)$/;

// Bytes32 constants whose hex literal IS hash-shaped (non-zero 64-hex) but
// which deliberately stay OUTSIDE the codegen system. Each entry is matched
// by the bare identifier name. Extend ONLY with explicit team approval.
const HASH_SHAPED_ALLOWLIST: ReadonlySet<string> = new Set([
  // OpenZeppelin standard, value is conventionally bytes32(0); included for
  // safety in case anyone hand-writes it as `0x0000...`.
  "DEFAULT_ADMIN_ROLE",
  // Project sentinel: bytes32 integer "1" used as the default ERC1410 partition
  // identifier. Hash-shaped only because it's a 32-byte left-padded literal.
  "_DEFAULT_PARTITION",
]);

// Suffix-based allowlist — applied AFTER the bare-name allowlist above.
// EIP-712 typehashes are foldable single-keccak constants computed by solc
// itself; they have no `@custom:hash` annotation and never will.
const HASH_SHAPED_SUFFIX_ALLOWLIST: ReadonlyArray<RegExp> = [/_TYPEHASH$/];

interface Annotation {
  file: string;
  line: number; // 1-based
  kind: HashKind;
  arg: string;
}

interface ConstantDecl {
  file: string;
  line: number; // 1-based
  identifier: string;
  hex: string; // current hex on disk
}

interface AnnotatedConstant {
  annotation: Annotation;
  constant: ConstantDecl;
  expected: string; // hex computed from the annotation
}

interface ScanResult {
  filesScanned: number;
  files: Map<string, { lines: string[]; eol: string }>;
  annotated: AnnotatedConstant[];
  // Constants that look hash-shaped but had no annotation above them.
  unannotatedHashShaped: ConstantDecl[];
  // Errors gathered during the collection pass (kept as data so all files
  // contribute their findings; the apply pass aborts iff any are present).
  errors: string[];
}

function detectEol(text: string): string {
  // Prefer the dominant EOL of the file. Solidity files are typically LF; we
  // preserve whatever the source uses to avoid noisy diffs.
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function isAllowlistedHashShaped(identifier: string): boolean {
  if (HASH_SHAPED_ALLOWLIST.has(identifier)) return true;
  return HASH_SHAPED_SUFFIX_ALLOWLIST.some((re) => re.test(identifier));
}

/**
 * Parse one file. Records every annotation, every constant declaration, every
 * annotated-constant pairing, and every "hash-shaped but unannotated" constant.
 * Schema validation (unknown kind, invalid Pascal arg, missing match within
 * window, etc.) is performed here and surfaces as entries in `result.errors`.
 * The function never throws.
 */
function scanFile(file: string, result: ScanResult): void {
  const text = fs.readFileSync(file, "utf8");
  const eol = detectEol(text);
  const lines = text.split(/\r\n|\n/);
  result.files.set(file, { lines, eol });
  const rel = path.relative(ROOT, file);

  // Per-file: cache constant declarations so the unannotated check has line info.
  const annotatedConstantLines = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    const annotationMatch = lines[i].match(ANNOTATION);
    if (!annotationMatch) continue;

    const [, kind, arg] = annotationMatch;

    if (!isHashKind(kind)) {
      result.errors.push(
        `${rel}:${i + 1}: unknown @custom:hash kind '${kind}'. ` +
          `Valid: storage, resolverKey, role, corporateAction, scheduledTask.`,
      );
      continue;
    }

    if (!isValidPascalArg(arg)) {
      result.errors.push(
        `${rel}:${i + 1}: invalid @custom:hash arg '${arg}'. ` +
          `Args must be PascalCase: start with an upper-case letter, only letters and digits.`,
      );
      continue;
    }

    // D9 — canonical PascalCase check. `Kyc` and `KYC` both pass `isValidPascalArg`
    //      AND produce the same canonical identifier (`ROLE_KYC`), but they keccak
    //      to DIFFERENT on-chain hashes. Force the canonical round-trip form so
    //      switching between equivalent-looking PascalCase variants cannot silently
    //      change a hash.
    if (!isCanonicalPascalArg(arg)) {
      result.errors.push(
        `${rel}:${i + 1}: non-canonical @custom:hash arg '${arg}'. ` +
          `Use the canonical PascalCase form '${canonicalPascalArg(arg)}' instead. ` +
          `Each word starts with one upper-case letter followed by lower-case; ` +
          `the inverse mapping from the identifier must round-trip exactly.`,
      );
      continue;
    }

    // D7 — guard against a stale annotation immediately followed by another
    //      annotation. The first one would be silently discarded.
    if (i + 1 < lines.length) {
      const next = lines[i + 1].match(ANNOTATION);
      if (next) {
        result.errors.push(
          `${rel}:${i + 1}: @custom:hash annotation is immediately followed by another ` +
            `@custom:hash annotation on line ${i + 2}. One annotation per constant.`,
        );
        continue;
      }
    }

    // Find next bytes32 constant within a small window.
    let constantLine = -1;
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      if (CONSTANT.test(lines[j])) {
        constantLine = j;
        break;
      }
    }
    if (constantLine === -1) {
      result.errors.push(`${rel}:${i + 1}: @custom:hash annotation has no matching bytes32 constant within 10 lines.`);
      continue;
    }

    const cMatch = lines[constantLine].match(CONSTANT)!;
    const [, , identifier, hex] = cMatch;

    annotatedConstantLines.add(constantLine);

    const expected = HASHES[kind as HashKind](arg);
    result.annotated.push({
      annotation: { file, line: i + 1, kind: kind as HashKind, arg },
      constant: { file, line: constantLine + 1, identifier, hex },
      expected,
    });
  }

  // Second pass — flag hash-shaped constants without annotation (Tier 1 #2).
  for (let i = 0; i < lines.length; i++) {
    if (annotatedConstantLines.has(i)) continue;
    const cMatch = lines[i].match(CONSTANT);
    if (!cMatch) continue;
    const [, , identifier, hex] = cMatch;
    // Skip zero-valued constants — they cannot represent an active on-chain
    // commitment; they're typically placeholders or sentinels.
    if (/^0x0+$/.test(hex)) continue;
    if (isAllowlistedHashShaped(identifier)) continue;
    result.unannotatedHashShaped.push({
      file,
      line: i + 1,
      identifier,
      hex,
    });
  }

  result.filesScanned++;
}

/**
 * Cross-file validation pass. Runs against ALL collected annotations after
 * every file has been scanned. Each rule is independent — the function gathers
 * all violations and returns them as a string array so the user sees the full
 * picture in one run.
 */
function validate(result: ScanResult): string[] {
  const errors: string[] = [...result.errors];

  // D1 — duplicate (kind, arg) across the codebase. Same hash, multiple
  //      sources of truth → silent collision the moment one of them drifts.
  const byPair = new Map<string, AnnotatedConstant[]>();
  for (const ac of result.annotated) {
    const key = `${ac.annotation.kind}::${ac.annotation.arg}`;
    const bucket = byPair.get(key) ?? [];
    bucket.push(ac);
    byPair.set(key, bucket);
  }
  for (const [key, bucket] of byPair) {
    if (bucket.length < 2) continue;
    const locations = bucket
      .map((ac) => `${path.relative(ROOT, ac.constant.file)}:${ac.constant.line} (${ac.constant.identifier})`)
      .join(", ");
    errors.push(
      `Duplicate @custom:hash annotation ${key.replace("::", " ")} appears ${bucket.length} ` +
        `times: ${locations}. Each (kind, arg) must be unique — likely a copy-paste error.`,
    );
  }

  // D2 — duplicate constant identifier across files. Two `bytes32 constant
  //      STORAGE_LOCATION_FOO` decls in different files survive solc (they're
  //      file-scoped) but suggest a forgotten rename.
  const byIdentifier = new Map<string, AnnotatedConstant[]>();
  for (const ac of result.annotated) {
    const bucket = byIdentifier.get(ac.constant.identifier) ?? [];
    bucket.push(ac);
    byIdentifier.set(ac.constant.identifier, bucket);
  }
  for (const [identifier, bucket] of byIdentifier) {
    if (bucket.length < 2) continue;
    const locations = bucket.map((ac) => `${path.relative(ROOT, ac.constant.file)}:${ac.constant.line}`).join(", ");
    errors.push(
      `Duplicate constant identifier '${identifier}' declared in ${bucket.length} files: ` +
        `${locations}. Each annotated constant must have a unique name.`,
    );
  }

  // D3 — hash-value collision across DIFFERENT (kind, arg) pairs. Astronomical
  //      with keccak but cheap to assert; would expose a formula regression.
  const byHash = new Map<string, AnnotatedConstant[]>();
  for (const ac of result.annotated) {
    const bucket = byHash.get(ac.expected) ?? [];
    bucket.push(ac);
    byHash.set(ac.expected, bucket);
  }
  for (const [hex, bucket] of byHash) {
    if (bucket.length < 2) continue;
    // Same (kind, arg) duplicates are already reported via D1; skip those.
    const pairs = new Set(bucket.map((ac) => `${ac.annotation.kind}::${ac.annotation.arg}`));
    if (pairs.size < 2) continue;
    const locations = bucket
      .map(
        (ac) =>
          `${path.relative(ROOT, ac.constant.file)}:${ac.constant.line} ` +
          `(@custom:hash ${ac.annotation.kind} ${ac.annotation.arg})`,
      )
      .join(", ");
    errors.push(`Hash collision ${hex}: ${locations}. The keccak formula produced the same hex for distinct inputs.`);
  }

  // Tier 1 #1 — symmetric identifier rule. The identifier MUST be the
  //              deterministic UPPER_SNAKE form derived from (kind, arg).
  for (const ac of result.annotated) {
    const expected = canonicalIdentifier(ac.annotation.kind, ac.annotation.arg);
    if (ac.constant.identifier !== expected) {
      errors.push(
        `${path.relative(ROOT, ac.constant.file)}:${ac.constant.line}: ` +
          `identifier '${ac.constant.identifier}' does not match the canonical name ` +
          `'${expected}' derived from @custom:hash ${ac.annotation.kind} ${ac.annotation.arg}.`,
      );
    }
  }

  // Tier 1 #2 — every hash-shaped constant must have an annotation (or be
  //              on the allowlist). Catches hand-pasted hashes that bypass
  //              the codegen entirely.
  for (const c of result.unannotatedHashShaped) {
    errors.push(
      `${path.relative(ROOT, c.file)}:${c.line}: bytes32 constant '${c.identifier}' has a ` +
        `hash-shaped value (${c.hex}) but no preceding @custom:hash annotation. ` +
        `Either add the annotation (preferred, then run \`npm run ats:contracts:hashes:generate\`) ` +
        `or add the identifier to HASH_SHAPED_ALLOWLIST ` +
        `in scripts/codegen/applyHashGen.ts with team approval.`,
    );
  }

  return errors;
}

interface Drift {
  file: string;
  line: number;
  identifier: string;
  kind: HashKind;
  arg: string;
  before: string;
  after: string;
}

function collectDrift(result: ScanResult): Drift[] {
  const drifts: Drift[] = [];
  for (const ac of result.annotated) {
    if (ac.constant.hex.toLowerCase() === ac.expected.toLowerCase()) continue;
    drifts.push({
      file: ac.constant.file,
      line: ac.constant.line,
      identifier: ac.constant.identifier,
      kind: ac.annotation.kind,
      arg: ac.annotation.arg,
      before: ac.constant.hex,
      after: ac.expected,
    });
  }
  return drifts;
}

function applyWrites(result: ScanResult, drifts: Drift[]): void {
  const byFile = new Map<string, Drift[]>();
  for (const d of drifts) {
    const bucket = byFile.get(d.file) ?? [];
    bucket.push(d);
    byFile.set(d.file, bucket);
  }
  for (const [file, fileDrifts] of byFile) {
    const fileState = result.files.get(file);
    if (!fileState) {
      throw new Error(`internal: missing scan state for ${file}`);
    }
    const lines = [...fileState.lines];
    for (const d of fileDrifts) {
      const lineIdx = d.line - 1;
      const match = lines[lineIdx].match(CONSTANT);
      if (!match) {
        throw new Error(`${path.relative(ROOT, file)}:${d.line}: constant line failed to re-match during write`);
      }
      const [, prefix, , , suffix] = match;
      lines[lineIdx] = `${prefix}${d.after}${suffix}`;
    }
    // Atomic write: tmp + rename.
    const text = lines.join(fileState.eol);
    const tmp = `${file}.hashgen.tmp`;
    fs.writeFileSync(tmp, text, "utf8");
    fs.renameSync(tmp, file);
  }
}

function reportRewrites(drifts: Drift[]): void {
  const files = new Set(drifts.map((d) => d.file)).size;
  console.log("");
  console.log(`⚠️  hash codegen: source was MODIFIED — review and commit the changes below`);
  console.log(`   ${drifts.length} constant(s) rewritten across ${files} file(s)`);
  console.log("");
  for (const d of drifts) {
    const rel = path.relative(ROOT, d.file);
    console.log(`   ${rel}:${d.line}`);
    console.log(`     identifier:  ${d.identifier}`);
    console.log(`     annotation:  @custom:hash ${d.kind} ${d.arg}`);
    console.log(`     before:      ${d.before}`);
    console.log(`     after:       ${d.after}`);
    console.log("");
  }
  console.log(`   ⓘ If any of these are unexpected, run \`git diff\` and verify the`);
  console.log(`     annotation args are correct before committing.`);
  console.log("");
}

function reportDrift(drifts: Drift[]): void {
  console.error(
    `❌ hash codegen drift: ${drifts.length} constants need regeneration. Run 'npm run ats:contracts:hashes:generate'.`,
  );
  for (const d of drifts) {
    const rel = path.relative(ROOT, d.file);
    console.error(`  ${rel}:${d.line}  ${d.identifier}  (@custom:hash ${d.kind} ${d.arg})`);
    console.error(`    before: ${d.before}`);
    console.error(`    after:  ${d.after}`);
  }
}

/**
 * Programmatic entry-point — exported so the stability checker and unit
 * tests can reuse the collect/validate pipeline without spawning a subprocess.
 */
export interface RunInput {
  /** Optional override of the scan root. Defaults to the package contracts dir. */
  rootDir?: string;
}

export interface RunResult {
  scan: ScanResult;
  validationErrors: string[];
  drifts: Drift[];
}

export function collect(input: RunInput = {}): RunResult {
  const rootDir = input.rootDir ?? ROOT;
  const files = globSync(SCAN_GLOB, {
    cwd: rootDir,
    ignore: EXCLUDES,
    nodir: true,
  }).map((f) => path.join(rootDir, f));

  const scan: ScanResult = {
    filesScanned: 0,
    files: new Map(),
    annotated: [],
    unannotatedHashShaped: [],
    errors: [],
  };
  for (const file of files) {
    scanFile(file, scan);
  }
  const validationErrors = validate(scan);
  const drifts = validationErrors.length === 0 ? collectDrift(scan) : [];
  return { scan, validationErrors, drifts };
}

function main(): void {
  const args = new Set(process.argv.slice(2));
  const write = args.has("--write");
  const check = args.has("--check");

  if (!write && !check) {
    console.error("Usage: applyHashGen.ts (--write | --check)");
    process.exit(2);
  }
  if (write && check) {
    console.error("Pass exactly one of --write or --check.");
    process.exit(2);
  }

  const { scan, validationErrors, drifts } = collect();

  if (validationErrors.length > 0) {
    console.error(`❌ hash codegen validation failed (${validationErrors.length} issue(s)):`);
    for (const e of validationErrors) {
      console.error(`  ${e}`);
    }
    console.error("");
    console.error("No file was modified. Fix the issues above and re-run.");
    process.exit(1);
  }

  if (drifts.length === 0) {
    console.log(`✅ hash codegen: no drift across ${scan.filesScanned} files`);
    return;
  }

  if (write) {
    applyWrites(scan, drifts);
    reportRewrites(drifts);
    return;
  }

  reportDrift(drifts);
  process.exit(1);
}

// Only run when invoked directly (tsx applyHashGen.ts ...). Importing the
// module for programmatic use (`collect`) does NOT trigger the CLI.
if (require.main === module) {
  main();
}
