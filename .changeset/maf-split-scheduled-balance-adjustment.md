---
"@hashgraph/asset-tokenization-contracts": major
---

Extract scheduled balance adjustment selectors from `AdjustBalances` into a new `ScheduledBalanceAdjustment` facet, leaving `AdjustBalances` with only the immediate `adjustBalances` and `triggerAndSyncAll` paths.
