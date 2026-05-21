---
"@hashgraph/asset-tokenization-contracts": major
---

Migrate all facet initialisation to centralised `InitializerStorageWrapper` pattern across
38 facets. Each `initializeXxx` function is gated by `onlyRole(DEFAULT_ADMIN_ROLE)` (first)
and `onlyFacetNotRegistered(_XXX_RESOLVER_KEY)` (second), calls
`InitializerStorageWrapper.setFacetToReady`, and emits `XxxInitialized()` with no parameters.
Subsequent calls revert with `FacetAlreadyRegistered`.

**Migrated from per-facet boolean guard** (replaces `onlyNotXxxInitialized` / `bool initialized`
storage field): AccessControl, Cap, CapByPartition, ControlList.

**New `initializeXxx` added** (no prior initialisation existed): AdjustBalances, Allowance,
BalanceTracker, BalanceTrackerAdjusted, BalanceTrackerAtSnapshot,
BalanceTrackerAtSnapshotByPartition, BalanceTrackerByPartition, BatchBurn, BatchController,
BatchFreeze, BatchMint, BatchTransfer, Burn, BurnByPartition, Compliance,
ComplianceByPartition, ControllerByPartition, ControllerHoldByPartition, CoreAdjusted,
CoreAtSnapshot, CorporateActions, Coupon, CouponListing,
CouponSecurityHolders, Deactivate, Dividend, DividendSecurityHolders, Documentation,
EIP712, Freeze, FreezeAtSnapshot, FreezeAtSnapshotByPartition, Hold, HoldAtSnapshot.

Four view-only abstract contracts (ComplianceByPartition, CoreAdjusted, CoreAtSnapshot,
CouponListing) gain `Modifiers` inheritance to support the initialiser guards.

Five additional view-only abstract contracts (EIP712, FreezeAtSnapshot,
FreezeAtSnapshotByPartition, Hold, HoldAtSnapshot) gain `Modifiers` inheritance to support
the initialiser guards.
