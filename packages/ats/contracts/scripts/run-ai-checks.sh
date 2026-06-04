#!/usr/bin/env bash
# ============================================================================
# run-ai-checks.sh — Unified validation for ATS contracts
#
# Usage:
#   run-ai-checks.sh [logfile]                     ← full run (default: ai-run.log)
#   run-ai-checks.sh --skip-format                  ← without prettier
#   run-ai-checks.sh --skip-lint                    ← without lint (sol + js)
#   run-ai-checks.sh --skip-compile                 ← without compilation
#   run-ai-checks.sh --skip-test                    ← without tests (also skips typecheck and lint:js)
#   run-ai-checks.sh --skip-format --skip-lint      ← compile + test only
#   run-ai-checks.sh --test-file <path>             ← a single test file
#   run-ai-checks.sh --test-grep <pattern>          ← tests by name
#   run-ai-checks.sh --test-full                    ← full test and coverage output in the log
#   run-ai-checks.sh --test-filter <text>           ← filter test and coverage output by text
#   run-ai-checks.sh --skip-compile --test-file X   ← without compiling, specific test
#   run-ai-checks.sh --skip-format --skip-lint --skip-compile --skip-test ← dry-run
#   run-ai-checks.sh --skip-coverage                ← without coverage
#   run-ai-checks.sh --skip-typecheck               ← without tsc --noEmit (typecheck of test files)
#   run-ai-checks.sh --coverage-min 70              ← minimum statements threshold (%)
#   run-ai-checks.sh --help                         ← this help text
#
# Output: LOG_FILE (default: ai-run.log) containing:
#   - Execution context
#   - Filtered output + exit code for each step
#   - Structured summary (timings, diff, failures)
#
# Test output modes (and coverage):
#   (default)                 ← failing tests only (filter_test_relevant)
#   --test-full               ← full output without filtering
#   --test-filter <text>      ← only lines containing <text>
# ============================================================================

set -u
set -o pipefail

SCRIPT_VERSION="2.3.0"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---- Default flags ---------------------------------------------------
SKIP_FORMAT=false
SKIP_LINT=false
LINT_CHANGED=false
SKIP_COMPILE=false
SKIP_TEST=false
SKIP_TYPECHECK=false
SKIP_COVERAGE=false
COVERAGE_CHANGED=false
COVERAGE_MIN=""
TEST_FILE=""
TEST_GREP=""
TEST_OUTPUT="errors"   # errors | filter | full
TEST_FILTER_TEXT=""
LOG_RETENTION_DAYS=15  # number of days logs are retained in .ai-logs/archive/

# ---- Argument parsing ------------------------------------------------
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-format) SKIP_FORMAT=true; shift ;;
    --skip-lint)    SKIP_LINT=true;    shift ;;
    --lint-changed) LINT_CHANGED=true; shift ;;
    --skip-compile) SKIP_COMPILE=true; shift ;;
    --skip-test)     SKIP_TEST=true;      shift ;;
    --skip-typecheck) SKIP_TYPECHECK=true; shift ;;
    --skip-coverage)    SKIP_COVERAGE=true;    shift ;;
    --coverage-changed) COVERAGE_CHANGED=true; shift ;;
    --coverage-min)     COVERAGE_MIN="$2";     shift 2 ;;
    --test-file)     TEST_FILE="$2";       shift 2 ;;
    --test-grep)     TEST_GREP="$2";       shift 2 ;;
    --test-full)       TEST_OUTPUT="full";   shift ;;
    --test-filter)     TEST_OUTPUT="filter"; TEST_FILTER_TEXT="$2"; shift 2 ;;
    --log-retention)   LOG_RETENTION_DAYS="${2%d}"; shift 2 ;;
    --help|-h)
      head -35 "$0" | grep -E '^#|^$' | sed 's/^# //;s/^#$//'
      exit 0
      ;;
    *) POSITIONAL+=("$1"); shift ;;
  esac
done

# ---- Log directory (.ai-logs/) ----------------------------------------
# Structure:
#   .ai-logs/archive/   ← previous runs, auto-purged according to LOG_RETENTION_DAYS
#   .ai-logs/baselines/ ← per-branch baselines (formerly .ai-baselines/)
#   .ai-logs/metrics.ndjson ← NDJSON metrics history (formerly *.log.history)
AI_LOGS_DIR=".ai-logs"
mkdir -p "${AI_LOGS_DIR}/archive" "${AI_LOGS_DIR}/baselines" 2>/dev/null || true

