---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-167: notify the compliance module for operations on every partition, not just the default one. `ERC1410StorageWrapper`, `HoldStorageWrapper` and `ClearingLifecycleOps` gated the ERC-3643 `transferred`/`created`/`destroyed` hooks behind `partition == _DEFAULT_PARTITION`, so issuances, transfers, redemptions, hold executions and clearing approvals on any other partition were invisible to the external compliance contract — letting on-chain limits (max holders, max balance, transfer caps) be bypassed by operating on a non-default partition. The fix removes the partition gate from every notification site, keeping only the self-transfer short-circuits, and adds multi-partition compliance coverage. (The clearing site was first fixed in `ClearingOps` but regressed when the library was split for the EIP-170 cap; it is re-applied in `ClearingLifecycleOps`.)
