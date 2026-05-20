---
"@hashgraph/asset-tokenization-contracts": minor
---

Add `initializeBalanceTrackerAdjusted` function to `BalanceTrackerAdjusted` facet with centralised registration
via `InitializerStorageWrapper.setFacetToReady`. Emits `BalanceTrackerAdjustedInitialized` event.