# First positional argument = log name (default inside .ai-logs/)
_log_arg="${POSITIONAL[0]:-}"
if [[ -n "$_log_arg" && "$_log_arg" != */* ]]; then
  LOG_FILE="${AI_LOGS_DIR}/${_log_arg}"
else
  LOG_FILE="${_log_arg:-${AI_LOGS_DIR}/ai-run.log}"
fi

# Archive the previous log before overwriting
if [[ -f "$LOG_FILE" ]]; then
    _arch_ts=$(date +%Y%m%d_%H%M%S)
    cp "$LOG_FILE" "${AI_LOGS_DIR}/archive/${_arch_ts}_$(basename "$LOG_FILE")" 2>/dev/null || true
    _json_prev="${LOG_FILE%.log}.json"
    [[ -f "$_json_prev" ]] && \
        cp "$_json_prev" "${AI_LOGS_DIR}/archive/${_arch_ts}_$(basename "$_json_prev")" 2>/dev/null || true
fi

# Purge files older than LOG_RETENTION_DAYS
if [[ "${LOG_RETENTION_DAYS:-0}" -gt 0 ]]; then
    find "${AI_LOGS_DIR}/archive" -maxdepth 1 \
        \( -name "*.log" -o -name "*.json" \) \
        -mtime +"$LOG_RETENTION_DAYS" -delete 2>/dev/null || true
fi

# ---- Temporary setup and cleanup ------------------------------------------------
TMP_DIR="$(mktemp -d)"
cleanup() { rm -rf "$TMP_DIR"; [[ -n "${_ats_wrapper:-}" ]] && rm -f "$_ats_wrapper"; }
trap cleanup EXIT

: > "$LOG_FILE"

# ---- Helper functions -----------------------------------------------------------

log() {
  echo "$*" >> "$LOG_FILE"
}

log_header() {
  local title="$1"
  log ""
  log "============================================================"
  log "  $title"
  log "  $(date -Iseconds)"
  log "============================================================"
}

# Filter for lines relevant to AI diagnosis — balance between
# capturing errors and avoiding noise saturation.
# Includes the tsc format: "file.ts(line,col): error TSxxxx: ..."
filter_relevant() {
  grep -Ei \
    'error|errors|warning|warnings|failed|failure|failures|failing|fatal|passed|passing|test suites|tests:|✓|✗|×|snapshots:|time:|jest|eslint|solhint|hardhat|compile|compilation|type error|syntaxerror|referenceerror|assertionerror|exception|revert|panic|stack|trace|at .*:[0-9]+:[0-9]+|\.ts:[0-9]+|\.ts\([0-9]+,[0-9]+\)|\.sol:[0-9]+|npm err|exit code|exitcode|code |expected|received|actual|reason|caused by|cannot find|module not found|not found|undefined|null|timeout|gas remaining|coverage|summary|found [0-9]+ error|^✖|^×|^✓' \
    | grep -Eiv \
    'npm notice|npm fund|npm audit|added [0-9]+ packages|changed [0-9]+ packages|up to date|audited [0-9]+ packages|found 0 vulnerabilities|deprecated \([0-9]+|download|progress|cache|verbose|sill|timing'
}

# Variant for the test step: collapses the describe/it hierarchy of each
# Mocha failure block into a single compact line "  N) Suite.nested.test:"
filter_test_relevant() {
  awk '
    BEGIN { in_block = 0; path = ""; prefix = "" }

    # Entry to numbered block — extracts the prefix "  N) " and the first segment
    /^[[:space:]]+[0-9]+\) / {
      in_block = 1
      match($0, /^[[:space:]]+[0-9]+\) /)
      prefix = substr($0, 1, RLENGTH)
      path   = substr($0, RLENGTH + 1)
      sub(/[[:space:]]+$/, "", path)
      next
    }

    # Inside the block: path lines (≥6 spaces, not stack/error lines)
    in_block && /^[[:space:]]{6}/ &&
    !/^[[:space:]]*(at [^[:space:]]|AssertionError|[A-Z][a-zA-Z]*Error:|VM Exception|panic|revert)/ {
      line = $0
      sub(/^[[:space:]]+/, "", line)
      sub(/[[:space:]]+$/, "", line)
      path = path "." line
      next
    }

    # End of block: emits the compact line and falls through to the base filter
    in_block {
      in_block = 0
      print prefix path
    }

    # Mocha summary ("N passing (Xs)" / "N failing") — always show
    /^[[:space:]]*[0-9]+ (passing|failing)/ { print; next }

    # Base filter — no ✓ or generic "passing/passed" so as not to show passing tests
    /[Ee]rror|[Ww]arning|[Ff]ail(ed|ure|ures|ing)?|[Ff]atal|✗|×|[Ee]xception|revert|panic|timeout|assert|expected|received|actual|reason|caused by|cannot find|not found|undefined|null|gas remaining|coverage|summary|\.ts:[0-9]+|\.sol:[0-9]+|at .*:[0-9]+:[0-9]+|exit code/ &&
    !/npm (notice|fund|audit)|added [0-9]+ packages|up to date|audited|found 0 vulnerabilities|deprecated \(|download|progress|cache|verbose|sill|timing/ {
      print
    }
  '
}

# No filter: pass everything through (--test-full mode)
filter_none() { cat; }

# Free-text filter (--test-filter <text> mode)
filter_by_text() {
  grep -i "$TEST_FILTER_TEXT" || true
}

# Formats milliseconds as "Xh Xm Xs", omitting zero-value units.
# Examples: 22000 → "22s"  |  90500 → "1m 30s"  |  3661000 → "1h 1m 1s"
format_duration() {
  local ms=$1
  local s=$(( ms / 1000 ))
  local frac=$(( ms % 1000 ))
  local h=$(( s / 3600 ))
  local m=$(( (s % 3600) / 60 ))
  local sec=$(( s % 60 ))
  local sec_str
  sec_str="${sec}.$(printf '%03d' $frac)s"
  if   [[ $h -gt 0 ]]; then echo "${h}h ${m}m ${sec_str}"
  elif [[ $m -gt 0 ]]; then echo "${m}m ${sec_str}"
  else                       echo "${sec_str}"
  fi
}

run_step() {
  # Usage: run_step [--filter <fn>] [--errors-only] <name> <cmd...>
  #
  # --errors-only: considers the step successful if there are no error lines,
  # even if the command exits with a non-zero exit code (e.g. solhint with warnings only).
  local filter_fn="filter_relevant"
  local fail_on_errors_only=false

  while [[ "${1:-}" == --* ]]; do
    case "$1" in
      --filter)       filter_fn="$2"; shift 2 ;;
      --errors-only)  fail_on_errors_only=true; shift ;;
      *)              break ;;
    esac
  done

  local name="$1"
  shift

  local step_start
  step_start=$(date +%s%N)
  local raw_file="$TMP_DIR/${name// /_}.raw.log"
  local exit_code=0

  log_header "STEP: $name"
  log "\$ $*"
  log ""

  "$@" > "$raw_file" 2>&1 || exit_code=$?

  # --errors-only: if the command failed due to warnings (not errors), treat as OK
  if $fail_on_errors_only && [[ "$exit_code" -ne 0 ]]; then
    local _err_count
    _err_count=$(grep -cE $'^\s+[0-9]+:[0-9]+\s+error' "$raw_file" 2>/dev/null || true)
    [[ "${_err_count:-0}" -eq 0 ]] && exit_code=0
  fi

  local step_end
  step_end=$(date +%s%N)
  local step_ms=$(( (step_end - step_start) / 1000000 ))
  local step_dur
  step_dur=$(format_duration "$step_ms")

  {
    echo "----- Relevant output -----"
    "$filter_fn" < "$raw_file" || true
    echo ""
    echo "----- End of step '$name' -----"
    echo "  Command: $*"
    echo "  Exit code: $exit_code"
    echo "  Duration: $step_dur"
    echo ""
  } >> "$LOG_FILE"

  echo "$name|$exit_code|$step_dur" >> "$TMP_DIR/steps.log"

  if [[ "$exit_code" -ne 0 ]]; then
    echo "❌ Failed: $name (exit $exit_code, $step_dur)"
    echo "   Log: $LOG_FILE"
    return "$exit_code"
  fi

  echo "✅ OK: $name ($step_dur)"
  return 0
}

# ---- FINAL SUMMARY --------------------------------------------------------
generate_summary() {
  log ""
  log "============================================================"
  log "  VALIDATION SUMMARY"
  log "  $(date -Iseconds)"
  log "============================================================"

  local total_sec=0
  local all_ok=true

  if [[ -f "$TMP_DIR/steps.log" ]]; then
    while IFS='|' read -r step_name step_code step_dur; do
      local code_num
      code_num=$(echo "$step_code" | xargs)
      local status
      if [[ "$code_num" -eq 0 ]]; then
        status="✅"
      else
        status="❌"
        all_ok=false
      fi
      log "  $status  $step_name  →  exit $step_code  (${step_dur})"
    done < "$TMP_DIR/steps.log"
  else
    log "  (no steps were executed — all skipped)"
  fi

  log ""

  # Git diff stats
  if git rev-parse --is-inside-work-tree &>/dev/null; then
    local branch
    branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
    local commit
    commit=$(git rev-parse --short HEAD 2>/dev/null || echo "?")
    log "  Git branch: $branch  commit: $commit"
    log ""
    log "  Uncommitted changes:"
    git diff --stat 2>/dev/null >> "$LOG_FILE" || true
    git diff --stat --cached 2>/dev/null >> "$LOG_FILE" || true
  fi

  log ""

  # Initialise cross-run comparison variables
  parent_baseline=""; pname=""
  parent_branch=$(detect_parent_branch 2>/dev/null || true)
  if [[ -n "$parent_branch" ]]; then
    pname="${parent_branch#origin/}"
    parent_baseline=$(read_baseline "$pname" 2>/dev/null || true)
  fi

  # Get current branch for history lookup
  local current_branch
  current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")

  # Coverage if available
  if [[ -f "$TMP_DIR/metrics.env" ]]; then
    # shellcheck disable=SC1090
    source "$TMP_DIR/metrics.env"
    if [[ -n "${cov_pct:-}" ]]; then
      local line_l="  📊 Lines:     ${cov_pct}%  (${lh_total:-?}/${lf_total:-?})"
      local line_b="  📊 Branches:  ${branch_pct:-0}%  (${brh_total:-?}/${brf_total:-?})"
      local line_f="  📊 Functions: ${func_pct:-0}%  (${fnh_total:-?}/${fnf_total:-?})"
      log "$line_l"; echo "$line_l"
      log "$line_b"; echo "$line_b"
      log "$line_f"; echo "$line_f"

      # Find baseline: same branch > parent branch > none
      prev_cov=""; prev_br=""; cov_source=""
      if [[ -f "$HISTORY_FILE" ]]; then
        local same_branch
        same_branch=$(grep "\"branch\":\"$current_branch\"" "$HISTORY_FILE" 2>/dev/null | tail -1)
        if [[ -n "$same_branch" ]]; then
          prev_cov=$(echo "$same_branch" | grep -oP '"cov":\K[0-9.]+')
          prev_br=$(echo "$same_branch" | grep -oP '"br":\K[0-9.]+')
          cov_source="same branch"
        fi
      fi
      if [[ -z "$prev_cov" && -n "$parent_baseline" ]]; then
        prev_cov=$(get_baseline_field "$parent_baseline" "cov")
        prev_br=$(get_baseline_field "$parent_baseline" "br")
        cov_source="origin/$pname"
      fi

      if [[ -n "$prev_cov" ]]; then
        diff=$(( cov_pct - prev_cov ))
        if [[ "$diff" -gt 0 ]]; then
          local line="  📈 Lines +${diff}pp vs $cov_source (${prev_cov}%)"
          log "$line"; echo "$line"
        elif [[ "$diff" -lt 0 ]]; then
          local line="  📉 Lines ${diff}pp vs $cov_source (${prev_cov}%)"
          log "$line"; echo "$line"
        else
          local line="  ➖ Lines unchanged vs $cov_source (${prev_cov}%)"
          log "$line"; echo "$line"
        fi
        if [[ -n "$prev_br" && -n "${branch_pct:-}" ]]; then
          bdiff=$(( branch_pct - prev_br ))
          if [[ "$bdiff" -gt 0 ]]; then
            local line="  📈 Branches +${bdiff}pp vs $cov_source (${prev_br}%)"
            log "$line"; echo "$line"
          elif [[ "$bdiff" -lt 0 ]]; then
            local line="  📉 Branches ${bdiff}pp vs $cov_source (${prev_br}%)"
            log "$line"; echo "$line"
          else
            local line="  ➖ Branches unchanged vs $cov_source (${prev_br}%)"
            log "$line"; echo "$line"
          fi
        fi
      fi
    fi
    if [[ -n "${lint_warnings:-}" ]]; then
      local line_lint="  ⚠️  Lint: ${lint_warnings} warnings, ${lint_errors} errors"
      log "$line_lint"; echo "$line_lint"
      if [[ -f "$TMP_DIR/lint_top3.txt" && -s "$TMP_DIR/lint_top3.txt" ]]; then
        local top_hdr="  Top 3 solhint violations:"
        log "$top_hdr"; echo "$top_hdr"
        while read -r count rule; do
          local top_line="    $(printf '%5d' "$count")×  $rule"
          log "$top_line"; echo "$top_line"
        done < "$TMP_DIR/lint_top3.txt"
      fi
      prev_lint_w=""; lint_source=""
      if [[ -f "$HISTORY_FILE" ]]; then
        local same_branch
        same_branch=$(grep "\"branch\":\"$current_branch\"" "$HISTORY_FILE" 2>/dev/null | tail -1)
        if [[ -n "$same_branch" ]]; then
          prev_lint_w=$(echo "$same_branch" | grep -oP '"lint_w":\K[0-9]+')
          lint_source="same branch"
        fi
      fi
      if [[ -z "$prev_lint_w" && -n "$parent_baseline" ]]; then
        prev_lint_w=$(get_baseline_field "$parent_baseline" "lint_w")
        lint_source="origin/$pname"
      fi
      if [[ -n "$prev_lint_w" ]]; then
        wdiff=$(( lint_warnings - prev_lint_w ))
        if [[ "$wdiff" -gt 0 ]]; then
          local line="  ⚠️  +${wdiff} warnings vs $lint_source (${prev_lint_w})"
          log "$line"; echo "$line"
        elif [[ "$wdiff" -lt 0 ]]; then
          local line="  ✅ ${wdiff} warnings vs $lint_source (${prev_lint_w})"
          log "$line"; echo "$line"
        else
          local line="  ➖ Warnings unchanged vs $lint_source (${prev_lint_w})"
          log "$line"; echo "$line"
        fi
      fi
    fi
    log ""
  fi

  if $all_ok; then
    local v="  VERDICT: ✅ All steps passed."
    log "$v"; echo "$v"
  else
    local v="  VERDICT: ❌ At least one step failed. Check the log."
    log "$v"; echo "$v"
  fi
  echo ""

  write_history 2>/dev/null || true
  _finalize_log 2>/dev/null || true
}

# ---- INLINE LINT SUMMARY -----------------------------------------------
# Emits a File|Line:Col|Level|Description|Rule table to the log and console.
# Arguments:
#   $1  step name (default: "lint")
#   $2  optional context/label ("stash", "changed", …)
# Respects LINT_CHANGED_FILES when defined (restricts to the indicated scope).
print_lint_summary() {
  local step_name="${1:-lint}"
  local context="${2:-}"
  local raw_file="$TMP_DIR/${step_name// /_}.raw.log"
  [[ -f "$raw_file" ]] || return 0

  local total_w total_e
  total_w=$(grep -cE $'^\s+[0-9]+:[0-9]+\s+warning' "$raw_file" 2>/dev/null || true)
  total_e=$(grep -cE $'^\s+[0-9]+:[0-9]+\s+error'   "$raw_file" 2>/dev/null || true)
  total_w=${total_w:-0}; total_e=${total_e:-0}
  [[ "$((total_w + total_e))" -eq 0 ]] && return 0

  local work_file="$raw_file"
  if [[ -n "${LINT_CHANGED_FILES:-}" ]]; then
    local filtered_file="$TMP_DIR/lint_filtered_${context:-main}.log"
    awk -v changed="$LINT_CHANGED_FILES" '
      BEGIN { split(changed, arr, "\n"); for (i in arr) keep[arr[i]] = 1 }
      !/^[[:space:]]/ && /\.(sol|ts)/ { cur = $0; in_file = (cur in keep) }
      in_file { print }
    ' "$raw_file" > "$filtered_file"
    work_file="$filtered_file"
    total_w=$(grep -cE $'^\s+[0-9]+:[0-9]+\s+warning' "$work_file" 2>/dev/null || true)
    total_e=$(grep -cE $'^\s+[0-9]+:[0-9]+\s+error'   "$work_file" 2>/dev/null || true)
    total_w=${total_w:-0}; total_e=${total_e:-0}
    if [[ "$((total_w + total_e))" -eq 0 ]]; then
      local ok_msg="  ✅ No violations${context:+" [${context}]"} in in-scope files"
      echo "$ok_msg"; echo "$ok_msg" >> "$LOG_FILE"
      return 0
    fi
  fi

  # Summary header
  local scope="${context:+"[${context}] "}(${step_name})"
  local hdr="  ⚠️  Lint ${scope}: ${total_e} errors, ${total_w} warnings"
  echo "$hdr"; echo "$hdr" >> "$LOG_FILE"

  # Calculate File column width based on the longest name
  local _col_w
  _col_w=$(awk '
    !/^[[:space:]]/ && /\.(sol|ts)/ {
      f = $0
      sub(/.*\/contracts\//, "", f)
      sub(/.*test\/contracts\/integration\//, "", f)
      if (length(f) > max) max = length(f)
    }
    END { print (max+0 > 8 ? max : 8) }
  ' "$work_file")
  _col_w=${_col_w:-40}

  # Table: File(_col_w) | Line:Col(9) | Level(7) | Description(42) | Rule
  local table_rows
  table_rows=$(awk -v cw="$_col_w" '
    !/^[[:space:]]/ && /\.(sol|ts)/ {
      f = $0
      sub(/.*\/contracts\//, "", f)
      sub(/.*test\/contracts\/integration\//, "", f)
      cur = f; next
    }
    /^[[:space:]]+[0-9]+:[0-9]+[[:space:]]+(warning|error)/ {
      lc = $1; lvl = $2; rule = $NF
      desc = ""; for (i = 3; i < NF; i++) desc = desc (i==3?"": " ") $i
      if (length(desc) > 42) desc = substr(desc, 1, 39) "..."
      sf = length(cur) > cw ? "..." substr(cur, length(cur)-(cw-4)) : cur
      lns[++n] = sprintf("  %-*s | %-9s | %-7s | %-42s | %s", cw, sf, lc, lvl, desc, rule)
      is_err[n] = (lvl == "error")
    }
    END {
      p = 0
      for (i = 1; i <= n && p < 200; i++) if (is_err[i])  { print lns[i]; p++ }
      for (i = 1; i <= n && p < 200; i++) if (!is_err[i]) { print lns[i]; p++ }
      if (n > 200) print "  ... (" (n - 200) " more)"
    }
  ' "$work_file")

  local _sep_f _d2 _d3 _d4 _d5
  printf -v _sep_f "%-${_col_w}s" ""; _sep_f="${_sep_f// /-}"
  printf -v _d2 '%09d' 0; _d2="${_d2//0/-}"
  printf -v _d3 '%07d' 0; _d3="${_d3//0/-}"
  printf -v _d4 '%042d' 0; _d4="${_d4//0/-}"
  printf -v _d5 '%018d' 0; _d5="${_d5//0/-}"
  local tbl_hdr tbl_sep
  printf -v tbl_hdr "  %-${_col_w}s | %-9s | %-7s | %-42s | %s" \
      'File' 'Line:Col' 'Level' 'Description' 'Rule'
  tbl_sep="  ${_sep_f}-+-${_d2}-+-${_d3}-+-${_d4}-+-${_d5}"

  # Table → log and console
  local tbl_out
  tbl_out=$(printf '%s\n%s\n%s\n' "$tbl_hdr" "$tbl_sep" "$table_rows" \
    | sed 's/\x1b\[[0-9;]*[mGKHF]//g')
  echo "$tbl_out" >> "$LOG_FILE"
  echo "$tbl_out"
}

# ---- MAIN EXECUTION ------------------------------------------------

log_header "EXECUTION CONTEXT (v$SCRIPT_VERSION)"
{
  echo "  Directory: $(pwd)"
  echo "  Node: $(node --version 2>/dev/null || echo 'not available')"
  echo "  npm: $(npm --version 2>/dev/null || echo 'not available')"
  echo "  Git branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'not available')"
  echo "  Git commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'not available')"
  echo ""
  echo "  Flags:"
  echo "    Skip format:  $SKIP_FORMAT"
  echo "    Skip lint:    $SKIP_LINT"
  echo "    Skip compile: $SKIP_COMPILE"
  echo "    Skip test:      $SKIP_TEST"
  echo "    Skip typecheck: $SKIP_TYPECHECK"
  echo "    Skip coverage:  $SKIP_COVERAGE"
  echo "    Coverage min:   ${COVERAGE_MIN:-"(none)"}"
  echo "    Test file:      ${TEST_FILE:-"(all)"}"
  echo "    Test grep:      ${TEST_GREP:-"(none)"}"
  echo "    Test output:    ${TEST_OUTPUT}${TEST_FILTER_TEXT:+" (\"$TEST_FILTER_TEXT\")"}"
  echo ""
} >> "$LOG_FILE"

# ---- Detection of files in stash -----------------------------------------
# If a stash exists, any .sol files it contains are automatically included in the
# lint and coverage diff, even without --lint-changed or --coverage-changed.
_stash_sol=""
if git stash list 2>/dev/null | grep -q .; then
  _repo_root=$(git rev-parse --show-toplevel 2>/dev/null || true)
  _cwd=$(pwd)
  if [[ -n "$_repo_root" ]]; then
    _stash_sol=$(
      git stash show --name-only 2>/dev/null | while IFS= read -r _sf; do
        [[ -z "$_sf" ]] && continue
        _abs="${_repo_root}/${_sf}"
        _rel="${_abs#${_cwd}/}"
        [[ "$_rel" != "$_abs" ]] && echo "$_rel"
      done | grep '\.sol$' | sort -u || true
    )
    if [[ -n "$_stash_sol" ]]; then
      _stash_count=$(echo "$_stash_sol" | wc -l | tr -d ' ')
      echo "  📦 Stash detected: ${_stash_count} .sol file(s) — included in lint and coverage diff"
    fi
  fi
fi

ALL_OK=true

# ---- ATS project detection (enables ATS_TEST_MODE) ---------------------
_ats_project=false
if [[ "$(pwd)" == *"asset-tokenization-studio"* ]] || \
   { [[ -f "package.json" ]] && grep -q '"asset-tokenization' package.json 2>/dev/null; }; then
  _ats_project=true
  export ATS_TEST_MODE=true
fi

# ---- Step 0: forced clean build --------------------------------------------
run_step "clean:build" npm run clean:build || ALL_OK=false

if ! $SKIP_FORMAT; then
  run_step "format" npm run format || ALL_OK=false
fi

# ---- lint:sol — Solidity linting -------------------------------------------
# Fails only on real errors; warnings (use-natspec, etc.) do not block.
if ! $SKIP_LINT; then
  if $LINT_CHANGED; then
    _lc_parent=""
    for _c in origin/development origin/main origin/master; do
      if git rev-parse --verify "$_c" &>/dev/null 2>&1; then _lc_parent="$_c"; break; fi
    done
    _lc_parent="${_lc_parent:-HEAD~1}"

    _lc_all=$(
      git diff --name-only --relative "${_lc_parent}..HEAD" 2>/dev/null
      git diff --name-only --relative HEAD 2>/dev/null
      git diff --name-only --relative --cached HEAD 2>/dev/null
      # Include stash files when a stash exists
      [[ -n "${_stash_sol:-}" ]] && echo "$_stash_sol"
    )
    _lc_count=$(echo "$_lc_all" | grep -cE '\.sol$' 2>/dev/null || echo 0)

    if [[ "$_lc_count" -eq 0 ]]; then
      echo "  ℹ️  --lint-changed: no .sol changes vs ${_lc_parent}"
    else
      LINT_CHANGED_FILES=$(echo "$_lc_all" | grep -E '\.sol$' | sort -u)
      export LINT_CHANGED_FILES
      echo "  🔍 --lint-changed: ${_lc_count} .sol files vs ${_lc_parent}${_stash_sol:+" (includes stash)"}"
      run_step --errors-only "lint:sol" npm run lint:sol || ALL_OK=false
      print_lint_summary "lint:sol"
    fi
  else
    run_step --errors-only "lint:sol" npm run lint:sol || ALL_OK=false
    print_lint_summary "lint:sol"
    # Auto-stash: show warning diff for stash files even without --lint-changed
    if [[ -n "${_stash_sol:-}" ]]; then
      LINT_CHANGED_FILES="$_stash_sol" print_lint_summary "lint:sol" "stash"
    fi
  fi
fi

if ! $SKIP_COMPILE; then
  run_step "compile" npm run compile --force || ALL_OK=false
fi

# ---- Contract sizes ---------------------------------------------------
# Scans artifacts/contracts/ after compilation.
# Log: top 10 by deployed size.  Terminal: top 2.
# If any non-test contract exceeds 24 KiB (24576 bytes), the script halts.
ARTIFACTS_DIR="./artifacts/contracts"
if [[ -d "$ARTIFACTS_DIR" ]]; then
  _size_script="$TMP_DIR/contract_sizes.js"
  cat > "$_size_script" << 'NODEEOF'
'use strict';
const fs   = require('fs');
const path = require('path');
const base = process.env.ARTIFACTS_DIR;
const LIMIT = 24576;

function walk(dir) {
  const res = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) { res.push(...walk(full)); continue; }
    if (f.endsWith('.json') && !f.endsWith('.dbg.json')) res.push(full);
  }
  return res;
}

const contracts = [];
for (const f of walk(base)) {
  let a;
  try { a = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; }
  if (!a.deployedBytecode || a.deployedBytecode === '0x') continue;
  const size = (a.deployedBytecode.length - 2) / 2;
  if (size === 0) continue;
  contracts.push({ name: a.contractName, size, isTest: f.includes('/test/') });
}
contracts.sort((a, b) => b.size - a.size);

const KIB = n => (n / 1024).toFixed(2) + ' KiB';

// Top 10 → stdout (consumed by shell for log)
console.log('TOP10');
contracts.slice(0, 10).forEach(c =>
  console.log(`  ${String(c.size).padStart(6)}  ${c.isTest ? '[test]  ' : '        '}  ${c.name}  (${KIB(c.size)})`)
);

// Top 2 → labelled for terminal summary
console.log('TOP2');
contracts.slice(0, 2).forEach(c =>
  console.log(`  ${c.name}: ${KIB(c.size)}${c.isTest ? ' [test]' : ''}`)
);

// Violations → any non-test contract over limit
const violations = contracts.filter(c => !c.isTest && c.size > LIMIT);
if (violations.length > 0) {
  console.log('VIOLATIONS');
  violations.forEach(c =>
    console.log(`  ${c.name}: ${c.size} bytes (${KIB(c.size)}) — exceeds 24 KiB EIP-170 limit`)
  );
}
process.exit(violations.length > 0 ? 1 : 0);
NODEEOF

  _size_out=$(ARTIFACTS_DIR="$ARTIFACTS_DIR" node "$_size_script" 2>&1)
  _size_exit=$?

  # Parse sections from output
  _top10=$(echo "$_size_out" | awk '/^TOP10/{f=1;next}/^TOP2|^VIOLATIONS/{f=0} f{print}')
  _top2=$(echo "$_size_out"  | awk '/^TOP2/{f=1;next}/^VIOLATIONS/{f=0} f{print}')
  _viols=$(echo "$_size_out" | awk '/^VIOLATIONS/{f=1;next} f{print}')

  log ""
  log "----- Contract Sizes (top 10 by deployed bytecode) -----"
  log "$_top10"
  log ""

  # Terminal: top 2
  echo "  📦 Contract sizes (top 2):"
  echo "$_top2"

  if [[ "$_size_exit" -ne 0 && -n "$_viols" ]]; then
    echo ""
    echo "❌ Non-test contracts above the EIP-170 limit (24 KiB):"
    echo "$_viols"
    log ""
    log "❌ EIP-170 VIOLATION — deployed bytecode over 24 KiB:"
    log "$_viols"
    ALL_OK=false
    generate_summary
    echo "⚠️  There were failures. Check: $LOG_FILE"
    exit 1
  fi
fi

if ! $SKIP_TEST && ! $SKIP_TYPECHECK; then
  # tsc --noEmit type-checks all files in tsconfig include (scripts + test/**/*).
  # Runs BEFORE hardhat test so TS syntax/type errors fail fast with clean diagnostics:
  #   test/foo.test.ts(42,13): error TS1005: ',' expected.
  # --pretty false → no ANSI colours in the log file.
  run_step "typecheck" npx tsc --noEmit --pretty false || ALL_OK=false
fi

# ---- lint:js — TypeScript/ESLint linting -----------------------------------
# Runs after typecheck. If it fails, the script halts immediately.
if ! $SKIP_LINT && ! $SKIP_TEST; then
  if ! run_step "lint:js" npm run lint:js; then
    ALL_OK=false
    generate_summary
    echo "⚠️  There were failures. Check: $LOG_FILE"
    exit 1
  fi
fi

if ! $SKIP_TEST; then
  # Build test command according to flags
  _ats_wrapper=""
  if [[ -n "$TEST_FILE" ]]; then
    # If the file exports a function without self-invocation, generate a temporary wrapper
    _func=$(grep -oP '^export function \K\w+Tests' "$TEST_FILE" 2>/dev/null | head -1)
    if [[ -n "$_func" ]]; then
      _rel=$(realpath --relative-to=test/contracts/integration "$TEST_FILE" 2>/dev/null || python3 -c "import os; print(os.path.relpath('$TEST_FILE', 'test/contracts/integration'))")
      _ats_wrapper="test/contracts/integration/_ats_runner.test.ts"
      printf 'import { %s } from "./%s";\n%s();\n' "$_func" "${_rel%.ts}" "$_func" > "$_ats_wrapper"
      TEST_CMD=(npx hardhat test --no-compile "$_ats_wrapper")
    else
      TEST_CMD=(npx hardhat test --no-compile "$TEST_FILE")
    fi
  else
    # shellcheck disable=SC2207
    TEST_FILES=()
    while IFS= read -r -d '' f; do
      TEST_FILES+=("$f")
    done < <(find test/contracts/integration test/scripts -name '*.test.ts' -type f -print0 2>/dev/null)
    if [[ ${#TEST_FILES[@]} -eq 0 ]]; then
      echo "⚠️  No test files found in test/contracts/integration or test/scripts"
      TEST_CMD=(npx hardhat test --no-compile)
    else
      TEST_CMD=(npx hardhat test --no-compile "${TEST_FILES[@]}")
    fi
  fi

  if [[ -n "$TEST_GREP" ]]; then
    TEST_CMD+=(--grep "$TEST_GREP")
  fi

  # Select output filter based on mode
  case "$TEST_OUTPUT" in
    full)   _test_filter="filter_none" ;;
    filter) _test_filter="filter_by_text" ;;
    *)      _test_filter="filter_test_relevant" ;;
  esac

  run_step --filter "$_test_filter" "test" "${TEST_CMD[@]}" || ALL_OK=false
fi

# ---- Coverage (post-test) ---------------------------------------------------
if ! $SKIP_COVERAGE && $ALL_OK; then
  # Select output filter based on mode (same logic as tests).
  # In errors mode: if we reach coverage, tests passed — same filter as tests.
  case "$TEST_OUTPUT" in
    full)   _cov_filter="filter_none" ;;
    filter) _cov_filter="filter_by_text" ;;
    *)      _cov_filter="filter_test_relevant" ;;
  esac

  # Build the coverage command respecting --test-file and --test-grep.
  # --testfiles filters files; TEST_GREP is passed via env var (read by hardhat.config.ts).
  COVERAGE_CMD=(npx hardhat coverage)
  if [[ -n "$_ats_wrapper" ]]; then
    COVERAGE_CMD+=(--testfiles "$_ats_wrapper")
  elif [[ -n "$TEST_FILE" ]]; then
    COVERAGE_CMD+=(--testfiles "$TEST_FILE")
  fi
  export TEST_GREP
  run_step --filter "$_cov_filter" "coverage" "${COVERAGE_CMD[@]}" || ALL_OK=false

  # Parse coverage from lcov.info (lines + branches + functions)
  LCOV_FILE="./coverage/lcov.info"
  if [[ -f "$LCOV_FILE" ]]; then
    lf_total=0; lh_total=0; brf_total=0; brh_total=0; fnf_total=0; fnh_total=0
    lf_val=""; lh_val=""; brf_val=""; brh_val=""; fnf_val=""; fnh_val=""
    while IFS= read -r line; do
      case "$line" in
        LF:*) lf_val="${line#LF:}"; lf_total=$((lf_total + lf_val)) ;;
        LH:*) lh_val="${line#LH:}"; lh_total=$((lh_total + lh_val)) ;;
        BRF:*) brf_val="${line#BRF:}"; brf_total=$((brf_total + brf_val)) ;;
        BRH:*) brh_val="${line#BRH:}"; brh_total=$((brh_total + brh_val)) ;;
        FNF:*) fnf_val="${line#FNF:}"; fnf_total=$((fnf_total + fnf_val)) ;;
        FNH:*) fnh_val="${line#FNH:}"; fnh_total=$((fnh_total + fnh_val)) ;;
      esac
    done < <(grep -E '^(LF|LH|BRF|BRH|FNF|FNH):' "$LCOV_FILE")

    cov_pct=0; branch_pct=0; func_pct=0
    if [[ "$lf_total" -gt 0 ]]; then
      cov_pct=$((lh_total * 100 / lf_total))
    fi
    if [[ "$brf_total" -gt 0 ]]; then
      branch_pct=$((brh_total * 100 / brf_total))
    fi
    if [[ "$fnf_total" -gt 0 ]]; then
      func_pct=$((fnh_total * 100 / fnf_total))
    fi

    log ""
    log "----- Coverage Summary -----"
    log "  Lines:     $lh_total / $lf_total  (${cov_pct}%)"
    log "  Branches:  $brh_total / $brf_total  (${branch_pct}%)"
    log "  Functions: $fnh_total / $fnf_total  (${func_pct}%)"

    if [[ -n "$COVERAGE_MIN" ]]; then
      if [[ "$cov_pct" -lt "$COVERAGE_MIN" ]]; then
        log "  ❌ Lines ${cov_pct}% below threshold ${COVERAGE_MIN}%"
        echo "❌ Lines ${cov_pct}% < ${COVERAGE_MIN}% (threshold)"
        ALL_OK=false
      else
        log "  ✅ Lines ${cov_pct}% meets threshold ${COVERAGE_MIN}%"
      fi
    fi
    echo "  📊 Lines: ${cov_pct}%  Branches: ${branch_pct}%  Functions: ${func_pct}%"
    echo "cov_pct=$cov_pct" > "$TMP_DIR/metrics.env"
    echo "lh_total=$lh_total" >> "$TMP_DIR/metrics.env"
    echo "lf_total=$lf_total" >> "$TMP_DIR/metrics.env"
    echo "branch_pct=$branch_pct" >> "$TMP_DIR/metrics.env"
    echo "brh_total=$brh_total" >> "$TMP_DIR/metrics.env"
    echo "brf_total=$brf_total" >> "$TMP_DIR/metrics.env"
    echo "func_pct=$func_pct" >> "$TMP_DIR/metrics.env"
    echo "fnh_total=$fnh_total" >> "$TMP_DIR/metrics.env"
    echo "fnf_total=$fnf_total" >> "$TMP_DIR/metrics.env"
  else
    log "  ⚠️  lcov.info not found at $LCOV_FILE — cannot parse coverage"
  fi

  # Per-file breakdown: top 10 worst + pending changes
  COVERAGE_JSON="./coverage.json"
  COVERAGE_REPORT_BIN="${SCRIPT_DIR}/coverage-report.js"
  if [[ -f "$COVERAGE_JSON" && -f "$COVERAGE_REPORT_BIN" ]]; then
    echo ""
    echo "📋 Coverage breakdown (top 10 worst + pending changes):"
    report_out=$(node "$COVERAGE_REPORT_BIN" "$COVERAGE_JSON" 2>&1)
    echo "$report_out"
    echo ""
    log ""
    log "----- Coverage Breakdown -----"
    echo "$report_out" | sed 's/\x1b\[[0-9;]*[mGKHF]//g' >> "$LOG_FILE"
    log ""
  fi

  # --coverage-changed: threshold check restricted to files modified in this branch
  if $COVERAGE_CHANGED && [[ -f "$COVERAGE_JSON" ]]; then
    _ccv_threshold="${COVERAGE_MIN:-80}"
    _ccv_parent=""
    for _c in origin/development origin/main origin/master; do
      if git rev-parse --verify "$_c" &>/dev/null 2>&1; then _ccv_parent="$_c"; break; fi
    done
    _ccv_parent="${_ccv_parent:-HEAD~1}"

    _ccv_all=$(
      git diff --name-only --relative "${_ccv_parent}..HEAD" 2>/dev/null
      git diff --name-only --relative HEAD 2>/dev/null
      git diff --name-only --relative --cached HEAD 2>/dev/null
      # Include stash files when a stash exists
      [[ -n "${_stash_sol:-}" ]] && echo "$_stash_sol"
    )
    _ccv_changed=$(echo "$_ccv_all" | grep '\.sol$' | sort -u)

    if [[ -z "$_ccv_changed" ]]; then
      echo "  ℹ️  --coverage-changed: no .sol changes vs ${_ccv_parent}"
    else
      echo "  🔍 --coverage-changed: threshold ${_ccv_threshold}% on modified files vs ${_ccv_parent}${_stash_sol:+" (includes stash)"}"
      _ccv_script="$TMP_DIR/coverage_changed.js"
      cat > "$_ccv_script" << 'NODEEOF'
