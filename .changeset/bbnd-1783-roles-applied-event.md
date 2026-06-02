---
"@hashgraph/asset-tokenization-contracts": major
---

Audit FIND-142: `applyRoles` now emits two separate events to distinguish requested from effectively applied role changes (BBND-1783).

- `RolesApplied(bytes32[] roles, bool[] actives, address account)` retains its original signature and fires for every batch call, reflecting all requested operations.
- New `EffectivelyRolesApplied(bytes32[] roles, bool[] actives)` is emitted only for entries that resulted in an effective storage mutation. Off-chain indexers can subscribe to this event to track actual state changes without filtering no-ops.
- `applyRoles` no longer returns `bool success_`; the function reverts on failure and otherwise always completes.
- The unreachable `RolesNotApplied` error declaration was removed from `IAccessControl`.

All four modifications are ABI-breaking and require consumers to regenerate their bindings.
