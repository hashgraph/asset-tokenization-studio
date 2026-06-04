---
description: Run ATS contract validation (format, lint, compile, test, coverage)
argument-hint: [--skip-format] [--skip-lint] [--skip-compile] [--skip-test] [--skip-coverage] [--test-file <path>] [--test-grep <pattern>] [--test-full] [--coverage-min <n>]
---

Run the unified ATS contracts validation script from the contracts package root.

Execute the following command, forwarding all arguments:

```bash
cd packages/ats/contracts && bash scripts/run-ai-checks.sh $ARGUMENTS
```

After the script completes, follow this reading protocol:

**Step 1 — Read the JSON summary** (`packages/ats/contracts/.ai-logs/ai-run.json`):
Parse and report:
- Overall status (`ok` / `failed`) and total duration
- Per-step result: name, exit code, duration
- Test counts: passing / failing
- Coverage: lines %, branches %, functions %
- Lint: errors count, warnings count

**Step 2 — Read the log only when there are failures**
(`packages/ats/contracts/.ai-logs/ai-run.log`):
For each failed step, extract the relevant error block from the log
(error messages, file:line references, stack traces). Do not read the
full log if all steps passed — the JSON summary is sufficient.

If neither file exists, report the raw script output instead.

## Common invocations

| Command | Effect |
|---|---|
| `/validate` | Full run: format + lint + compile + test + coverage |
| `/validate --skip-test` | Format + lint + compile only |
| `/validate --skip-format --skip-lint` | Compile + test + coverage |
| `/validate --test-grep "Cap"` | Only tests matching "Cap" |
| `/validate --test-file test/unit/cap.test.ts` | Single test file |
| `/validate --skip-compile --test-grep "Cap"` | Tests without recompiling |
