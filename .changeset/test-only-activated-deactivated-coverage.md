---
"@hashgraph/asset-tokenization-contracts": patch
---

Add `Deactivated` test coverage for every function guarded by `onlyActivated`: each external state-mutating function across all facets now has a `describe("Deactivated")` case asserting it reverts with `Deactivated` after `deactivate()`, closing a gap where prior tests only covered the first function per facet (85 new cases across 47 files). Also removes `onlyActivated` from `view` and `initialize` functions where it was incorrectly placed, and adds it to two override functions in `ProceedRecipientsKpiLinkedRateFacet` that hadn't inherited it.
