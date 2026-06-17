#!/usr/bin/env node
// Lints changeset bodies for changelog-hostile formatting before they are merged.
// House style: plain prose + "-" bullets only — see
// .claude/rules/40-package/versioning.md. Exits non-zero on any violation so the
// changeset-check CI gate can block the PR before a messy entry reaches a
// generated CHANGELOG.md. Pure Node (no dependencies); pass changeset file paths
// as arguments.

import { readFileSync } from "node:fs";

const MAX_BODY_LINES = 12; // a changeset is one changelog line-item, not a design doc

const files = process.argv.slice(2).filter(Boolean);
if (files.length === 0) {
  console.log("No changeset files to lint.");
  process.exit(0);
}

let totalViolations = 0;

for (const file of files) {
  let raw;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    continue; // file was removed in a later commit of the PR; nothing to lint
  }

  const lines = raw.split("\n");
  // Body = everything after the second front-matter delimiter.
  const delims = [];
  lines.forEach((line, i) => {
    if (line.trim() === "---") delims.push(i);
  });
  const bodyStart = delims.length >= 2 ? delims[1] + 1 : 0;
  const body = lines.slice(bodyStart);

  const violations = [];
  let inFence = false;
  body.forEach((line, idx) => {
    const lineNo = bodyStart + idx + 1; // 1-based line number within the file
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      violations.push([lineNo, "fenced code block (```) — use inline `code` or prose"]);
      return;
    }
    if (inFence) return;
    if (/^\s*#{1,6}\s/.test(line))
      violations.push([lineNo, "markdown header (#/##/###) — inverts the changelog outline; use plain prose"]);
    if (/^\s*\|.*\|/.test(line)) violations.push([lineNo, "table row (| … |) — use a '-' bullet list"]);
    if (/^\s*\*\*[^*]+\*\*:?\s*$/.test(line))
      violations.push([lineNo, "bold-as-heading (**Label**) — fold into prose, e.g. 'Label: …'"]);
  });

  const nonEmpty = body.filter((line) => line.trim() !== "");
  if (nonEmpty.length > MAX_BODY_LINES)
    violations.push([
      null,
      `body has ${nonEmpty.length} non-empty lines (max ${MAX_BODY_LINES}) — condense to a headline plus a few bullets; detail belongs in the PR/commit`,
    ]);

  if (violations.length) {
    totalViolations += violations.length;
    console.error(`\n✖ ${file}`);
    for (const [lineNo, message] of violations) console.error(`  ${lineNo ? `line ${lineNo}: ` : ""}${message}`);
  } else {
    console.log(`✓ ${file}`);
  }
}

if (totalViolations) {
  console.error(`\n❌ ${totalViolations} changeset formatting violation(s).`);
  console.error(
    "House style: plain prose + '-' bullets only — no headers, tables, fenced blocks, or bold-as-heading; keep it short.",
  );
  console.error("See .claude/rules/40-package/versioning.md.");
  process.exit(1);
}

console.log("\n✅ Changeset formatting OK.");
