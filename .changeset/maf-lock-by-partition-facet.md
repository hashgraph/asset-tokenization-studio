---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract the partition-aware lock surface (`lockByPartition`, `releaseByPartition`, `getLockedAmountForByPartition`, `getLockCountForByPartition`, `getLocksIdForByPartition`, `getLockForByPartition`) from `LockFacet` into a dedicated `LockByPartitionFacet`. Lock domain events and errors move to a shared `ILockTypes` inherited by both facets.

Non-breaking: the 4-byte selectors of all moved methods are unchanged, so calls through `IAsset` continue to work without modification.