'use strict';
const fs   = require('fs');
const path = require('path');
const cov  = JSON.parse(fs.readFileSync(process.env.COV_FILE, 'utf8'));
const changed   = process.env.CC_FILES.split('\n').filter(Boolean);
const threshold = parseInt(process.env.CC_THRESHOLD, 10);
const cwd = process.cwd();
let failed = false, checked = 0;
const results = [];
for (const [, data] of Object.entries(cov)) {
  const fullPath = data.path ? path.resolve(data.path) : null;
  if (!fullPath) continue;
  const rel = path.relative(cwd, fullPath).replace(/\\/g, '/');
  if (!changed.some(f => rel === f || rel.endsWith('/' + f) || f.endsWith('/' + rel))) continue;
  const lines = Object.keys(data.l || {}).length;
  if (lines === 0) { console.log('  SKIP  ' + rel + '  (no trackable lines)'); continue; }
  const covered = Object.values(data.l || {}).filter(v => v > 0).length;
  const pct = Math.round(covered * 100 / lines);
  const ok  = pct >= threshold;
  results.push({ ok, pct, rel });
  if (!ok) failed = true;
  checked++;
}
if (checked === 0) console.log('  ⚠️  No modified files found in coverage.json');
const failures = results.filter(r => !r.ok);
const oks = results.filter(r => r.ok);
failures.forEach(r => console.log('  ❌  ' + String(r.pct).padStart(3) + '%  ' + r.rel));
oks.slice(0, 5).forEach(r => console.log('  ✅  ' + String(r.pct).padStart(3) + '%  ' + r.rel));
if (oks.length > 5) console.log('    ... (' + (oks.length - 5) + ' more OK)');
process.exit(failed ? 1 : 0);
NODEEOF
      _ccv_out=$(COV_FILE="$COVERAGE_JSON" CC_FILES="$_ccv_changed" CC_THRESHOLD="$_ccv_threshold" \
        node "$_ccv_script" 2>&1)
      _ccv_exit=$?
      echo "$_ccv_out"
      log "----- Coverage Changed -----"
      echo "$_ccv_out" >> "$LOG_FILE"
      log ""
      if [[ "$_ccv_exit" -ne 0 ]]; then
        echo "❌ --coverage-changed: one or more modified files below the ${_ccv_threshold}% threshold"
        ALL_OK=false
      fi
    fi
  fi

  # Auto-stash: coverage for stash files when --coverage-changed was not used
  if [[ -n "${_stash_sol:-}" ]] && ! $COVERAGE_CHANGED && [[ -f "$COVERAGE_JSON" ]]; then
    _astash_threshold="${COVERAGE_MIN:-80}"
    echo "  📦 Coverage (stash, threshold ${_astash_threshold}%):"
    _astash_script="$TMP_DIR/coverage_changed.js"
    # Reuse the Node.js script if already written, or write it now
    if [[ ! -f "$_astash_script" ]]; then
      cat > "$_astash_script" << 'NODEEOF'
