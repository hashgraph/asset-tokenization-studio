---
"@hashgraph/asset-tokenization-contracts": minor
---

Add `initializeBalanceTrackerAtSnapshot` function to `BalanceTrackerAtSnapshot` facet with centralised registration
via `InitializerStorageWrapper.setFacetToReady`. Emits `BalanceTrackerAtSnapshotInitialized` event.
