// SPDX-License-Identifier: Apache-2.0
import { execFileSync } from "node:child_process";

import { BettererTest } from "@betterer/betterer";

// Solhint warning ratchet for the ATS contracts package. Snapshots solhint
// *warning* counts per file and per rule into `.betterer.results` so CI can
// guarantee the count only ever stays equal or decreases (enforced by the
// `lint-ratchet` job in `103-flow-ats-lint.yaml`). Errors are excluded — they
// already hard-fail `lint:sol`.
//
// The baseline records only a count per (file, rule), never line/column or
// per-issue hashes: it changes solely when a file's warning count for a rule
// changes, not when unrelated edits shift a warned line. That keeps the
// committed file stable and merge-conflict resistant. On a conflict, do not
// hand-edit it — regenerate with `npm run ats:contracts:lint:fix`.

const CONTRACTS_GLOB = "contracts/**/*.sol";
const SOLHINT_CONFIG = "solhint.config.js";

// Auto-generated, gitignored accessor library. It must exist (prod mode) before
// solhint runs or its importers raise spurious `import-path-check` warnings, but
// it carries no warnings of its own and has no committed source, so it is kept
// out of the results entirely.
const GENERATED_EXCLUDE = /infrastructure\/utils\/EvmAccessors\.sol$/;

interface SolhintMessage {
  line: number; // 1-based
  column: number; // 1-based
  severity: "Warning" | "Error";
  message: string;
  ruleId: string;
  filePath: string;
}

function runSolhint(): SolhintMessage[] {
  let stdout = "";
  try {
    stdout = execFileSync(
      "npx",
      ["--no-install", "solhint", "--disc", "--config", SOLHINT_CONFIG, "--formatter", "json", CONTRACTS_GLOB],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    );
  } catch (error) {
    // solhint exits non-zero when error-level rules fire; its JSON still lands on stdout.
    stdout = (error as { stdout?: Buffer | string }).stdout?.toString() ?? "";
    if (!stdout) {
      throw error;
    }
  }
  const start = stdout.indexOf("[");
  return start === -1 ? [] : (JSON.parse(stdout.slice(start)) as SolhintMessage[]);
}

// Repo-relative file path -> solhint ruleId -> warning count.
type WarningCounts = Record<string, Record<string, number>>;

function countWarnings(): WarningCounts {
  const warnings = runSolhint().filter((m) => m.severity === "Warning" && !GENERATED_EXCLUDE.test(m.filePath));

  const raw: WarningCounts = {};
  for (const warning of warnings) {
    const byRule = (raw[warning.filePath] ??= {});
    byRule[warning.ruleId] = (byRule[warning.ruleId] ?? 0) + 1;
  }

  // Deterministic key order so the serialised file is stable across solhint
  // runs regardless of the order solhint reports findings in.
  const sorted: WarningCounts = {};
  for (const filePath of Object.keys(raw).sort()) {
    const byRule = raw[filePath];
    sorted[filePath] = {};
    for (const ruleId of Object.keys(byRule).sort()) {
      sorted[filePath][ruleId] = byRule[ruleId];
    }
  }
  return sorted;
}

// Ratchet constraint: the result is `worse` if any (file, rule) count grows,
// `better` if some count shrinks and none grows, otherwise `same`. The return
// values match `@betterer/constraints`' `BettererConstraintResult` string enum,
// so they are returned as literals without pulling in that package.
function ratchet(result: WarningCounts, expected: WarningCounts): "better" | "same" | "worse" {
  let decreased = false;
  for (const filePath of new Set([...Object.keys(result), ...Object.keys(expected)])) {
    const current = result[filePath] ?? {};
    const previous = expected[filePath] ?? {};
    for (const ruleId of new Set([...Object.keys(current), ...Object.keys(previous)])) {
      const currentCount = current[ruleId] ?? 0;
      const previousCount = previous[ruleId] ?? 0;
      if (currentCount > previousCount) {
        return "worse";
      }
      if (currentCount < previousCount) {
        decreased = true;
      }
    }
  }
  return decreased ? "better" : "same";
}

const test = new BettererTest({
  test: async (): Promise<WarningCounts> => countWarnings(),
  constraint: async (result: WarningCounts, expected: WarningCounts) => ratchet(result, expected),
  goal: async (result: WarningCounts) => Object.keys(result).length === 0,
});

export default {
  "ats contracts solhint": () => test,
};