'use strict';
const fs   = require('fs');
const path = require('path');
const cov  = JSON.parse(fs.readFileSync(process.env.COV_FILE, 'utf8'));
const changed   = process.env.CC_FILES.split('\n').filter(Boolean);
const threshold = parseInt(process.env.CC_THRESHOLD, 10);
const cwd = process.cwd();
let failed = false, checked = 0;
const results = [];
for (const [, data] of Object.entries(cov)) {
  const fullPath = data.path ? path.resolve(data.path) : null;
  if (!fullPath) continue;
  const rel = path.relative(cwd, fullPath).replace(/\\/g, '/');
  if (!changed.some(f => rel === f || rel.endsWith('/' + f) || f.endsWith('/' + rel))) continue;
  const lines = Object.keys(data.l || {}).length;
  if (lines === 0) { console.log('  SKIP  ' + rel + '  (no trackable lines)'); continue; }
  const covered = Object.values(data.l || {}).filter(v => v > 0).length;
  const pct = Math.round(covered * 100 / lines);
  const ok  = pct >= threshold;
  results.push({ ok, pct, rel });
  if (!ok) failed = true;
  checked++;
}
if (checked === 0) console.log('  ⚠️  No stash files found in coverage.json');
const failures = results.filter(r => !r.ok);
const oks = results.filter(r => r.ok);
failures.forEach(r => console.log('  ❌  ' + String(r.pct).padStart(3) + '%  ' + r.rel));
oks.slice(0, 5).forEach(r => console.log('  ✅  ' + String(r.pct).padStart(3) + '%  ' + r.rel));
if (oks.length > 5) console.log('    ... (' + (oks.length - 5) + ' more OK)');
process.exit(failed ? 1 : 0);
NODEEOF
    fi
    _astash_out=$(COV_FILE="$COVERAGE_JSON" CC_FILES="$_stash_sol" CC_THRESHOLD="$_astash_threshold" \
        node "$_astash_script" 2>&1)
    echo "$_astash_out"
    log "----- Coverage Stash -----"
    echo "$_astash_out" >> "$LOG_FILE"
    log ""
  fi
