---
"@hashgraph/asset-tokenization-contracts": major
---

Audit FIND-142: `RolesApplied` now distinguishes requested from effectively applied entries, carrying two new fields `appliedRoles` and `appliedStates` populated only with the entries whose state actually changed, and its `actives` parameter is renamed to `states`; off-chain indexers can now tell real mutations from no-ops. In the same scope, `applyRoles` no longer returns `bool success_` (it reverts on failure and otherwise always completes) and the unreachable `RolesNotApplied` error is removed from `IAccessControl`.

Breaking: these are ABI changes and require consumers to regenerate their bindings.
