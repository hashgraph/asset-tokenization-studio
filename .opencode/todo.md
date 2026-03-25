# TODO: Contract Test Failures Fix

## 🎯 Goal: Fix 139 remaining test failures

**Status:** In Progress

---

## Phase 1: Quick Wins ✅ COMPLETED

- [x] Export missing custom errors in facet interfaces (18 tests fixed)
- [x] Fix WrongISIN → WrongISINChecksum (5 tests fixed)
- [x] Session 8: Priority 2 investigation complete

---

## Phase 2: Pattern 9 - TypeChain Selectors ⏳ IN PROGRESS

### P2.1: AccountIsBlocked selector (1 test)

- [ ] Add `error AccountIsBlocked(address account)` to IControlList.sol
- [ ] Re-run test to verify fix

---

## Phase 3: ReferenceError Fix (5 tests)

### P3.1: roleFacet undefined in erc1410.test.ts

- [ ] Investigate test file - roleFacet should be defined
- [ ] Fix reference or add missing declaration
- [ ] Verify tests pass

---

## Phase 4: Missing Event Exports (8 tests)

### P4.1: Event re-exports needed

- [ ] IERC1410.sol - TransferByPartition event
- [ ] IClearing.sol - ClearedTransferByPartition, ClearedRedeemByPartition, ClearedHoldByPartition events
- [ ] IScheduledSnapshots.sol - SnapshotTriggered event

---

## Phase 5: Numeric Values (~100 tests) - Needs Investigation

- [ ] Analyze contract logic mismatches
- [ ] Determine if test expectations or contracts are wrong

---

## Current Test Status: 2010 passing / 139 failing