fi

# ---- Parse lint metrics ------------------------------------------------
# Combines lint:sol and lint:js for the summary and history.
lint_warnings=0; lint_errors=0
for _lint_step in "lint:sol" "lint:js"; do
  _lint_raw="$TMP_DIR/${_lint_step// /_}.raw.log"
  [[ -f "$_lint_raw" ]] || continue
  _lint_summary=$(grep -Eo '[0-9]+ problems? \([0-9]+ errors?, [0-9]+ warnings?' "$_lint_raw" | tail -1)
  if [[ -n "$_lint_summary" ]]; then
    _e=$(echo "$_lint_summary" | grep -Eo '[0-9]+' | sed -n '2p')
    _w=$(echo "$_lint_summary" | grep -Eo '[0-9]+' | sed -n '3p')
    lint_errors=$(( lint_errors + ${_e:-0} ))
    lint_warnings=$(( lint_warnings + ${_w:-0} ))
  fi
done

if [[ "$((lint_warnings + lint_errors))" -gt 0 ]]; then
  # Write to metrics.env (may not exist if coverage was skipped)
  {
    echo "lint_warnings=$lint_warnings"
    echo "lint_errors=$lint_errors"
  } >> "$TMP_DIR/metrics.env"

  # Top 3 combined rules from both steps
  {
    [[ -f "$TMP_DIR/lint:sol.raw.log" ]] && cat "$TMP_DIR/lint:sol.raw.log"
    [[ -f "$TMP_DIR/lint:js.raw.log"  ]] && cat "$TMP_DIR/lint:js.raw.log"
  } | grep -E $'^\s+[0-9]+:[0-9]+\s+(warning|error)' \
    | awk '{print $NF}' \
    | sort | uniq -c | sort -rn | head -3 \
    > "$TMP_DIR/lint_top3.txt" 2>/dev/null || true
