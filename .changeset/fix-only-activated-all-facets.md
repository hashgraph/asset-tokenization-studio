---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: add the `onlyActivated` guard to every external state-changing function across all facets. They were missing it, so after a token was deactivated via `DeactivateFacet.deactivate()` any state-mutating operation (mint, transfer, freeze, role management, document/coupon/dividend/clearing ops) could still be invoked. The modifier is now the first on every such function, so any state-mutating call on a deactivated token reverts with `Deactivated`; initialisers are deliberately excluded. Also adds `DeactivateFacet` to the loan token configuration, and a `describe("Deactivated")` block per facet test.
