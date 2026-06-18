// Custom Changesets changelog formatter. Two responsibilities:
//
//  1. getDependencyReleaseLine — collapse the per-changeset
//     `- Updated dependencies [<hash>]` wall into a single resolved line per
//     release. The ATS packages share a fixed-version group, so those per-hash
//     lines are noise that duplicates the upstream package's own changelog.
//
//  2. getReleaseLine — sanitise each changeset body before it is written, so a
//     messy changeset (markdown headers, bold-as-heading, fenced blocks, blank
//     runs) still yields a clean CHANGELOG.md entry. The CI lint
//     (.changeset/lint-changesets.mjs) rejects these at PR time; this is the
//     belt-and-braces backstop at generation time. House style lives in
//     .claude/rules/40-package/versioning.md.
//
// Reuses @changesets/changelog-git (the implementation behind the default
// `@changesets/cli/changelog`) for the actual line rendering.

const git = require("@changesets/changelog-git").default;

function sanitiseSummary(summary) {
  const out = [];
  let inFence = false;
  for (let line of summary.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence; // drop the fence markers, keep any inner lines as prose
      continue;
    }
    if (!inFence) {
      if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) continue; // drop table separator rows
      if (/^\s*\|.*\|\s*$/.test(line)) {
        // turn a table row into a "-" bullet of em-dash-joined cells
        const cells = line
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean);
        line = `- ${cells.join(" — ")}`;
      } else {
        line = line.replace(/^(\s*)#{1,6}\s+/, "$1"); // demote headers to plain text
        line = line.replace(
          /^(\s*)\*\*(.+?)\*\*\s*$/,
          (_m, indent, text) => `${indent}${text.replace(/\s*:?\s*$/, "")}:`,
        ); // un-bold a standalone heading line into a plain "Label:" prefix
      }
    }
    out.push(line);
  }
  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

module.exports = {
  getReleaseLine: (changeset, type, options) =>
    git.getReleaseLine({ ...changeset, summary: sanitiseSummary(changeset.summary) }, type, options),

  getDependencyReleaseLine: async (_changesets, dependenciesUpdated) => {
    if (dependenciesUpdated.length === 0) return "";
    const lines = dependenciesUpdated.map((dependency) => `  - ${dependency.name}@${dependency.newVersion}`);
    return ["- Updated dependencies:", ...lines].join("\n");
  },
};
