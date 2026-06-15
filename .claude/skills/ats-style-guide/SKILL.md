---
name: ats-style-guide
description: "Trigger: /ats-style-guide. Review .sol files for ATS coding convention violations. Checks staged/unstaged changes; if none, asks for a commit hash or branch. Reports violations as a fichero:línea | motivo table."
hooks:
  Stop:
    - hooks:
        - type: command
          command: ${CLAUDE_PROJECT_DIR}/.claude/skills/ats-style-guide/hooks/check-solhint.sh
---

# ATS Style Guide Review

The rules themselves live in `packages/ats/contracts/conventions/*.md` — the single source of
truth, shared with write-time tooling (`packages/ats/contracts/CLAUDE.md`). This skill only
defines the review procedure.

**Quality gate (Stop hook).** While this skill is active, the Stop hook declared in the
frontmatter (`hooks/check-solhint.sh`) re-runs solhint on the changed working-tree `.sol`
files and blocks the turn (once) if ERROR findings exist that the report omitted. It is
scoped to this skill only — it never gates unrelated sessions and must not be added to
`settings.json`. STEP B below remains the primary source of the Solhint section; the hook is
the deterministic backstop.

## Orchestrator contract — HARD BOUNDARIES

The orchestrator does **exactly three things**:

1. **Determine the git command string** from user input — text parsing only, no tools.
2. **Spawn one subagent**, passing that command string. The subagent loads the rules from the
   conventions directory itself.
3. **Render the table** the subagent returns.

The orchestrator **MUST NOT**:

- Call `Bash` for any git or file command
- Call `Read` on any diff, `.sol`, or conventions file
- Inspect, summarise, or relay diff content

All file I/O lives in the subagent. If the orchestrator never calls `Bash` or `Read`,
it is structurally impossible for diff content to enter its context.

---

## Step 1 — Build the git command string (no tools)

Choose the right command based on user input:

**Default** (staged + unstaged, no user input):

```
REPO=$(git rev-parse --show-toplevel); { git -C "$REPO" diff HEAD --diff-filter=d -- '*.sol'; git -C "$REPO" diff --cached HEAD --diff-filter=d -- '*.sol'; }
```

**User provides `<branch> <base>`** (fork-point diff):

```
REPO=$(git rev-parse --show-toplevel); git -C "$REPO" diff --diff-filter=d $(git -C "$REPO" merge-base <branch> <base>)...<branch> -- '*.sol'
```

**User provides only a branch** — ask before building the command:

> What is the base branch for `<branch>`? (e.g. `main`, `develop`, `feat/other-branch`)

**User provides a commit hash**:

```
REPO=$(git rev-parse --show-toplevel); git -C "$REPO" diff --diff-filter=d <hash>^..<hash> -- '*.sol'
```

---

## Step 2 — Spawn ONE subagent

Pass the **git command string** (built in Step 1).
Do not pass diff content, file paths, line counts, or rule text — the subagent determines all
of that.

**Subagent instructions** (copy verbatim into the agent prompt, substituting `<GIT_CMD>`):

---

**STEP A — Build the diff.** Run the following command and pipe through the awk filter, saving to `/tmp/ats-style-review.diff`:

```bash
{ <GIT_CMD>; } | awk '
/^\+\+\+ b\// {
  path = substr($0, 7)
  in_contracts = (path ~ /packages\/ats\/contracts\/contracts\//) &&
                 (path !~ /\/test\/|\/artifacts\/|\/build\/|\/cache\/|\/typechain-types\//)
}
in_contracts { print }
' > /tmp/ats-style-review.diff
```

Then check the line count:

```bash
wc -l < /tmp/ats-style-review.diff
```

- If **0 lines**: return exactly: `✅ No .sol changes found in packages/ats/contracts/contracts/.`
- If **> 8000 lines**: return exactly: `⚠️ Diff too large (N lines). Narrow the scope.`
- Otherwise: continue to STEP B.

**STEP B — Run solhint on the changed files only.** Extract the file paths from the diff and lint only those:

```bash
CHANGED=$(grep '^+++ b/' /tmp/ats-style-review.diff | sed 's|^+++ b/||')
cd $(git rev-parse --show-toplevel) && npx solhint --config packages/ats/contracts/solhint.config.js $CHANGED 2>&1
```

- If there are solhint violations, collect them as a `LINTING` section to prepend in the output, format:
  `contracts/path/File.sol:LINE | SOLHINT — <rule>: <message>`
- If solhint is clean, continue silently.

**STEP C — Load the rules.** Read EVERY markdown file in the conventions directory:

```bash
ls $(git rev-parse --show-toplevel)/packages/ats/contracts/conventions/*.md
```

Read each listed file in full (start with `README.md` — it documents the rule format and the
rule index). Every rule is identified as `ATS-XXX-NNN` with a `Severity` (ERROR | WARNING) and
an `Enforcement` mode (AUTOMATED — deterministically checkable from the source text, caught by
solhint in STEP B; MANUAL — requires understanding the code, reviewed here). Apply ALL rules
from ALL files.

**STEP D — Read the diff** and proceed with manual review.

Review the diff for violations **only on added lines** — lines starting with `+`
(never `+++` file header lines).

Use `@@` hunk headers to track the actual line number on the new-file side
(the second number in `+M,N`). Count forward from that base for each `+` or
context line; report the line number of the offending `+` line.

**Scope guard.** Report ONLY violations of the rules loaded in STEP C; every row MUST cite an
`ATS-XXX-NNN` ID that exists in the conventions files. Style preferences, refactor ideas, or
improvements outside those rules MUST NOT be reported — not even as suggestions or side notes.
Default-deny applies **within** the rule set, never beyond it: when a line matches a rule's
pattern and you are unsure whether its justification holds, flag it; when no rule covers a
concern, stay silent.

Apply every rule loaded in STEP C. Report ALL violations found. Mark WARNING-severity rules as
`WARNING —` in the explanation; they are flagged but never block.
Return ONLY the raw table rows (no headers, no summary, no extra text), one row
per violation, in the format:

`contracts/path/File.sol:LINE | Rule ID — explanation of the violation`

Use paths relative to `packages/ats/contracts/` (starting with `contracts/`).

---

## Step 3 — Render output

If the subagent returned a `LINTING` section, render it first:

```
### Solhint
| Fichero:Línea | Motivo |
|---|---|
<LINTING rows>
```

Then render the manual review rows:

```
### Manual review
| Fichero:Línea | Motivo |
|---|---|
<manual rows>
```

If the subagent returns the ✅ or ⚠️ sentinel, relay it directly.
If both sections are empty, output:

> ✅ No se encontraron violaciones en los ficheros revisados.
