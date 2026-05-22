---
"@hashgraph/asset-tokenization-contracts": minor
---

Wire `initializeXxx` calls for all remaining facets in `Factory._deploySecurity()`.

Previously, only ~14 facets had their initialiser called by the factory. The other 73 facets
migrated to the centralised `onlyFacetNotRegistered` + `setFacetToReady` pattern
(see `initialize-all-facets` changeset) were never called, so `setOperationalStatus()`
could never reach the operational threshold.

Each new facet is wired as an optional `_tryInitialize_*` private helper (try/catch) so the
factory works safely across Equity, Bond, and any future config that may omit a given facet.
Covered facets: AccessControl, Allowance, AdjustBalances, BalanceTracker,
BalanceTrackerAdjusted, BalanceTrackerAtSnapshot, BalanceTrackerAtSnapshotByPartition,
BalanceTrackerByPartition, BatchBurn, BatchController, BatchFreeze, BatchMint, BatchTransfer,
BondUSARead, Burn, BurnByPartition, CapByPartition, Compliance, ComplianceByPartition,
ControllerByPartition, ControllerHoldByPartition, CoreAdjusted, CoreAtSnapshot,
CorporateActions, Coupon, CouponListing, CouponSecurityHolders, Deactivate, Dividend,
DividendSecurityHolders, Documentation, EIP712, Freeze, FreezeAtSnapshot,
FreezeAtSnapshotByPartition, Hold, HoldAtSnapshot, HoldAtSnapshotByPartition, HoldByPartition,
Lock, LockAtSnapshot, LockAtSnapshotByPartition, LockByPartition, Maturity,
MaturityByPartition, Metadata, MintByPartition, Nonces, NominalValueAtSnapshot, Operator,
OperatorByPartition, OperatorClearingByPartition, OperatorClearingHoldByPartition,
OperatorHoldByPartition, Partitions, Pause, Principal, ProtectedByPartition,
ProtectedClearingByPartition, ProtectedClearingHoldByPartition, ProtectedHoldByPartition,
Recovery, ScheduledBalanceAdjustment, SecurityHolders, SecurityHoldersAtSnapshot,
SnapshotsByPartition, SsiManagement, Transfer, TransferAndLock, TransferAndLockByPartition,
TransferByPartition, Voting, VotingSecurityHolders.
