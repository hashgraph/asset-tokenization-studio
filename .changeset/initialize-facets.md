---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/mass-payout-contracts": patch
---

Add `initializeXxx` functions to 11 facets with centralised registration via
`InitializerStorageWrapper.setFacetToReady`. Affected facets: Allowance,
AdjustBalances, BalanceTracker, BalanceTrackerAdjusted, BalanceTrackerAtSnapshot,
BalanceTrackerAtSnapshotByPartition, BalanceTrackerByPartition, BatchBurn,
BatchController, BatchFreeze, BatchMint. Each function is gated by
`onlyRole(DEFAULT_ADMIN_ROLE)` and `onlyFacetNotRegistered`, emits `XxxInitialized`
on successful initialisation, and reverts with `FacetAlreadyRegistered` on
subsequent calls.

Mass-payout: add a matching `initializeBalanceAdjustments` stub to `AssetMock` so the
mass-payout test contracts keep compiling after `IAdjustBalances` gained the new
external entrypoint.
