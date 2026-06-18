// SPDX-License-Identifier: Apache-2.0
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { BettererFileTest } from "@betterer/betterer";

// Solhint warning ratchet for the ATS contracts package. Snapshots every
// solhint *warning* into `.betterer.results` so CI can guarantee the count
// only ever stays equal or decreases (enforced by the `lint-ratchet` job in
// `103-flow-ats-lint.yaml`). Errors are excluded — they already hard-fail `lint:sol`.

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

const test = new BettererFileTest(async (_filePaths, fileTestResult) => {
  const warnings = runSolhint().filter((m) => m.severity === "Warning" && !GENERATED_EXCLUDE.test(m.filePath));

  const byFile = new Map<string, SolhintMessage[]>();
  for (const warning of warnings) {
    const absolutePath = resolve(process.cwd(), warning.filePath);
    const bucket = byFile.get(absolutePath);
    if (bucket) {
      bucket.push(warning);
    } else {
      byFile.set(absolutePath, [warning]);
    }
  }

  for (const [absolutePath, fileWarnings] of byFile) {
    const file = fileTestResult.addFile(absolutePath, readFileSync(absolutePath, "utf8"));
    for (const warning of fileWarnings) {
      // 0-indexed line/column; the message embeds the ruleId so a swap of one
      // rule's warning for another's changes the issue hash and is caught.
      file.addIssue(
        Math.max(0, warning.line - 1),
        Math.max(0, warning.column - 1),
        1,
        `${warning.ruleId}: ${warning.message}`,
      );
    }
  }
});

export default {
  "ats contracts solhint": () => test,
};
