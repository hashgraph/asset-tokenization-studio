# Merge Summary - fix/clearing_tests Integration

**Date**: 2026-03-26  
**Branch**: `refactor/BBND-1458-59-60-lib-diamond-migration`  
**Commit**: `feat(contracts): merge fix/clearing_tests with EvmAccessors migration`

---

## Executive Summary

✅ **Merge Completed**: `origin/fix/clearing_tests` integrated with EvmAccessors migration  
✅ **Compilation**: Successful  
✅ **Test Improvement**: 2,043 passing / 106 failing (was 2,031 / 118)  
📈 **Progress**: **10 fewer failures** (-8.5% failure rate)

---

## What Was Merged

### From fix/clearing_tests Branch (12 files)

1. **New AddressModifiers Pattern**
   - `contracts/services/core/AddressModifiers.sol` (NEW)
   - Provides `notZeroAddress` modifier for cleaner validation
   - Replaces inline `requireValidAddress` calls

2. **Unified Modifiers Import**
   - Consolidated modifier imports → single `Modifiers` class
   - Cleaner inheritance: `abstract contract Foo is Modifiers`
   - Removed scattered: `AccessControlModifiers`, `PauseModifiers`, `ClearingModifiers`, etc.

3. **Test Fixes**
   - Clearing tests updated with proper validation
   - Hold tests fixed
   - Protected partitions tests improved

4. **Files Changed**:
   - `ClearingOps.sol` (8 changes)
   - `ERC3643Management.sol` (10 changes)
   - `ClearingActions.sol` (4 changes)
   - `ClearingTransfer.sol` (24 changes)
   - `Freeze.sol` (7 changes)
   - `HoldManagement.sol` (23 changes)
   - `AddressModifiers.sol` (NEW - 30 lines)
   - `CoreModifiers.sol` (2 changes)
   - `atsRegistry.data.ts` (20 changes)
   - Clearing, hold, protected partitions tests

---

## Conflict Resolution

### ClearingTransfer.sol

**Conflict**: Separate modifier imports (HEAD) vs unified Modifiers (fix/clearing_tests)

**Resolution**: ✅ Accepted unified `Modifiers` pattern (cleaner)

```diff
- import { AccessControlModifiers } from "...";
- import { PauseModifiers } from "...";
- import { ClearingModifiers } from "...";
- import { PartitionModifiers } from "...";
- import { ERC3643Modifiers } from "...";
- import { ERC1410Modifiers } from "...";
- import { ExpirationModifiers } from "...";
+ import { Modifiers } from "../../../services/Modifiers.sol";
+ import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

- abstract contract ClearingTransfer is
-     IClearingTransfer,
-     AccessControlModifiers,
-     TimestampProvider,
-     PauseModifiers,
-     ClearingModifiers,
-     PartitionModifiers,
-     ERC3643Modifiers,
-     ERC1410Modifiers,
-     ExpirationModifiers
+ abstract contract ClearingTransfer is IClearingTransfer, TimestampProvider, Modifiers
```

**Bug Fix**: `onlyValidAddress` → `notZeroAddress`

- Line 130-131: `protectedClearingTransferByPartition` used non-existent `onlyValidAddress`
- Fixed to use correct `notZeroAddress` modifier

### atsRegistry.data.ts

**Conflict**: Generated file timestamp difference

**Resolution**: ✅ Accepted theirs (fix/clearing_tests version)

---

## EvmAccessors Application (7 instances across 3 files)

### ClearingTransfer.sol (4 instances)

1. Line 51: `ERC3643StorageWrapper.requireUnrecoveredAddress(msg.sender)` → `EvmAccessors.getMsgSender()`
2. Line 57: `msg.sender` in function arg → `EvmAccessors.getMsgSender()`
3. Line 65: `ERC3643StorageWrapper.requireUnrecoveredAddress(msg.sender)` → `EvmAccessors.getMsgSender()`
4. Line 105: `ERC3643StorageWrapper.requireUnrecoveredAddress(msg.sender)` → `EvmAccessors.getMsgSender()`
5. Line 168-170: `_requireUnProtectedPartitionsOrWildCardRole` helper (2 instances)

