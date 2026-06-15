#!/usr/bin/env bash
# Stop hook for the /ats-style-guide skill (declared in SKILL.md frontmatter — never global).
# Deterministic quality gate: the review turn cannot end while solhint reports ERRORS on the
# changed .sol files of packages/ats/contracts. Blocks at most once per turn: on
# stop_hook_active the gate has already fired and the findings are in context.
set -uo pipefail

INPUT=$(cat 2>/dev/null || true)
if printf '%s' "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

REPO=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

CHANGED=$(
  {
    git -C "$REPO" diff HEAD --name-only --diff-filter=d -- '*.sol'
    git -C "$REPO" diff --cached --name-only --diff-filter=d -- '*.sol'
  } 2>/dev/null | sort -u \
    | grep '^packages/ats/contracts/contracts/' \
    | grep -vE '/test/|/artifacts/|/build/|/cache/|/typechain-types/' || true
)
[ -z "$CHANGED" ] && exit 0

cd "$REPO" || exit 0
# shellcheck disable=SC2086 # paths come from git, newline/space-free in this repo
OUTPUT=$(npx solhint --config packages/ats/contracts/solhint.config.js $CHANGED 2>&1)
STATUS=$?

# solhint exits non-zero only when ERROR-severity findings exist; warnings never block,
# matching the conventions contract (WARNING rules are flagged but never gate).
if [ "$STATUS" -ne 0 ]; then
  {
    echo "ats-style-guide quality gate: solhint reports ERROR findings on the changed .sol files."
    echo "Before finishing, include every finding below in the review report (Solhint section):"
    echo "$OUTPUT"
  } >&2
  exit 2
fi

exit 0
