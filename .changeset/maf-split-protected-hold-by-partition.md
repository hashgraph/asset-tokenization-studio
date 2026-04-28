---
"@hashgraph/asset-tokenization-contracts": major
---

Refactor `protectedCreateHoldByPartition` out of `HoldManagementFacet` into a new
`ProtectedHoldByPartitionFacet` (resolver key `_PROTECTED_HOLD_BY_PARTITION_RESOLVER_KEY`),
aggregated into `IAsset` via the new `IProtectedHoldByPartition` interface.