fi

# ---- Per-branch baselines + NDJSON history --------------------------------
HISTORY_FILE="${AI_LOGS_DIR}/metrics.ndjson"
BASELINE_DIR="${AI_LOGS_DIR}/baselines"
# baselines dir already created at startup; metrics.ndjson is created on first write

detect_parent_branch() {
  for candidate in origin/development origin/main origin/master; do
    if git rev-parse --verify "$candidate" &>/dev/null 2>&1; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

read_baseline() {
  local branch_name="$1"
  local bfile="$BASELINE_DIR/${branch_name//\//_}.json"
  if [[ -f "$bfile" ]]; then
    cat "$bfile"
  fi
}

write_baseline() {
  local branch_name="$2" val="$1"
  local bfile="$BASELINE_DIR/${branch_name//\//_}.json"
  echo "$val" > "$bfile"
}

get_baseline_field() {
  local json="$1" field="$2"
  echo "$json" | grep -oP "\"$field\":\K[0-9.]+" | head -1
}

write_history() {
  if [[ -f "$TMP_DIR/metrics.env" ]]; then
    # shellcheck disable=SC1090
    source "$TMP_DIR/metrics.env"
  fi
  local branch commit
  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
  commit=$(git rev-parse --short HEAD 2>/dev/null || echo "?")
  local format_dur="" lint_dur="" compile_dur="" test_dur="" coverage_dur="" clean_dur=""
  while IFS='|' read -r sn sc sd; do
    case "$sn" in
      clean:build) clean_dur="$sd" ;;
      format)      format_dur="$sd" ;;
      lint:sol)    lint_dur="$sd" ;;
      compile)     compile_dur="$sd" ;;
      test)        test_dur="$sd" ;;
      coverage)    coverage_dur="$sd" ;;
    esac
  done < "$TMP_DIR/steps.log" 2>/dev/null || true

  local entry
  entry=$(cat <<-ENTRY
{"ts":"$(date -Iseconds)","branch":"$branch","commit":"$commit","cov":${cov_pct:-null},"br":${branch_pct:-null},"fn":${func_pct:-null},"lh":${lh_total:-null},"lf":${lf_total:-null},"brh":${brh_total:-null},"brf":${brf_total:-null},"fnh":${fnh_total:-null},"fnf":${fnf_total:-null},"lint_w":${lint_warnings:-null},"lint_e":${lint_errors:-null},"dur_format":"$format_dur","dur_lint":"$lint_dur","dur_compile":"$compile_dur","dur_test":"$test_dur","dur_coverage":"$coverage_dur"}
ENTRY
)

  echo "$entry" >> "$HISTORY_FILE"
  write_baseline "$entry" "$branch"
}

