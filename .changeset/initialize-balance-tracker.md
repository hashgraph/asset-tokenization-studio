---
"@hashgraph/asset-tokenization-contracts": minor
---

Add `initializeBalanceTracker` function to `BalanceTracker` facet with centralised registration
via `InitializerStorageWrapper.setFacetToReady`. Emits `BalanceTrackerInitialized` event.
