---
name: ats-style-guide
description: "Trigger: /ats-style-guide. Reviews changed .sol files against the ATS coding conventions. By default reviews staged changes; when nothing is staged it asks which branch to compare the current branch against (never assumes a base). An explicit <branch> <base> or commit hash may also be passed. Reports violations as a file:line | reason table."
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
frontmatter (`hooks/check-solhint.sh`) re-runs solhint on exactly the `.sol` files the review
covered — it reads the diff STEP A writes (`${TMPDIR:-/tmp}/ats-style-review.diff`), so it
backstops every mode (staged, branch, commit), then blocks the turn (once) if ERROR findings
exist that the report omitted. It is scoped to this skill only — it never gates unrelated
sessions and must not be added to `settings.json`. STEP B below remains the primary source of
the Solhint section; the hook is the deterministic backstop.

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

Pick the command from the user input. **Never assume a base branch** — whenever a comparison
base is needed and the user did not give one, ask for it (see "Asking for the base" below).

**Default (no user input) — staged changes.** Review what is staged:

```
REPO=$(git rev-parse --show-toplevel); git -C "$REPO" diff --cached HEAD --diff-filter=d -- '*.sol'
```

Spawn the subagent for this run with `<ON_EMPTY>` = `⚠️ NOTHING_STAGED` (see Step 2). If the
subagent returns `⚠️ NOTHING_STAGED`, nothing is staged → fall back to a branch comparison:
**ask the user for the base** (do not assume one), then build the branch command below with
`<branch>` = `HEAD` and `<base>` = their answer, and spawn again (this time `<ON_EMPTY>` =
the no-changes message).

**Branch comparison** — `<branch> <base>` given by the user, or the no-staged fallback once the
base is known (fork-point diff between the two):

```
REPO=$(git rev-parse --show-toplevel); git -C "$REPO" diff --diff-filter=d "$(git -C "$REPO" merge-base <branch> <base>)"...<branch> -- '*.sol'
```

**User provides only a branch (no base)** — ask for the base first, then use the branch command
above.

**User provides a commit hash**:

```
REPO=$(git rev-parse --show-toplevel); git -C "$REPO" diff --diff-filter=d <hash>^..<hash> -- '*.sol'
```

### Asking for the base

When a base is required (the no-staged fallback, or a branch given without a base), ask the user
**exactly** this and wait for the answer — never pick a default:

> Against which branch should I compare? (e.g. `main`, `develop`)

Use the answer verbatim as `<base>`.

---

## Step 2 — Spawn ONE subagent

Pass the **git command string** (built in Step 1).
Do not pass diff content, file paths, line counts, or rule text — the subagent determines all
of that.

Substitute two tokens into the instructions below:

- `<GIT_CMD>` — the git command string built in Step 1.
- `<ON_EMPTY>` — what the subagent returns when the filtered diff is empty: `⚠️ NOTHING_STAGED`
  for the staged default run, otherwise `✅ No .sol changes found in packages/ats/contracts/contracts/.`

**Subagent instructions** (copy verbatim into the agent prompt, with both tokens substituted):

---

**STEP A — Build the diff.** Run the following command and pipe through the awk filter, saving to `${TMPDIR:-/tmp}/ats-style-review.diff`:

```bash
{ <GIT_CMD>; } | awk '
/^\+\+\+ b\// {
  path = substr($0, 7)
  in_contracts = (path ~ /packages\/ats\/contracts\/contracts\//) &&
                 (path !~ /\/test\/|\/artifacts\/|\/build\/|\/cache\/|\/typechain-types\//)
}
in_contracts { print }
' > ${TMPDIR:-/tmp}/ats-style-review.diff
```

Then check the line count:

```bash
wc -l < ${TMPDIR:-/tmp}/ats-style-review.diff
```

- If **0 lines**: return exactly: `<ON_EMPTY>`
- If **> 8000 lines**: return exactly: `⚠️ Diff too large (N lines). Narrow the scope.`
- Otherwise: continue to STEP B.

**STEP B — Run solhint on the changed files only.** Extract the file paths from the diff and lint only those:

```bash
CHANGED=$(grep '^+++ b/' ${TMPDIR:-/tmp}/ats-style-review.diff | sed 's|^+++ b/||')
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
| File:Line | Reason |
|---|---|
<LINTING rows>
```

Then render the manual review rows:

```
### Manual review
| File:Line | Reason |
|---|---|
<manual rows>
```

If the subagent returns `⚠️ NOTHING_STAGED`, do NOT show it — it is an internal control signal:
return to Step 1 (ask for the base, then re-spawn). Any other ✅/⚠️ sentinel is relayed directly.
If both sections are empty, output:

> ✅ No convention violations found in the reviewed files.