# ---- FAST-READ + JSON SIDECAR ------------------------------------------------
# _finalize_log: called at the end of generate_summary.
#   1. Prepends a compact FAST-READ block to the log (AI can read just that).
#   2. If there are test failures, also prepends a consolidated FAILURES section.
#   3. Writes a structured JSON sidecar (${LOG_FILE%.log}.json).
_finalize_log() {
  # Count tests from the raw log
  local _tp=0 _tf=0
  local _test_raw="$TMP_DIR/test.raw.log"
  if [[ -f "$_test_raw" ]]; then
    _tp=$(grep -oE '^[[:space:]]*[0-9]+ passing' "$_test_raw" 2>/dev/null \
          | grep -oE '[0-9]+' | tail -1 || true); _tp=${_tp:-0}
    _tf=$(grep -oE '^[[:space:]]*[0-9]+ failing'  "$_test_raw" 2>/dev/null \
          | grep -oE '[0-9]+' | tail -1 || true); _tf=${_tf:-0}
  fi

  # Read metrics
  local _cl="" _cb="" _cf="" _le=0 _lw=0
  if [[ -f "$TMP_DIR/metrics.env" ]]; then
    _cl=$(grep '^cov_pct='        "$TMP_DIR/metrics.env" | cut -d= -f2 || true)
    _cb=$(grep '^branch_pct='    "$TMP_DIR/metrics.env" | cut -d= -f2 || true)
    _cf=$(grep '^func_pct='      "$TMP_DIR/metrics.env" | cut -d= -f2 || true)
    _le=$(grep '^lint_errors='   "$TMP_DIR/metrics.env" | cut -d= -f2 || echo 0)
    _lw=$(grep '^lint_warnings=' "$TMP_DIR/metrics.env" | cut -d= -f2 || echo 0)
  fi

  # ── FAST-READ block ──────────────────────────────────────────────────────────
  local _ok_str; $ALL_OK && _ok_str="✅ PASS" || _ok_str="❌ FAIL"
  local _fr=""
  _fr+="============================================================"$'\n'
  _fr+="  FAST-READ (v${SCRIPT_VERSION})  —  ${LOG_FILE%.log}.json para acceso estructurado"$'\n'
  _fr+="  $(date -Iseconds)"$'\n'
  _fr+="============================================================"$'\n'
  _fr+="  STATUS: ${_ok_str}"$'\n'$'\n'
  _fr+="  Steps:"$'\n'
  if [[ -f "$TMP_DIR/steps.log" ]]; then
    while IFS='|' read -r _sn _sc _sd; do
      local _ico; [[ "$_sc" -eq 0 ]] && _ico="✅" || _ico="❌"
      _fr+="    ${_ico}  $(printf '%-14s' "$_sn")  ${_sd}"$'\n'
    done < "$TMP_DIR/steps.log"
  fi
  [[ $(( _tp + _tf )) -gt 0 ]] && _fr+=$'\n'"  Tests:    ${_tp} passing  ${_tf} failing"$'\n'
  [[ -n "$_cl" ]] && _fr+="  Coverage: lines ${_cl}%  branches ${_cb:-?}%  functions ${_cf:-?}%"$'\n'
  [[ "${_lw:-0}" != "0" ]] && _fr+="  Lint:     ${_le:-0} errors  ${_lw} warnings"$'\n'
  _fr+="============================================================"$'\n'

  # ── FAILURES block (only when there are test failures) ───────────────────────────
  local _fb=""
  if [[ -f "$_test_raw" && "${_tf:-0}" -gt 0 ]]; then
    local _fc
    _fc=$(filter_test_relevant < "$_test_raw" 2>/dev/null || true)
    _fb+="============================================================"$'\n'
    _fb+="  TEST FAILURES (${_tf})"$'\n'
    _fb+="============================================================"$'\n'
    _fb+="${_fc}"$'\n'
    _fb+="============================================================"$'\n'
  fi

  # ── Prepend to log ────────────────────────────────────────────────────────
  {
    printf '%s' "$_fr"
    [[ -n "$_fb" ]] && printf '%s' "$_fb"
    printf '\n'
    cat "$LOG_FILE"
  } > "$TMP_DIR/final_log.tmp" && mv "$TMP_DIR/final_log.tmp" "$LOG_FILE"

  # ── Sidecar JSON ──────────────────────────────────────────────────────────
  _write_json_sidecar "$_tp" "$_tf" "${_cl:-null}" "${_cb:-null}" "${_cf:-null}" "${_le:-0}" "${_lw:-0}"
}

