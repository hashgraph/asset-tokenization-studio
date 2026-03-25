# TODO: Contract Test Failures Fix

## 🎯 Goal: Fix remaining test failures (baseline: 2012 passing)

**Status:** In Progress

---

## Progress Summary

| Session   | Passing | Failing | Fixed | Notes                                      |
| --------- | ------- | ------- | ----- | ------------------------------------------ |
| Session 8 | 2012    | 137     | +5    | WrongISIN→WrongISINChecksum                |
| Session 9 | 2029    | 120     | +17   | Pattern 9 + Event exports + Modifier order |

---

## ✅ Phase 1: Custom Error Exports (COMPLETED - Session 8)

- [x] Export missing custom errors in facet interfaces (18 tests fixed)
- [x] Fix WrongISIN → WrongISINChecksum (5 tests fixed)
- [x] Session 8: Priority 2 investigation complete

---

## ✅ Phase 2: Pattern 9 - TypeChain Selectors (COMPLETED - Session 9)

### P2.1: AccountIsBlocked selector

- [x] Add `error AccountIsBlocked(address account)` to IControlList.sol
- [x] Re-run test to verify fix
- Commit: `61ac1194`

---

## ✅ Phase 3: ReferenceError Fix (COMPLETED - Session 9)

### P3.1: roleFacet/supplyFacet undefined in erc1410.test.ts

- [x] Fix reference: roleFacet → accessControlFacet (5 occurrences)
- [x] Fix reference: supplyFacet → capFacet (2 occurrences)
- [x] Verify tests pass
- Commit: `61ac1194`

---

## ✅ Phase 4: Missing Event Exports (COMPLETED - Session 9)

### P4.1: Event re-exports implemented

- [x] IClearing.sol - ClearedTransferByPartition, ClearedRedeemByPartition, ClearedHoldByPartition events
- [x] IScheduledSnapshots.sol - SnapshotTriggered event
- [x] Added ClearingHold struct to avoid circular dependency
- Commit: `9a37a710`
- Note: TransferByPartition already inherited from IERC1410StorageWrapper

---

## ✅ Phase 5: TransferByPartition Test Bug Fix (COMPLETED - Session 9)

- [x] Fix IERC3643 test - erc1644Facet.controllerTransfer() emits ControllerTransfer, not TransferByPartition
- [x] Update test to expect correct event
- Commit: `618feefe`

---

## ✅ Phase 6: Wrong Error Logic - Modifier Order (COMPLETED - Session 9)

### P6.1: PartitionsAreUnProtected vs AccountHasNoRole/WalletRecovered (12 tests) - FIXED

- [x] Root Cause: Modifier execution order didn't match main branch
- [x] Fix: Reordered modifiers to match main branch:
  1. `onlyUnpaused`
  2. `onlyUnrecoveredAddress` (WalletRecovered check)
  3. `onlyProtectedPartitions` (Partitions check)
  4. `onlyRole` (Role check)
  5. `onlyClearingActivated`
- [x] Files Changed: ClearingTransfer.sol, ClearingRedeem.sol, ClearingHoldCreation.sol
- [x] Added PartitionModifiers and ERC3643Modifiers imports
- Commit: Pending (local changes)

### P6.2: LockExpirationNotReached (2 tests) - NEEDS INVESTIGATION

- [ ] Tests: releaseByPartition and release should revert when expiration not reached
- [ ] Actual: Transaction doesn't revert at all
- [ ] Status: Contract bug - validation missing or not working

---

## ⏸️ Phase 7: Numeric Value Mismatches (NEEDS INVESTIGATION)

- [ ] Analyze contract logic mismatches (~100 tests)
- [ ] Contracts returning 0 instead of expected values
- [ ] ScheduledCouponListing, balance calculations

---

## Current Test Status

```
Passing: 2029
Failing: 120
Total: 2149
```

**Baseline Progress: 2010 → 2029 (+19 tests fixed)**

---

## Commits Made This Session

1. `61ac1194` - fix(contracts): re-export AccountIsBlocked error and fix test references
2. `9a37a710` - fix(contracts): add clearing and snapshot events for TypeChain visibility
3. `618feefe` - fix(test): correct event expectation in erc3643 test
4. **Pending** - fix(contracts): correct modifier execution order to match main branch

---

## Files Modified This Session

1. `packages/ats/contracts/contracts/facets/layer_1/controlList/IControlList.sol`
2. `packages/ats/contracts/test/contracts/integration/layer_1/ERC1400/ERC1410/erc1410.test.ts`
3. `packages/ats/contracts/contracts/facets/layer_1/clearing/IClearing.sol`
4. `packages/ats/contracts/contracts/facets/layer_2/scheduledTask/scheduledSnapshot/IScheduledSnapshots.sol`
5. `packages/ats/contracts/test/contracts/integration/layer_1/ERC3643/erc3643.test.ts`
6. `packages/ats/contracts/contracts/facets/layer_1/clearing/ClearingTransfer.sol`
7. `packages/ats/contracts/contracts/facets/layer_1/clearing/ClearingRedeem.sol`
8. `packages/ats/contracts/contracts/facets/layer_1/clearing/ClearingHoldCreation.sol`
9. `packages/ats/contracts/scripts/domain/atsRegistry.data.ts` (auto-generated)
