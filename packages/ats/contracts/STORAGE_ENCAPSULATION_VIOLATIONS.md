# Storage Encapsulation Violations Analysis

**Date:** 2026-02-23
**Context:** Library-based Diamond Architecture Migration Review
**Principle:** Storage structs should only be accessible within their domain boundary (domain libraries), never from facets or application layer.

---

## Executive Summary

The library-based migration achieved **~96% encapsulation compliance**. However, **7 files** contain **24 direct storage accesses** that violate the storage encapsulation principle. These violations fall into two categories:

| Category | Severity | Files | Violations |
|----------|----------|-------|------------|
| Direct storage accessor from facet | **HIGH** | 1 | 18 |
| Leaky library accessor (returns storage struct) | **MEDIUM** | 6 | 6 |

---

## The Storage Encapsulation Principle

### Definition

In Domain-Driven Design (DDD) and clean architecture, storage encapsulation means:

1. **Storage structs** are implementation details of the domain layer
2. **Only domain libraries** should access storage directly
3. **Facets (application layer)** should interact with domain through library functions only
4. **Libraries should return values**, not storage struct pointers

### Benefits

- **Implementation hiding**: Storage layout can change without affecting facets
- **Testability**: Libraries can be mocked independently
- **Maintainability**: Changes are localized to the library layer
- **Auditability**: All storage access goes through known functions

### Correct Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                        CORRECT PATTERN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   FACET (Application Layer)                                     │
│   ┌─────────────────────────────────────────┐                   │
│   │ function pause() external {             │                   │
│   │     LibPause.pause();  ◄── Only library │                   │
│   │ }                                       │                   │
│   └─────────────────────────────────────────┘                   │
│                      │                                          │
│                      ▼                                          │
│   LIBRARY (Domain Layer)                                        │
│   ┌─────────────────────────────────────────┐                   │
│   │ function pause() internal {             │                   │
│   │     pauseStorage().paused = true;  ◄──█│ Storage access    │
│   │ }                                       │   isolated here   │
│   └─────────────────────────────────────────┘                   │
│                      │                                          │
│                      ▼                                          │
│   STORAGE (Infrastructure)                                      │
│   ┌─────────────────────────────────────────┐                   │
│   │ struct PauseDataStorage { bool paused; }│                   │
│   │ function pauseStorage() pure returns... │                   │
│   └─────────────────────────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Violation Category 1: Direct Storage Access from Facet

### File: `facets/features/snapshots/SnapshotsFeature.sol`

**Severity:** HIGH
**Violations:** 18

This file directly imports and uses `snapshotStorage()` accessor, bypassing `LibSnapshots` entirely.

#### Evidence

```solidity
// Line 20 - Direct storage import
import { snapshotStorage, SnapshotStorage } from "../../../storage/AssetStorage.sol";

// Line 41 - Direct storage access
(bool snapshotted, uint256 value) = LibSnapshots.valueAt(_snapshotID, snapshotStorage().decimals);

// Line 51 - Direct storage access
snapshotStorage().accountBalanceSnapshots[_tokenHolder],

// Line 67 - Storage binding to local variable
SnapshotStorage storage ss = snapshotStorage();

// Lines 73, 99, etc. - Direct field access
ss.tokenHoldersSnapshots[index]
```

#### Complete List of Violations

