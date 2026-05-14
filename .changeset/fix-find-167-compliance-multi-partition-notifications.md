---
"@hashgraph/asset-tokenization-contracts": patch
---

Compliance module never received `transferred` / `created` / `destroyed` notifications for operations on non-default partitions, letting investors accumulate tokens cross-partition without triggering per-holder or per-transfer compliance checks.

`ERC1410StorageWrapper`, `HoldStorageWrapper` and `ClearingLifecycleOps` all gated the ERC-3643 compliance hook behind `partition == _DEFAULT_PARTITION`. Issuances, transfers, redemptions, hold executions and clearing approvals on any other partition were silently invisible to the external compliance contract, so on-chain compliance limits (max holders, max balance per holder, transfer caps) could be bypassed by simply operating on a non-default partition.

The fix removes the partition gate from every notification site so the compliance module is notified for every partition:

- `ERC1410StorageWrapper.transferByPartition` / `issueByPartition` / `redeemByPartition` fire `transferred` / `created` / `destroyed` regardless of partition; the only remaining short-circuit on transfer is the self-transfer guard (`from != to`).
- `HoldStorageWrapper._notifyTransferComplianceIfNeeded` fires on every hold transfer, keeping just the self-transfer guard (`tokenHolder == _to`).
- `ClearingLifecycleOps.clearingTransferExecution` / `clearingRedeemExecution` notify on every clearing approval regardless of partition; the zero-address compliance target short-circuits inside `LowLevelCall.functionCall`, so no explicit address check is needed. This site was originally fixed in `ClearingOps` but the partition gate was reintroduced when the library was split into `ClearingOps` + `ClearingLifecycleOps` to stay below the EIP-170 24 KiB cap; this changeset re-applies the fix in its new location.

Adds integration coverage in `compliance.test.ts` (`Compliance notifications (multi partition)`) for issue / transfer / redeem / hold execution / clearing transfer / clearing redeem on a non-default partition, asserting the corresponding `complianceMock` hit counter increments.