_write_json_sidecar() {
  local _tp="$1" _tf="$2" _cl="$3" _cb="$4" _cf="$5" _le="$6" _lw="$7"
  local _json="${LOG_FILE%.log}.json"
  local _ts _branch _commit _status
  _ts=$(date -Iseconds)
  _branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
  _commit=$(git rev-parse --short HEAD 2>/dev/null || echo "?")
  $ALL_OK && _status="PASS" || _status="FAIL"

  # Steps object
  local _steps_json="{" _sfirst=true
  if [[ -f "$TMP_DIR/steps.log" ]]; then
    while IFS='|' read -r _sn _sc _sd; do
      local _ok; [[ "$_sc" -eq 0 ]] && _ok="true" || _ok="false"
      $_sfirst || _steps_json+=","
      _steps_json+="\"${_sn}\":{\"ok\":${_ok},\"exit\":${_sc},\"dur\":\"${_sd}\"}"
      _sfirst=false
    done < "$TMP_DIR/steps.log"
  fi
  _steps_json+="}"

  # Failures array (collapsed names of failing tests)
  local _failures_json="[]"
  if [[ -f "$TMP_DIR/test.raw.log" && "${_tf:-0}" -gt 0 ]]; then
    _failures_json=$(awk '
      BEGIN { in_block=0; path=""; n=0 }
      /^[[:space:]]+[0-9]+\) / {
        in_block=1
        match($0,/^[[:space:]]+[0-9]+\) /)
        path=substr($0,RLENGTH+1); sub(/[[:space:]]+$/,"",path); next
      }
      in_block && /^[[:space:]]{6}/ &&
      !/^[[:space:]]*(at [^[:space:]]|AssertionError|[A-Z][a-zA-Z]*Error:|VM Exception|panic|revert)/ {
        line=$0; sub(/^[[:space:]]+/,"",line); sub(/[[:space:]]+$/,"",line)
        path=path "." line; next
      }
      in_block { in_block=0; n++; gsub(/"/, "\\\"", path); arr[n]=path; path="" }
      END {
        printf "["; for (i=1;i<=n;i++) printf "%s\"%s\"", (i>1?",":""), arr[i]; printf "]"
      }
    ' "$TMP_DIR/test.raw.log")
  fi

  cat > "$_json" << JSONEOF
{
  "version": "${SCRIPT_VERSION}",
  "timestamp": "${_ts}",
  "branch": "${_branch}",
  "commit": "${_commit}",
  "status": "${_status}",
  "steps": ${_steps_json},
  "tests": { "passing": ${_tp}, "failing": ${_tf} },
  "coverage": { "lines": ${_cl}, "branches": ${_cb}, "functions": ${_cf} },
  "lint": { "errors": ${_le}, "warnings": ${_lw} },
  "failures": ${_failures_json}
}
JSONEOF
  echo "  📄 JSON: ${_json}"
}

generate_summary

if $ALL_OK; then
  echo "🎉 All checks passed. Log: $LOG_FILE"
else
  echo "⚠️  There were failures. Check: $LOG_FILE"
fi
