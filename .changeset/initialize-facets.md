---
"@hashgraph/asset-tokenization-contracts": major
---

Add `initializeXxx` functions to 11 facets with centralised registration via
`InitializerStorageWrapper.setFacetToReady`. Affected facets: Allowance,
AdjustBalances, BalanceTracker, BalanceTrackerAdjusted, BalanceTrackerAtSnapshot,
BalanceTrackerAtSnapshotByPartition, BalanceTrackerByPartition, BatchBurn,
BatchController, BatchFreeze, BatchMint. Each function is gated by
`onlyRole(DEFAULT_ADMIN_ROLE)` and `onlyFacetNotRegistered`, emits `XxxInitialized`
on successful initialisation, and reverts with `FacetAlreadyRegistered` on
subsequent calls.
