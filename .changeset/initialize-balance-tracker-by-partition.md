---
"@hashgraph/asset-tokenization-contracts": minor
---

Add `initializeBalanceTrackerByPartition` function to `BalanceTrackerByPartition` facet with centralised registration
via `InitializerStorageWrapper.setFacetToReady`. Emits `BalanceTrackerByPartitionInitialized` event.