| Line | Violation | Field Accessed |
|------|-----------|----------------|
| 41 | `snapshotStorage().decimals` | `.decimals` |
| 51 | `snapshotStorage().accountBalanceSnapshots[_tokenHolder]` | `.accountBalanceSnapshots` |
| 67 | `SnapshotStorage storage ss = snapshotStorage()` | Storage binding |
| 73 | `ss.tokenHoldersSnapshots[index]` | `.tokenHoldersSnapshots` |
| 90 | `snapshotStorage().accountPartitionBalanceSnapshots[_tokenHolder][_partition]` | `.accountPartitionBalanceSnapshots` |
| 99 | `snapshotStorage().accountPartitionMetadata[_tokenHolder]` | `.accountPartitionMetadata` |
| 108 | `snapshotStorage().totalSupplySnapshots` | `.totalSupplySnapshots` |
| 118 | `snapshotStorage().totalSupplyByPartitionSnapshots[_partition]` | `.totalSupplyByPartitionSnapshots` |
| 129 | `snapshotStorage().accountLockedBalanceSnapshots[_tokenHolder]` | `.accountLockedBalanceSnapshots` |
| 141 | `snapshotStorage().accountPartitionLockedBalanceSnapshots[_tokenHolder][_partition]` | `.accountPartitionLockedBalanceSnapshots` |
| 152 | `snapshotStorage().accountHeldBalanceSnapshots[_tokenHolder]` | `.accountHeldBalanceSnapshots` |
| 164 | `snapshotStorage().accountPartitionHeldBalanceSnapshots[_tokenHolder][_partition]` | `.accountPartitionHeldBalanceSnapshots` |
| 175 | `snapshotStorage().accountClearedBalanceSnapshots[_tokenHolder]` | `.accountClearedBalanceSnapshots` |
| 187 | `snapshotStorage().accountPartitionClearedBalanceSnapshots[_tokenHolder][_partition]` | `.accountPartitionClearedBalanceSnapshots` |
| 198 | `snapshotStorage().accountFrozenBalanceSnapshots[_tokenHolder]` | `.accountFrozenBalanceSnapshots` |
| 210 | `snapshotStorage().accountPartitionFrozenBalanceSnapshots[_tokenHolder][_partition]` | `.accountPartitionFrozenBalanceSnapshots` |
| 241 | `snapshotStorage().abafSnapshots` | `.abafSnapshots` |
| 248 | `snapshotStorage().totalTokenHoldersSnapshots` | `.totalTokenHoldersSnapshots` |

#### Impact

- **Encapsulation breach**: Facet knows storage layout
- **Refactoring risk**: Changes to `SnapshotStorage` struct require facet changes
- **Testing difficulty**: Cannot mock storage layer independently

#### Recommended Fix

Add view functions to `LibSnapshots` for each access pattern:

```solidity
// lib/domain/LibSnapshots.sol - ADD THESE FUNCTIONS

function getDecimalsAtSnapshot(uint256 snapshotId) internal view returns (bool, uint256) {
    return valueAt(snapshotId, snapshotStorage().decimals);
}

function getAccountBalanceAtSnapshot(address account, uint256 snapshotId) internal view returns (bool, uint256) {
    return valueAt(snapshotId, snapshotStorage().accountBalanceSnapshots[account]);
}

function getAccountPartitionBalanceAtSnapshot(
    address account,
    bytes32 partition,
    uint256 snapshotId
) internal view returns (bool, uint256) {
    return valueAt(snapshotId, snapshotStorage().accountPartitionBalanceSnapshots[account][partition]);
}

function getTokenHolderAtSnapshot(uint256 snapshotId, uint256 index) internal view returns (bool, address) {
    (bool found, uint256 snapshotIndex) = indexFor(snapshotId, snapshotStorage().tokenHoldersSnapshots[index].ids);
    if (!found) return (false, address(0));
    return (true, snapshotStorage().tokenHoldersSnapshots[index].values[snapshotIndex].value);
}

// ... continue for all 18 patterns
```

Then update `SnapshotsFeature.sol` to use library functions only:

```solidity
// facets/features/snapshots/SnapshotsFeature.sol - AFTER FIX

// REMOVE: import { snapshotStorage, SnapshotStorage } from "../../../storage/AssetStorage.sol";

function decimalsAtSnapshot(uint256 _snapshotID) external view override returns (uint8 decimals_) {
    (bool snapshotted, uint256 value) = LibSnapshots.getDecimalsAtSnapshot(_snapshotID);
    decimals_ = snapshotted ? uint8(value) : LibERC20.getDecimals();
}
```

