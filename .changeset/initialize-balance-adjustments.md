---
"@hashgraph/asset-tokenization-contracts": minor
---

Add `initializeBalanceAdjustments` function to `AdjustBalances` facet with centralised registration
via `InitializerStorageWrapper.setFacetToReady`. Emits `BalanceAdjustmentsInitialized` event.
