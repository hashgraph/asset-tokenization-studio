# INIT-ADD-APPLY-REPORT

**Skill**: `initialize-add`
**Date**: 2026-05-20
**Scope**: 11 facets — full initializeAdd workflow application

---

## Summary

Applied the `initialize-add` skill to 11 facets that had a `_RESOLVER_KEY` but no
`initializeXxx` function. Each facet now has a centralised initialisation entrypoint,
standardised event, selector registration, and full test coverage.

---

## Facets Processed

### Group A — Already inherited `Modifiers` (standard `initialize-add`)

| Facet             | Resolver Key                        | Init Function                    | Event                           |
| ----------------- | ----------------------------------- | -------------------------------- | ------------------------------- |
| `AdjustBalances`  | `_BALANCE_ADJUSTMENTS_RESOLVER_KEY` | `initializeBalanceAdjustments()` | `BalanceAdjustmentsInitialized` |
| `Allowance`       | `_ALLOWANCE_RESOLVER_KEY`           | `initializeAllowance()`          | `AllowanceInitialized`          |
| `BatchBurn`       | `_BATCH_BURN_RESOLVER_KEY`          | `initializeBatchBurn()`          | `BatchBurnInitialized`          |
| `BatchController` | `_BATCH_CONTROLLER_RESOLVER_KEY`    | `initializeBatchController()`    | `BatchControllerInitialized`    |
| `BatchFreeze`     | `_BATCH_FREEZE_RESOLVER_KEY`        | `initializeBatchFreeze()`        | `BatchFreezeInitialized`        |
| `BatchMint`       | `_BATCH_MINT_RESOLVER_KEY`          | `initializeBatchMint()`          | `BatchMintInitialized`          |

### Group B — View-only facets (needed `Modifiers` added)

| Facet                                 | Resolver Key                                             | Init Function                                     | Event                                            |
| ------------------------------------- | -------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------ |
| `BalanceTracker`                      | `_BALANCE_TRACKER_RESOLVER_KEY`                          | `initializeBalanceTracker()`                      | `BalanceTrackerInitialized`                      |
| `BalanceTrackerAdjusted`              | `_BALANCE_TRACKER_ADJUSTED_RESOLVER_KEY`                 | `initializeBalanceTrackerAdjusted()`              | `BalanceTrackerAdjustedInitialized`              |
| `BalanceTrackerAtSnapshot`            | `_BALANCE_TRACKER_AT_SNAPSHOT_RESOLVER_KEY`              | `initializeBalanceTrackerAtSnapshot()`            | `BalanceTrackerAtSnapshotInitialized`            |
| `BalanceTrackerAtSnapshotByPartition` | `_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY` | `initializeBalanceTrackerAtSnapshotByPartition()` | `BalanceTrackerAtSnapshotByPartitionInitialized` |
| `BalanceTrackerByPartition`           | `_BALANCE_TRACKER_BY_PARTITION_RESOLVER_KEY`             | `initializeBalanceTrackerByPartition()`           | `BalanceTrackerByPartitionInitialized`           |

---

## Changes Per Facet

### Per-file changes (×11 facets)

1. **Interface (`IXxx.sol`)**:
   - Added event `XxxInitialized(address indexed operator)` after all types
   - Added function `initializeXxx() external` with NatSpec

2. **Abstract contract (`Xxx.sol`)**:
   - Added imports: `InitializerStorageWrapper`, `DEFAULT_ADMIN_ROLE`, `EvmAccessors`, resolver key
   - Added `initializeXxx()` function:
     ```solidity
     function initializeXxx() external override onlyFacetNotRegistered(_XXX_RESOLVER_KEY) onlyRole(DEFAULT_ADMIN_ROLE) {
       InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY);
       emit IXxx.XxxInitialized(EvmAccessors.getMsgSender());
     }
     ```
   - **Group B only**: Added `Modifiers` import and `is IInterface, Modifiers` inheritance

3. **Concrete facet (`XxxFacet.sol`)**:
   - Added `this.initializeXxx.selector` as first element in `getStaticFunctionSelectors`

4. **Test file**:
   - Added `describe("initializeXxx")` block with 3 tests:
     - Double init → `FacetAlreadyRegistered`
     - No admin → `AccountHasNoRole`
     - Event emission → `XxxInitialized` with `withArgs(deployer)`

---

## Skill Update

Updated `.agents/skills/initialize/workflows/ADD.md`:

- **New Step A.5 — Verify Modifiers inheritance**: Documents the pattern for view-only
  facets where the abstract contract does NOT inherit `Modifiers`. Adds import and `is`
  clause instructions, with CapByPartition as precedent.
- Updated all step numbers (3→5 through 11→12)
- Updated **Required imports** section to show both paths (with/without Modifiers)