---

## Violation Category 2: Leaky Library Accessor

### Library: `lib/domain/LibInterestRate.sol`

**Severity:** MEDIUM
**Violations:** 6 facets affected

The library exposes storage structs directly instead of values, allowing facets to bypass encapsulation.

#### Evidence

```solidity
// lib/domain/LibInterestRate.sol - LEAKY ACCESSOR

// Returns storage struct pointer instead of values
function getKpiLinkedRate() internal pure returns (KpiLinkedRateDataStorage storage) {
    return kpiLinkedRateStorage();  // ❌ Exposes implementation detail
}

function getSustainabilityRate() internal pure returns (SustainabilityPerformanceTargetRateDataStorage storage) {
    return sustainabilityPerformanceTargetRateStorage();  // ❌ Exposes implementation detail
}
```

#### Affected Files

| File | Line | Storage Binding | Fields Accessed |
|------|------|-----------------|-----------------|
| `facets/regulation/bondUSA/kpiLinkedRate/BondUSAReadKpiLinkedRate.sol` | 58 | `kpiLinkedRateStorage = LibInterestRate.getKpiLinkedRate()` | `.startPeriod`, `.startRate`, `.rateDecimals`, `.reportPeriod` |
| `facets/regulation/bondUSA/kpiLinkedRate/BondUSAKpiLinkedRate.sol` | 88 | `kpiLinkedRateStorage = LibInterestRate.getKpiLinkedRate()` | `.startPeriod`, `.startRate`, `.rateDecimals`, `.reportPeriod` |
| `facets/regulation/bondUSA/sustainabilityPerformanceTargetRate/BondUSAReadSustainabilityPerformanceTargetRate.sol` | 63 | `sptRateStorage = LibInterestRate.getSustainabilityRate()` | `.startPeriod`, `.startRate`, `.rateDecimals`, `.impactDataByProject` |
| `facets/regulation/bondUSA/sustainabilityPerformanceTargetRate/BondUSASustainabilityPerformanceTargetRate.sol` | 93 | `sptRateStorage = LibInterestRate.getSustainabilityRate()` | `.startPeriod`, `.startRate`, `.rateDecimals`, `.impactDataByProject` |
| `facets/assetCapabilities/scheduledTasks/scheduledCrossOrderedTasks/kpiLinkedRate/ScheduledCrossOrderedTasksKpiLinkedRate.sol` | 22 | `kpiRateStorage = LibInterestRate.getKpiLinkedRate()` | `.startPeriod`, `.startRate`, `.rateDecimals`, `.reportPeriod` |
| `facets/assetCapabilities/scheduledTasks/scheduledCrossOrderedTasks/sustainabilityPerformanceTargetRate/ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRate.sol` | 25 | `sptRateStorage = LibInterestRate.getSustainabilityRate()` | `.startPeriod`, `.startRate`, `.rateDecimals`, `.impactDataByProject` |

#### Example Violation

```solidity
// facets/regulation/bondUSA/kpiLinkedRate/BondUSAKpiLinkedRate.sol

// Import storage struct - VIOLATION
import { KpiLinkedRateDataStorage } from "../../../../storage/ScheduledStorage.sol";

function _calculateKpiLinkedInterestRate(...) internal view returns (...) {
    // Get storage struct from library - LEAKY ACCESSOR
    KpiLinkedRateDataStorage storage kpiLinkedRateStorage = LibInterestRate.getKpiLinkedRate();

    // Direct field access - VIOLATES ENCAPSULATION
    if (_coupon.fixingDate < kpiLinkedRateStorage.startPeriod) {
        return (kpiLinkedRateStorage.startRate, kpiLinkedRateStorage.rateDecimals);
    }

    // More direct field access
    _coupon.fixingDate - kpiLinkedRateStorage.reportPeriod
}
```

#### Impact

- **Leaky abstraction**: Library returns implementation detail
- **Tight coupling**: Facets depend on storage struct fields
- **Refactoring difficulty**: Cannot change storage layout without updating facets

