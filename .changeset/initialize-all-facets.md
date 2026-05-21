---
"@hashgraph/asset-tokenization-contracts": major
---

Migrate all facet initialisation to centralised `InitializerStorageWrapper` pattern across
55 facets. Each `initializeXxx` function is gated by `onlyRole(DEFAULT_ADMIN_ROLE)` (first)
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
EIP712, Freeze, FreezeAtSnapshot, FreezeAtSnapshotByPartition, Hold, HoldAtSnapshot,
HoldAtSnapshotByPartition, HoldByPartition, Amortization, Kpis, ScheduledBalanceAdjustment, Voting,
Lock, LockAtSnapshot, EquityUSA, BondUSA (migrated from old `onlyNotBondInitialized` guard),
BondUSARead, TransferAndLock.

**Migrated from per-facet boolean guard** (Batch 4): EquityUSA (migrated from `onlyNotEquityInitialized`),
BondUSA write-side (migrated from `onlyNotBondInitialized`).

Three facet groups (BondUSA write, BondUSA read, TransferAndLock) use the **virtual resolver-key
pattern** (`_bondInitializerKey()`, `_bondReadInitializerKey()`, `_transferAndLockInitializerKey()`)
to support multiple concrete facets sharing one abstract with different resolver keys.

Four view-only abstract contracts (ComplianceByPartition, CoreAdjusted, CoreAtSnapshot,
CouponListing) gain `Modifiers` inheritance to support the initialiser guards.

Five additional view-only abstract contracts (EIP712, FreezeAtSnapshot,
FreezeAtSnapshotByPartition, Hold, HoldAtSnapshot) and one more (HoldAtSnapshotByPartition)
gain `Modifiers` inheritance to support the initialiser guards.

One abstract contract (`Amortization`) uses an intermediate `AmortizationFacetBase`
for selector registration; `initializeAmortization` is implemented in `Amortization.sol`
and its selector registered in `AmortizationFacetBase.sol` using an indexed array pattern
(array size 15→16).
