# TODO: Contract Test Failures Fix

## 🎯 Goal: Fix remaining test failures (baseline: 2012 passing)

**Status:** In Progress

---

## Progress Summary

| Session   | Passing | Failing | Fixed | Notes                       |
| --------- | ------- | ------- | ----- | --------------------------- |
| Session 8 | 2012    | 137     | +5    | WrongISIN→WrongISINChecksum |
| Session 9 | 2017    | 132     | +5    | Pattern 9 + Event exports   |

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

## ⏳ Phase 5: TransferByPartition Event Issue (NEEDS INVESTIGATION)

- [ ] Investigate why IERC3643 tests still fail with TransferByPartition event
- [ ] Determine if IERC1644 needs event re-export
- Current tests failing with "Event 'TransferByPartition' doesn't exist" from erc1644Facet

---

## ⏳ Phase 6: Wrong Error Logic (NEEDS INVESTIGATION)

- [ ] PartitionsAreUnProtected expected but AccountHasNoRole thrown (3 tests)
- [ ] LockExpirationNotReached expected but no revert (2 tests)
- [ ] WalletRecovered expected but different error thrown

---

## ⏳ Phase 7: Numeric Value Mismatches (NEEDS INVESTIGATION)

- [ ] Analyze contract logic mismatches (~100 tests)
- [ ] Contracts returning 0 instead of expected values
- [ ] ScheduledCouponListing, balance calculations

---

## Current Test Status

```
Passing: 2017
Failing: 132
Total: 2149
```

---

## Files Modified This Session

1. `packages/ats/contracts/contracts/facets/layer_1/controlList/IControlList.sol`
2. `packages/ats/contracts/test/contracts/integration/layer_1/ERC1400/ERC1410/erc1410.test.ts`
3. `packages/ats/contracts/contracts/facets/layer_1/clearing/IClearing.sol`
4. `packages/ats/contracts/contracts/facets/layer_2/scheduledTask/scheduledSnapshot/IScheduledSnapshots.sol`
5. `packages/ats/contracts/scripts/domain/atsRegistry.data.ts` (auto-generated)
