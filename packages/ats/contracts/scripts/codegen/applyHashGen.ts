// SPDX-License-Identifier: Apache-2.0
//
// Walks every `.sol` source file under `contracts/` and rewrites each
// `bytes32 constant <NAME> = 0x...;` annotated with
// `/// @custom:hash <kind> <arg>` to the canonical hex returned by `HASHES`.
//
// Modes:
//   --write   rewrite drift in place (used by `npm run generate:hashes` and
//             by the hardhat compile hook in `tasks/generateHashes.ts`).
//   --check   exit non-zero on any drift (used in CI to keep generated hex
//             aligned with the annotations).
//
// Scope: `contracts/` only — explicitly skips `contracts/factory/ERC3643/`
// (mirror-generated) and any `test/` subdirectories.

import fs from "fs";
import path from "path";
import { sync as globSync } from "glob";

import { HASHES, isHashKind } from "./hashGen";

const ROOT = path.resolve(__dirname, "..", "..");
const SCAN_GLOB = "contracts/**/*.sol";
const EXCLUDES = [
  "contracts/factory/ERC3643/**",
  "contracts/hardhat-dependency-compiler/**",
  "contracts/test/**",
  "contracts/**/test/**",
];

const ANNOTATION = /\/\/\/\s*@custom:hash\s+(\S+)\s+(\S+)\s*$/;
const CONSTANT = /^(\s*bytes32\s+constant\s+\w+\s*=\s*)0x[0-9a-fA-F]{64}(\s*;.*)$/;

interface Drift {
  file: string;
  line: number;
  identifier: string;
  kind: string;
  arg: string;
  before: string;
  after: string;
}

function processFile(file: string, write: boolean): Drift[] {
  const drifts: Drift[] = [];
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const annotation = lines[i].match(ANNOTATION);
    if (!annotation) continue;

    const [, kind, arg] = annotation;

    // Find the next bytes32 constant declaration. Tolerate blank lines / extra NatSpec
    // between the annotation and the constant, but stop after 10 lines to avoid
    // accidentally matching an unrelated constant further down.
    let constantLine = -1;
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      if (CONSTANT.test(lines[j])) {
        constantLine = j;
        break;
      }
    }

    if (constantLine === -1) {
      throw new Error(`${file}:${i + 1}: @custom:hash annotation has no matching bytes32 constant within 10 lines`);
    }

    if (!isHashKind(kind)) {
      throw new Error(
        `${file}:${i + 1}: unknown @custom:hash kind '${kind}'. Valid: storage, resolverKey, role, corporateAction, scheduledTask.`,
      );
    }

    const expected = HASHES[kind](arg);
    const match = lines[constantLine].match(CONSTANT);
    if (!match) {
      throw new Error(`${file}:${constantLine + 1}: constant line failed to re-match`);
    }
    const [, prefix, suffix] = match;
    const identifier = (prefix.match(/constant\s+(\w+)/) || [])[1] || "<unknown>";
    const newLine = `${prefix}${expected}${suffix}`;

    if (newLine !== lines[constantLine]) {
      const before = lines[constantLine].trim();
      drifts.push({
        file,
        line: constantLine + 1,
        identifier,
        kind,
        arg,
        before,
        after: newLine.trim(),
      });
      lines[constantLine] = newLine;
    }
  }

  if (write && drifts.length > 0) {
    fs.writeFileSync(file, lines.join("\n"), "utf8");
  }

  return drifts;
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

  const files = globSync(SCAN_GLOB, {
    cwd: ROOT,
    ignore: EXCLUDES,
    nodir: true,
  }).map((f) => path.join(ROOT, f));

  const allDrifts: Drift[] = [];
  for (const file of files) {
    try {
      allDrifts.push(...processFile(file, write));
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }
  }

  if (allDrifts.length === 0) {
    console.log(`✅ hash codegen: no drift across ${files.length} files`);
    return;
  }

  if (write) {
    console.log(
      `✏️  hash codegen: rewrote ${allDrifts.length} constants across ${new Set(allDrifts.map((d) => d.file)).size} files`,
    );
    for (const d of allDrifts) {
      const rel = path.relative(ROOT, d.file);
      console.log(`  ${rel}:${d.line}  ${d.identifier}  (@custom:hash ${d.kind} ${d.arg})`);
    }
    return;
  }

  console.error(
    `❌ hash codegen drift: ${allDrifts.length} constants need regeneration. Run 'npm run generate:hashes'.`,
  );
  for (const d of allDrifts) {
    const rel = path.relative(ROOT, d.file);
    console.error(`  ${rel}:${d.line}  ${d.identifier}  (@custom:hash ${d.kind} ${d.arg})`);
    console.error(`    before: ${d.before}`);
    console.error(`    after:  ${d.after}`);
  }
  process.exit(1);
}

main();
