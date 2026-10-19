#!/usr/bin/env bash
# Stop hook for the /ats-style-guide skill (declared in SKILL.md frontmatter — never global).
# Deterministic quality gate: the review turn cannot end while solhint reports ERRORS on the
# exact .sol files the review just covered. It lints the files listed in the diff the subagent
# wrote in STEP A (${TMPDIR:-/tmp}/ats-style-review.diff), so it backstops EVERY mode the skill
# supports (staged, branch, commit), not just the working tree. Blocks at most once per turn:
# on stop_hook_active the gate has already fired and the findings are in context.
set -uo pipefail

INPUT=$(cat 2>/dev/null || true)
if printf '%s' "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

REPO=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

DIFF="${TMPDIR:-/tmp}/ats-style-review.diff"
# No review diff in this turn → the skill did not run a review; nothing to gate.
[ -f "$DIFF" ] || exit 0

# Files the review covered. STEP A already scopes the diff to packages/ats/contracts/contracts/
# (test/artifacts/build/cache/typechain excluded); re-filter here as a defensive guard.
CHANGED=$(
  grep '^+++ b/' "$DIFF" 2>/dev/null \
    | sed 's|^+++ b/||' \
    | sort -u \
    | grep '^packages/ats/contracts/contracts/' \
    | grep -vE '/test/|/artifacts/|/build/|/cache/|/typechain-types/' || true
)
# Consume the diff so a stale one never gates a later, unrelated turn. A fresh review rewrites it.
rm -f "$DIFF"
[ -z "$CHANGED" ] && exit 0

cd "$REPO" || exit 0
# shellcheck disable=SC2086 # paths come from the review diff, newline/space-free in this repo
OUTPUT=$(npx solhint --config packages/ats/contracts/solhint.config.js $CHANGED 2>&1)
STATUS=$?

# AUTOMATED ERROR conventions are enforced by solhint (built-ins such as interface-starts-with-i
# / gas-custom-errors, plus solhint-plugin-ats for ATS-EVM-001 / ATS-NAME-005) and all surface in
# the solhint run above — no interim greps needed here.
# solhint exits non-zero only when ERROR-severity findings exist; warnings never block,
# matching the conventions contract (WARNING rules are flagged but never gate).
if [ "$STATUS" -ne 0 ]; then
  {
    echo "ats-style-guide quality gate: ERROR findings on the reviewed .sol files."
    echo "Before finishing, include every finding below in the review report."
    echo "--- Solhint ---"
    echo "$OUTPUT"
  } >&2
  exit 2
fi

exit 0
