---
"@hashgraph/asset-tokenization-contracts": major
---

Migrate all facet initialisation to centralised `InitializerStorageWrapper` pattern across
84 facets. Each `initializeXxx` function is gated by `onlyRole(DEFAULT_ADMIN_ROLE)` (first)
and `onlyFacetNotRegistered(_XXX_RESOLVER_KEY)` (second), calls
`InitializerStorageWrapper.setFacetToReady`, and emits `XxxInitialized()` with no parameters.
Subsequent calls revert with `FacetAlreadyRegistered`.

**Migrated from per-facet boolean guard** (replaces `onlyNotXxxInitialized` / `bool initialized`
storage field): AccessControl, BondUSA (all three rate variants — fixed, KPI-linked, variable;
migrated from `onlyNotBondInitialized`), Cap, CapByPartition, ControlList, EquityUSA (migrated
from `onlyNotEquityInitialized`).

**New `initializeXxx` added** (no prior initialisation existed): AdjustBalances, Allowance,
Amortization, BalanceTracker, BalanceTrackerAdjusted, BalanceTrackerAtSnapshot,
BalanceTrackerAtSnapshotByPartition, BalanceTrackerByPartition, BatchBurn, BatchController,
BatchFreeze, BatchMint, BatchTransfer, BondUSARead (three read variants — fixed, KPI-linked,
variable), Burn, BurnByPartition, Compliance, ComplianceByPartition, ControllerByPartition,
ControllerHoldByPartition, CoreAdjusted, CoreAtSnapshot, CorporateActions, Coupon, CouponListing,
CouponSecurityHolders, Deactivate, Dividend, DividendSecurityHolders, Documentation, EIP712,
Freeze, FreezeAtSnapshot, FreezeAtSnapshotByPartition, Hold, HoldAtSnapshot,
HoldAtSnapshotByPartition, HoldByPartition, Kpis, Lock, LockAtSnapshot,
LockAtSnapshotByPartition, LockByPartition, Maturity, MaturityByPartition, Metadata,
MintByPartition, Nonces, NominalValueAtSnapshot, Operator, OperatorByPartition,
OperatorClearingByPartition, OperatorClearingHoldByPartition, OperatorHoldByPartition,
Partitions, Pause, Principal, ProtectedByPartition, ProtectedClearingByPartition,
ProtectedClearingHoldByPartition, ProtectedHoldByPartition, Recovery, ScheduledBalanceAdjustment,
SecurityHolders, SecurityHoldersAtSnapshot, SnapshotsByPartition, SsiManagement, Transfer,
TransferAndLock (three variants — standard, fixed-rate, KPI-linked), TransferAndLockByPartition,
TransferByPartition, Voting, VotingSecurityHolders.

Three facet groups (BondUSA write, BondUSA read, TransferAndLock) use the **virtual resolver-key
pattern** (`_bondInitializerKey()`, `_bondReadInitializerKey()`, `_transferAndLockInitializerKey()`)
to support multiple concrete facets sharing one abstract with different resolver keys.

**`Modifiers` inheritance added** to abstract contracts that lacked it:

- ComplianceByPartition, CoreAdjusted, CoreAtSnapshot, CouponListing
- EIP712, FreezeAtSnapshot, FreezeAtSnapshotByPartition, Hold, HoldAtSnapshot, HoldAtSnapshotByPartition
- LockAtSnapshot, BondUSAReadFacetBase
- LockAtSnapshotByPartition, Nonces, NominalValueAtSnapshot, Partitions, Principal, SecurityHolders, SecurityHoldersAtSnapshot, SnapshotsByPartition, VotingSecurityHolders

One abstract contract (`Amortization`) uses an intermediate `AmortizationFacetBase`
for selector registration; `initializeAmortization` is implemented in `Amortization.sol`
and its selector registered in `AmortizationFacetBase.sol` using an indexed array pattern
(array size 15→16).
