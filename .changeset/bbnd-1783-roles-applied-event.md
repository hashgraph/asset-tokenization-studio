---
"@hashgraph/asset-tokenization-contracts": major
---

Audit FIND-142: `RolesApplied` now distinguishes requested from effectively applied entries.

The event carries two new fields, `appliedRoles` and `appliedStates`, populated only with the
entries whose state effectively changed. Existing `actives` parameters on the event were
renamed to `states` for clarity. Off-chain indexers can now tell which roles actually
mutated versus which were no-ops.

Additional changes in the same scope:

- The `applyRoles` external function no longer returns `bool success_`; the function reverts
  on failure (admin check) and otherwise always completes.
- The unreachable `RolesNotApplied` error declaration was removed from `IAccessControl`.

Both modifications are ABI-breaking and require consumers to regenerate their bindings.