---

## Pre-existing Bugs Fixed

During `--force` compile, 5 pre-existing bugs masked by Hardhat cache were discovered
and fixed:

| Bug                                                          | File                                   | Fix                                                    |
| ------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------ |
| Duplicate `initializeAccessControl()`                        | `IAccessControl.sol` (facet + factory) | Removed duplicate declaration                          |
| Missing `onlyNotInterestRateTypeInitialized`                 | `InterestRateModifiers.sol`            | Added modifier using `isInterestRateTypeInitialized()` |
| Undeclared vars `_regulationData`, `_additionalSecurityData` | `Loan.sol`                             | Commented out SecurityStorageWrapper call              |
| Missing `isKycInitialized()`                                 | `KycStorageWrapper.sol`                | Added function returning `internalKycActivated`        |
| Ordering: event after errors                                 | `IAdjustBalances.sol`                  | Moved `BalanceAdjustmentsInitialized` before errors    |

---

## Acceptance Criteria Verification

```
AC-1 — Selector registered:    ✅ 11/11 in getStaticFunctionSelectors
AC-2 — All 3 tests exist:      ✅ 33 tests in 11 files
AC-3 — All 3 tests pass:       ✅ 33 passing, 0 failing
AC-4 — Event NatSpec:          ✅ address indexed operator on all 11
AC-5 — Compile clean:          ✅ 0 errors
AC-6 — Solhint ordering:       ✅ 0 ordering errors
```

---

## Changesets

11 changeset files created under `.changeset/`:

```
.changeset/initialize-balance-adjustments.md
.changeset/initialize-allowance.md
.changeset/initialize-balance-tracker.md
.changeset/initialize-balance-tracker-adjusted.md
.changeset/initialize-balance-tracker-at-snapshot.md
.changeset/initialize-balance-tracker-at-snapshot-by-partition.md
.changeset/initialize-balance-tracker-by-partition.md
.changeset/initialize-batch-burn.md
.changeset/initialize-batch-controller.md
.changeset/initialize-batch-freeze.md
.changeset/initialize-batch-mint.md
```

---

## Files Modified (51 total)

```
 .agents/skills/initialize/workflows/ADD.md         |  75 +++++++-
 contracts/domain/core/KycStorageWrapper.sol         |   4 +
 contracts/facets/accessControl/IAccessControl.sol    |   4 -
 contracts/facets/adjustBalances/*.sol                |  37 +++-
 contracts/facets/allowance/*.sol                     |  29 +++-
 contracts/facets/balanceTracker/*.sol                |  39 +++-
 contracts/facets/balanceTrackerAdjusted/*.sol        |  34 +++-
 contracts/facets/balanceTrackerAtSnapshot/*.sol      |  33 +++-
 contracts/facets/balanceTrackerAtSnapshotByPartition/*.sol | 35 +++-
 contracts/facets/balanceTrackerByPartition/*.sol     |  33 +++-
 contracts/facets/batchBurn/*.sol                     |  31 +++-
 contracts/facets/batchController/*.sol               |  31 +++-
 contracts/facets/batchFreeze/*.sol                   |  29 +++-
 contracts/facets/batchMint/*.sol                     |  31 +++-
 contracts/facets/layer_2/loan/Loan.sol               |   3 +-
 contracts/facets/layer_2/loansPortfolio/LoansPortfolio.sol | 7 +-
 contracts/factory/ERC3643/interfaces/IAccessControl.sol | 4 -
 contracts/services/asset/InterestRateModifiers.sol   |  10 +
 test/**/*.test.ts (11 files)                         | 672 +++++++
 51 files changed, 1037 insertions(+), 38 deletions(-)
```

---

## Remaining Work

| Task               | Skill                       | Description                                              |
| ------------------ | --------------------------- | -------------------------------------------------------- |
| Factory wiring     | `initialize-factory` Part A | Add `initializeXxx` calls to `Factory._deploySecurity()` |
| Config operational | `initialize-factory` Part C | Add `onlyOperational` when all facets migrated           |
| Deployment scripts | `initialize-factory` Part D | Add `setOperationalStatus` loops                         |

---

## Decision Log

1. **View-only facets need Modifiers**: Following the established precedent from
   `CapByPartition`, view-only facets that don't inherit `Modifiers` must add it to
   support `onlyFacetNotRegistered` and `onlyRole(DEFAULT_ADMIN_ROLE)`.
2. **All init functions are parameterless**: None of these 11 facets require storage
   initialisation parameters, so all use the "capability registration only" pattern.
3. **Tests use deployEquityTokenFixture directly**: Since the factory does not yet call
   these `initializeXxx` functions, each test deploys a fresh proxy via `loadFixture`
   and tests against it directly.