#### Recommended Fix

Replace leaky accessors with value-returning functions:

```solidity
// lib/domain/LibInterestRate.sol - AFTER FIX

// REMOVE leaky accessor:
// function getKpiLinkedRate() internal pure returns (KpiLinkedRateDataStorage storage)

// ADD value-returning accessors:
function getKpiLinkedRateStartPeriod() internal view returns (uint256) {
    return kpiLinkedRateStorage().startPeriod;
}

function getKpiLinkedRateStartRate() internal view returns (uint256) {
    return kpiLinkedRateStorage().startRate;
}

function getKpiLinkedRateRateDecimals() internal view returns (uint8) {
    return kpiLinkedRateStorage().rateDecimals;
}

function getKpiLinkedRateReportPeriod() internal view returns (uint256) {
    return kpiLinkedRateStorage().reportPeriod;
}

// For Sustainability Performance Target Rate:
function getSptStartPeriod() internal view returns (uint256) {
    return sustainabilityPerformanceTargetRateStorage().startPeriod;
}

function getSptStartRate() internal view returns (uint256) {
    return sustainabilityPerformanceTargetRateStorage().startRate;
}

function getSptRateDecimals() internal view returns (uint8) {
    return sustainabilityPerformanceTargetRateStorage().rateDecimals;
}

function getSptImpactData(address project) internal view returns (ISustainabilityPerformanceTargetRate.ImpactData memory) {
    return sustainabilityPerformanceTargetRateStorage().impactDataByProject[project];
}
```

Then update facets to use only library functions:

```solidity
// facets/regulation/bondUSA/kpiLinkedRate/BondUSAKpiLinkedRate.sol - AFTER FIX

// REMOVE: import { KpiLinkedRateDataStorage } from "../../../../storage/ScheduledStorage.sol";

function _calculateKpiLinkedInterestRate(...) internal view returns (...) {
    // Use library accessors - NO STORAGE EXPOSURE
    uint256 startPeriod = LibInterestRate.getKpiLinkedRateStartPeriod();

    if (_coupon.fixingDate < startPeriod) {
        return (LibInterestRate.getKpiLinkedRateStartRate(), LibInterestRate.getKpiLinkedRateRateDecimals());
    }

    // Use library accessors
    uint256 reportPeriod = LibInterestRate.getKpiLinkedRateReportPeriod();
    // ...
}
```

---

## Compliance Statistics

