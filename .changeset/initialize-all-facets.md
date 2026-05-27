---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/mass-payout-contracts": patch
---

# Centralised facet initialisation + operational-status gate

## Centralised initialiser pattern (all facets)

All facets now use the shared `InitializerStorageWrapper` pattern:
`onlyRole(DEFAULT_ADMIN_ROLE)` + `onlyFacetNotRegistered(_XXX_RESOLVER_KEY)` →
`InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY)` → emit `XxxInitialized()`.
Subsequent calls revert with `FacetAlreadyRegistered`.

**Migrated from per-facet boolean guard** (replaces `onlyNotXxxInitialized` / `bool initialized`
storage field): AccessControl, BondUSA (fixed, KPI-linked, variable), Cap, CapByPartition,
ControlList, EquityUSA, Security (removed `SecurityModifiers.sol`).

**New `initializeXxx` added** (no prior initialisation existed): AdjustBalances, Allowance,
Amortization, BalanceTracker, BalanceTrackerAdjusted, BalanceTrackerAtSnapshot,
BalanceTrackerAtSnapshotByPartition, BalanceTrackerByPartition, BatchBurn, BatchController,
BatchFreeze, BatchMint, BatchTransfer, BondUSARead (fixed, KPI-linked, variable), Burn,
BurnByPartition, Clearing, Compliance, ComplianceByPartition, ControllerByPartition,
ControllerHoldByPartition, CoreAdjusted, CoreAtSnapshot, CorporateActions, Coupon,
CouponListing, CouponSecurityHolders, Deactivate, Dividend, DividendSecurityHolders,
Documentation, EIP712, Freeze, FreezeAtSnapshot, FreezeAtSnapshotByPartition, Hold,
HoldAtSnapshot, HoldAtSnapshotByPartition, HoldByPartition, Kpis, Lock, LockAtSnapshot,
LockAtSnapshotByPartition, LockByPartition, Maturity, MaturityByPartition, Metadata,
MintByPartition, Nonces, NominalValueAtSnapshot, Operator, OperatorByPartition,
OperatorClearingByPartition, OperatorClearingHoldByPartition, OperatorHoldByPartition,
Partitions, Pause, Principal, ProtectedByPartition, ProtectedClearingByPartition,
ProtectedClearingHoldByPartition, ProtectedHoldByPartition, Recovery,
ScheduledBalanceAdjustment, SecurityHolders, SecurityHoldersAtSnapshot, SnapshotsByPartition,
SsiManagement, Transfer, TransferAndLock (standard, fixed-rate, KPI-linked),
TransferAndLockByPartition, TransferByPartition, Voting, VotingSecurityHolders.

Three facet groups (BondUSA write, BondUSA read, TransferAndLock) use a **virtual resolver-key
pattern** (`_bondInitializerKey()`, `_bondReadInitializerKey()`, `_transferAndLockInitializerKey()`)
to support multiple concrete facets sharing one abstract base with different resolver keys.

`Modifiers` inheritance added to abstract contracts that previously lacked it:
ComplianceByPartition, CoreAdjusted, CoreAtSnapshot, CouponListing, EIP712, FreezeAtSnapshot,
FreezeAtSnapshotByPartition, Hold, HoldAtSnapshot, HoldAtSnapshotByPartition, LockAtSnapshot,
LockAtSnapshotByPartition, Nonces, NominalValueAtSnapshot, Partitions, Principal,
SecurityHolders, SecurityHoldersAtSnapshot, SnapshotsByPartition, BondUSAReadFacetBase,
VotingSecurityHolders.

`Amortization` uses an intermediate `AmortizationFacetBase` for selector registration;
`initializeAmortization` is implemented in `Amortization.sol` and its selector registered in
`AmortizationFacetBase.sol` (array size 15→16).

Mass-payout: added `initializeBalanceAdjustments` stub to `AssetMock` so test contracts keep
compiling after `IAdjustBalances` gained the new external entrypoint.

## Factory wiring

`Factory._deploySecurity()` now calls every `initializeXxx` for all facets before marking
the proxy operational. Each initialiser is invoked through an optional `_tryInitialize_*`
private helper (try/catch) so the factory works safely across Equity, Bond, and any future
configuration that may omit a given facet. `InitializerFacet.initializeInitializer` is called
with a pre-computed `_SECURITY_FACETS_MAX` constant to set the per-call batch size for
`setOperationalStatus`, which is then driven to completion inside `_deploySecurity`.

## `onlyOperational` gate

All state-changing facet functions are now gated by `onlyOperational`, which reverts with
`AssetNotOperational` until `setOperationalStatus()` has traversed every facet and emitted
`OperationalStatusSet`. `setOperationalStatus` walks facets in configurable batches
(controlled by `maxInitializerFacetIndex`) and emits `OperationalStatusPartialSet` on each
intermediate call until the configuration is fully verified.

## Bug fix — `setOperationalStatus` batch-progress tracking

`InitializerStorageWrapper._checkFacetsReady` now receives the batch-end cursor as an
explicit parameter (`_requestedLastFacetIndex`) instead of re-initialising it from
`_facetsLength`. The previous extraction incorrectly initialised the return variable to the
total facet count, causing `allReady_` to always be `true` when all facets in the current
window passed — skipping `OperationalStatusPartialSet` and marking the proxy operational
after the very first batch regardless of remaining facets.

## Breaking changes

- All state-changing facet functions revert with `AssetNotOperational` until the proxy is
  fully initialised via `setOperationalStatus`.
- `SecurityModifiers.sol` and `onlyNotSecurityInitialized` are removed.
- `IClearingActions` interface is removed; `initializeClearing(bool)` now lives on `IClearing`
  / `ClearingFacet`. Configurations referencing `ClearingActionsFacet` must register
  `ClearingFacet` instead. `_CLEARING_ACTIONS_RESOLVER_KEY` is removed.
