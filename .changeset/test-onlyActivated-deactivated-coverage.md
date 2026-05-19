---
"@hashgraph/asset-tokenization-contracts": patch
---

Tests: add `Deactivated` coverage for all functions guarded by `onlyActivated`.

Every external, state-mutating function across all facets now has a corresponding test in a `describe("Deactivated")` block that verifies the call reverts with `Deactivated` after `DeactivateFacet.deactivate()` is invoked.

Previous test files only covered the first function of each facet. The remaining functions — including paired operations such as `add`/`remove`, `grant`/`revoke`, `freeze`/`unfreeze`, and `activate`/`deactivate` — had no deactivation test. This gap is now closed across all 47 affected integration test files (85 new test cases in total).

Additionally, `onlyActivated` was removed from `view` functions and from `initialize` functions where it had been incorrectly placed, and the modifier was added to two override functions in `ProceedRecipientsKpiLinkedRateFacet` that had not inherited it from the base contract.