| Metric | Value |
|--------|-------|
| Total facet files | ~180 |
| Files with violations | 7 |
| Files compliant | ~173 |
| **Compliance rate** | **~96%** |
| Total direct storage accesses | 24 |
| Violations in SnapshotsFeature.sol | 18 (75%) |
| Violations in rate-related facets | 6 (25%) |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CURRENT STATE (WITH VIOLATIONS)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FACETS                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ SnapshotsFeature.sol ──────────────────────────────────────────────┐│   │
│   │   ❌ snapshotStorage().accountBalanceSnapshots[...]                ││   │
│   │   ❌ snapshotStorage().decimals                                    ││   │
│   │   ❌ ss.tokenHoldersSnapshots[index]                               ││   │
│   └──────────────────────────────────────────────────────────────────││──┘   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ BondUSAKpiLinkedRate.sol ─────────────────────────────────────────┐││   │
│   │   ❌ LibInterestRate.getKpiLinkedRate() → .startPeriod             │││   │
│   │   ❌ kpiLinkedRateStorage.startRate                                │││   │
│   └──────────────────────────────────────────────────────────────────│││──┘   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Pause.sol (CORRECT) ────────────────────────────────────────────┐  ││   │
│   │   ✅ LibPause.pause()                                            │  ││   │
│   │   ✅ LibAccess.checkRole()                                       │  ││   │
│   └──────────────────────────────────────────────────────────────────│──┘   │
│                                      │                │              │       │
│                                      │                │              │       │
│                                      ▼                ▼              ▼       │
│   LIBRARIES                          │                │                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ LibPause.sol ─────────────────────────────────────────────────────┐ │   │
│   │   ✅ pauseStorage().paused = true                                 │ │   │
│   └────────────────────────────────────────────────────────────────────│─┘   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ LibInterestRate.sol ──────────────────────────────────────────────┐ │   │
│   │   ⚠️ getKpiLinkedRate() returns storage struct                    │ │   │
│   │   ✅ initializeKpiLinkedRate() uses kpiLinkedRateStorage()        │ │   │
│   └────────────────────────────────────────────────────────────────────│─┘   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ LibSnapshots.sol ────────────────────────────────────────────────┐ │   │
│   │   ✅ takeSnapshot() uses snapshotStorage()                        │ │   │
│   │   ✅ valueAt() receives storage param (ok for library)            │ │   │
│   └────────────────────────────────────────────────────────────────────│─┘   │
│                                      │                                    │       │
│                                      ▼                                    │       │
│   STORAGE                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ CoreStorage.sol, TokenStorage.sol, AssetStorage.sol, etc.          │   │
│   │   struct PauseDataStorage { bool paused; }                         │   │
│   │   struct KpiLinkedRateDataStorage { ... }                          │   │
│   │   struct SnapshotStorage { ... }                                   │   │
│   │   function pauseStorage() pure returns (...)                       │   │
│   │   function kpiLinkedRateStorage() pure returns (...)               │   │
│   │   function snapshotStorage() pure returns (...)                    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Remediation Priority

| Priority | File | Effort | Impact |
|----------|------|--------|--------|
| **P1** | `SnapshotsFeature.sol` | Medium (18 access patterns) | High (core feature) |
| **P2** | `LibInterestRate.sol` + 6 rate facets | Medium (6 files) | Medium |

---

## Implementation Checklist

### Phase 1: Fix SnapshotsFeature.sol

- [ ] Add 18 view functions to `LibSnapshots.sol`
- [ ] Update `SnapshotsFeature.sol` to use library functions only
- [ ] Remove storage import from `SnapshotsFeature.sol`
- [ ] Run all tests to verify no behavior change
- [ ] Update documentation

### Phase 2: Fix LibInterestRate leaky accessor

- [ ] Add value-returning accessors to `LibInterestRate.sol`
- [ ] Update `BondUSAReadKpiLinkedRate.sol`
- [ ] Update `BondUSAKpiLinkedRate.sol`
- [ ] Update `BondUSAReadSustainabilityPerformanceTargetRate.sol`
- [ ] Update `BondUSASustainabilityPerformanceTargetRate.sol`
- [ ] Update `ScheduledCrossOrderedTasksKpiLinkedRate.sol`
- [ ] Update `ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRate.sol`
- [ ] Remove leaky `getKpiLinkedRate()` and `getSustainabilityRate()` functions
- [ ] Run all tests to verify no behavior change

---

## Prevention Measures

### Code Review Checklist

When reviewing new code, check:

1. [ ] Facet does NOT import from `storage/` directory
2. [ ] Facet does NOT call `xxxStorage()` accessors directly
3. [ ] Facet does NOT bind `Storage` types to local variables
4. [ ] Library functions return VALUES, not storage pointers
5. [ ] Library functions can be unit tested independently

### Architectural Rule

```
FACETS ──► LIBRARIES ──► STORAGE
   │          │           │
   │          │           └── Only here
   │          └── Return values, not structs
   └── Never directly
```

---

## Conclusion

The library-based migration successfully encapsulated **~96%** of storage access behind domain libraries. The remaining violations are:

1. **SnapshotsFeature.sol** - Direct storage accessor usage (18 instances)
2. **LibInterestRate** - Leaky accessor pattern (affects 6 facets)

Both can be fixed by adding proper value-returning accessor functions to the domain libraries and updating facets to use them exclusively. This will achieve **100% storage encapsulation compliance**.