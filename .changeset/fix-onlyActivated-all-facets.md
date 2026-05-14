---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: add `onlyActivated` guard to all external state-changing functions across all facets.

All external, non-view, non-pure functions in every facet were missing the `onlyActivated` modifier, meaning that after a token was deactivated through `DeactivateFacet.deactivate()` it was still possible to invoke any state-mutating operation — minting, transferring, freezing, role management, document updates, coupon/dividend/clearing operations, etc. A deactivated token must be fully immutable.

The fix adds `onlyActivated` as the **first** modifier on every such function across all facets, ensuring any state-mutating call on a deactivated token reverts with the `Deactivated` custom error. Initialize functions are deliberately excluded, as those must remain callable during the token's setup phase regardless of activation state.

`DeactivateFacet` was also added to the loan token configuration, which previously lacked the ability to deactivate loan tokens.

Each facet's integration test file now includes a `describe("Deactivated")` block that verifies the guard is active after a `deactivate()` call.
