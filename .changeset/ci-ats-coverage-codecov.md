---
"@hashgraph/asset-tokenization-contracts": patch
---

Add a dedicated coverage report generation step (`npm run ats:contracts:test:coverage`) to the ATS test workflow (`100-flow-ats-test.yaml`), executed after the main test run. The existing Codecov upload step is gated on this step succeeding via `steps.generate_coverage.outcome == 'success'`. The `codecov.yml` configuration enforces `target: auto` with `threshold: 0%` on both `project` and `patch` statuses, which causes the Codecov PR check to fail if the PR branch coverage drops below the base branch level.