### ClearingActions.sol (2 instances)

1. Line 26: `emit ClearingActivated(msg.sender)` → `EvmAccessors.getMsgSender()`
2. Line 31: `emit ClearingDeactivated(msg.sender)` → `EvmAccessors.getMsgSender()`

### Freeze.sol (1 instance)

1. Line 41: `emit AddressFrozen(_userAddress, _freezStatus, msg.sender)` → `EvmAccessors.getMsgSender()`

---

## Test Results Comparison

| Metric        | Before Merge | After Merge | Change   |
| ------------- | ------------ | ----------- | -------- |
| **Passing**   | 2,031        | 2,043       | +12 ✅   |
| **Failing**   | 118          | 106         | -12 ✅   |
| **Total**     | 2,149        | 2,149       | -        |
| **Pass Rate** | 94.5%        | 95.1%       | +0.6% 📈 |

---

## Remaining Issues (106 failures)

### 1. TransferAndLock Tests (2 NEW failures) ⚠️

**Error**: `WrongLockId()` in `getLockFor`

```
Error: VM Exception while processing transaction: reverted with custom error 'WrongLockId()'
  at LockFacetTimeTravel.requireValidLockId (contracts/domain/asset/LockStorageWrapper.sol:219)
  at LockFacetTimeTravel.getLockFor (contracts/facets/layer_1/lock/LockFacet.sol:119)
```

**Failed Tests**:

- `Transfer and lock Tests > Multi-partition enabled > transferAndLockByPartition > GIVEN a valid partition WHEN transferAndLockByPartition with enough balance THEN transaction success`
- `Transfer and lock Tests > Multi-partition disabled > transferAndLock > GIVEN a valid partition WHEN transferAndLock with enough balance THEN transaction success`

**Root Cause**: Unknown — needs investigation

- Lock creation might not be working correctly after merge
- Possible interaction between TransferAndLock and new Modifiers pattern
- Could be related to EvmAccessors in lock operations

**Status**: 🔴 **NEW ISSUE** — introduced by this merge

---

### 2. Scheduled Tasks (~90 failures) - Pre-existing

**Status**: ⚠️ Known issue — see `SCHEDULED_TASKS_ISSUES.md`

Not introduced by this merge.

---

### 3. Other Failures (~14) - Pre-existing

Error name mismatches, compliance issues, etc.

Not introduced by this merge.

---

## Next Steps

### Immediate Priority: Fix TransferAndLock ⚠️

**Investigation needed**:

1. Why does `getLockFor` fail with `WrongLockId()`?
2. Is lock creation working in `transferAndLockByPartition`?
3. Does the issue relate to:
   - EvmAccessors in TransferAndLock.sol?
   - New Modifiers pattern?
   - Clearing/lock interaction?

**Files to check**:

- `contracts/facets/layer_3/transferAndLock/TransferAndLock.sol`
- `contracts/facets/layer_1/lock/LockFacet.sol`
- `contracts/domain/asset/LockStorageWrapper.sol`
- Test: `test/contracts/integration/layer_1/transferAndLock/transferAndLock.test.ts`

---

## Engram Memory Updates

```bash
engram_memory(action: "record_change", changes: [
  {file_path: "ClearingTransfer.sol", change_type: "modified",
   description: "Merged fix/clearing_tests + applied EvmAccessors",
   impact_scope: "module"},
  {file_path: "ClearingActions.sol", change_type: "modified",
   description: "Applied EvmAccessors to clearing events",
   impact_scope: "local"},
  {file_path: "Freeze.sol", change_type: "modified",
   description: "Applied EvmAccessors to freeze event",
   impact_scope: "local"}
])
```

---

## Summary

✅ **Merge successful** — 10 fewer test failures  
✅ **EvmAccessors pattern** applied to 7 new instances  
✅ **Cleaner architecture** with unified Modifiers pattern  
🔴 **2 NEW failures** in TransferAndLock — needs urgent investigation

**Overall**: Positive progress, but new issue requires immediate attention.
