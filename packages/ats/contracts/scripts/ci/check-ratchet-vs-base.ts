// SPDX-License-Identifier: Apache-2.0
// Ratchet gate: the PR's solhint baseline must not be worse than the base branch's,
// per rule. `betterer ci` (run separately) already proves the committed
// `.betterer.results` matches the actual code; this guards against a PR that
// regresses the code AND re-baselines `.betterer.results` upward to match — which
// `betterer ci` alone would accept. Comparing per-rule counts (rather than the
// per-issue hashes, which change on any code edit) keeps the gate stable across
// legitimate refactors while still failing any rule whose warning count grows.
//
// Usage: npx tsx packages/ats/contracts/scripts/ci/check-ratchet-vs-base.ts <base-ref>  (run from repo root)

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const RESULTS_PATH = "packages/ats/contracts/.betterer.results";
const baseRef = process.argv[2] || "develop";

// A serialised betterer file issue: [line, column, length, message, hash].
type SerialisedIssue = [number, number, number, string, string];
type BettererResultsModule = Record<string, { value: string }>;

/**
 * Tally solhint warnings per rule from a `.betterer.results` source.
 *
 * The file is a CommonJS module that stores each test's serialised result as a
 * template literal (`exports[name] = { value: `...` }`), so backslash escapes
 * (e.g. `it\'s`) only resolve once JS evaluates it. We evaluate the module the
 * same way betterer does, then JSON.parse each test's value.
 */
function parseResults(source: string): Map<string, number> {
  const counts = new Map<string, number>(); // ruleId -> count
  const exportsObject: BettererResultsModule = Object.create(null);
  // eslint-disable-next-line no-new-func
  new Function("exports", source)(exportsObject);
  for (const entry of Object.values(exportsObject)) {
    const byFile = JSON.parse(entry.value) as Record<string, SerialisedIssue[]>;
    for (const issues of Object.values(byFile)) {
      for (const issue of issues) {
        const message = issue[3] ?? "";
        // Issues are recorded as `"<ruleId>: <message>"` by `.betterer.ts`; the
        // ruleId is the text before the first colon (solhint ruleIds have none).
        const ruleId = message.slice(0, message.indexOf(":")) || "unknown";
        counts.set(ruleId, (counts.get(ruleId) ?? 0) + 1);
      }
    }
  }
  return counts;
}

function readBaseResults(): string | null {
  for (const ref of [`origin/${baseRef}`, baseRef]) {
    try {
      return execFileSync("git", ["show", `${ref}:${RESULTS_PATH}`], {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch {
      // try the next ref form
    }
  }
  return null;
}

const baseSource = readBaseResults();
if (baseSource === null) {
  console.log(`✅ No \`${RESULTS_PATH}\` on \`${baseRef}\` yet — establishing the baseline. Skipping comparison.`);
  process.exit(0);
}

const headSource = readFileSync(RESULTS_PATH, "utf8");
const baseCounts = parseResults(baseSource);
const headCounts = parseResults(headSource);

const regressions: Array<{ ruleId: string; baseCount: number; headCount: number }> = [];
for (const [ruleId, headCount] of headCounts) {
  const baseCount = baseCounts.get(ruleId) ?? 0;
  if (headCount > baseCount) {
    regressions.push({ ruleId, baseCount, headCount });
  }
}

const baseTotal = [...baseCounts.values()].reduce((a, b) => a + b, 0);
const headTotal = [...headCounts.values()].reduce((a, b) => a + b, 0);

if (regressions.length > 0) {
  console.error(`❌ Solhint warnings increased vs \`${baseRef}\` (${baseTotal} → ${headTotal}). Regressed rules:`);
  for (const { ruleId, baseCount, headCount } of regressions) {
    console.error(`   • ${ruleId}: ${baseCount} → ${headCount}`);
  }
  console.error(
    "\nFix the new warnings, then run `npm run ats:contracts:lint:fix` and commit the updated\n" +
      "`packages/ats/contracts/.betterer.results`. The contracts lint baseline may only stay equal or shrink.",
  );
  process.exit(1);
}

console.log(`✅ Solhint warnings not worse than \`${baseRef}\` (${baseTotal} → ${headTotal}). No rule increased.`);
