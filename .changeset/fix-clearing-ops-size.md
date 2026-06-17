---
"@hashgraph/asset-tokenization-contracts": patch
---

Restore EIP-170 headroom for `ClearingOps` and the hold facet family after PRs #1089/#1106 pushed `ClearingOps` (25.4 KiB) and `HoldByPartitionFacet` (24.8 KiB) over the 24 KiB runtime cap. `ClearingOps` is split into `ClearingOps` (creation/allowance/ABAF/event emitters) and a new `ClearingLifecycleOps` (approve/cancel/reclaim/dispatch/execution/balance-restoration), and the four hold-facet abstracts now DELEGATECALL the existing `HoldOps` orchestrator library instead of inlining `HoldStorageWrapper`. No public ABI change — every selector still resolves through the diamond — and both earlier audit fixes are preserved.
