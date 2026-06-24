# Scheduled Tasks & Coupon Listing - Test Failures Analysis

**Assigned to**: [Your Colleague]  
**Date**: 2026-03-26  
**Context**: EvmAccessors migration - `msg.sender` → `EvmAccessors.getMsgSender()`  
**Branch**: `refactor/BBND-1458-59-60-lib-diamond-migration`

---

## Overview

After migrating all storage wrappers to use `EvmAccessors.getMsgSender()` instead of `msg.sender`, we're seeing **~12 test failures** related to scheduled tasks and coupon listing functionality.

**Key Symptom**: Task counts returning **0** when they should return **2-5**.

---

## Test Failures Summary

### ScheduledCouponListing Tests (6 failures)

| Test                                         | Expected | Actual | Status |
| -------------------------------------------- | -------- | ------ | ------ |
| scheduledCouponListingCount                  | 3        | 0      | ❌     |
| getScheduledCouponListing (all coupons)      | 5        | 0      | ❌     |
| getScheduledCouponListing (page 0, length 3) | 3        | 0      | ❌     |
| getScheduledCouponListing (page 1, length 3) | 2        | 0      | ❌     |
| getScheduledCouponListing (structure check)  | 1        | 0      | ❌     |
| getScheduledCouponListing (pagination)       | varies   | 0      | ❌     |

### Proceed Recipients Tests (2 failures)

| Test                                       | Expected | Actual | Status |
| ------------------------------------------ | -------- | ------ | ------ |
| Add recipient - pending tasks triggered    | 2        | 1      | ❌     |
| Remove recipient - pending tasks triggered | 2        | 1      | ❌     |

---

## Root Cause Hypothesis

The scheduled task system likely uses `msg.sender` for:

1. **Task ownership/creator tracking**
2. **Task registration in mappings**
3. **Task triggering logic**
4. **Event emissions**

When we replaced `msg.sender` with `EvmAccessors.getMsgSender()`, the task registration or retrieval logic may have broken.

---

## Files to Investigate

### Primary Suspects

1. **ScheduledTasksStorageWrapper.sol**

   ```bash
   # Already verified - NO msg.sender found
   grep -n "msg.sender" contracts/domain/asset/ScheduledTasksStorageWrapper.sol
   # Result: 0 matches
   ```

2. **ScheduledCouponListingFacet.sol**

   ```bash
   # Check facet implementation
   grep -n "msg.sender" contracts/facets/layer_1/scheduledTasks/ScheduledCouponListingFacet.sol
   ```

3. **ProceedRecipientsFacet.sol**
   ```bash
   # Check proceed recipients implementation
   grep -n "msg.sender" contracts/facets/layer_1/proceedRecipients/
   ```

### Related Files

4. **BondStorageWrapper.sol** - Coupon scheduling logic
5. **EquityStorageWrapper.sol** - Dividend scheduling logic
6. **CorporateActionsFacet.sol** - Task triggering

---

## Investigation Steps

### Step 1: Verify Migration Completeness

```bash
# Check if any facets still use msg.sender
grep -r "msg\.sender" contracts/facets/layer_1/scheduledTasks/ --include="*.sol"
grep -r "msg\.sender" contracts/facets/layer_1/proceedRecipients/ --include="*.sol"
```

### Step 2: Review Task Creation Logic

Look for task creation functions in `ScheduledTasksStorageWrapper.sol`:

- `createTask()`
- `scheduleTask()`
- `registerTask()`
- Any function that adds to task arrays/mappings

**Key Question**: Does task ID generation or storage mapping use the sender address?

### Step 3: Check Task Retrieval Logic

Look for task query functions:

- `getScheduledCouponListing()`
- `scheduledCouponListingCount()`
- `getTasksByOwner()`

**Key Question**: Are tasks filtered by sender? If so, is it using the correct sender?

### Step 4: Review Event Emissions

Check if events are emitted with the correct sender:

```solidity
// Before migration
emit TaskScheduled(msg.sender, taskId, ...);

// After migration (should be)
emit TaskScheduled(EvmAccessors.getMsgSender(), taskId, ...);
```

---

## Debugging Commands

### Run Scheduled Tasks Tests Only

```bash
# Run all scheduled tasks tests
rtk npm run test -- --grep "ScheduledCouponListing"

# Run proceed recipients tests
rtk npm run test -- --grep "Proceed Recipients"

# Run both
rtk npm run test -- --grep "ScheduledCouponListing|Proceed Recipients"
```

### Check Test Setup

Review test file to understand expected behavior:

```bash
# View test setup
cat test/contracts/integration/layer_1/scheduledTasks/scheduledCouponListing/scheduledCouponListing.test.ts | head -100

# Check how tasks are created in tests
grep -A 10 "scheduleCoupon\|addProceedRecipient" test/contracts/integration/layer_1/scheduledTasks/scheduledCouponListing/scheduledCouponListing.test.ts
```

---

## Potential Issues & Fixes

### Issue 1: Task Storage Mapping Uses Sender as Key

**Symptom**: Tasks created but not retrievable

**Possible Code**:

```solidity
// Storage mapping
mapping(address => Task[]) private tasksByOwner;

// Creation (now uses EvmAccessors.getMsgSender())
tasksByOwner[EvmAccessors.getMsgSender()].push(task);

// Retrieval (might still use msg.sender?)
return tasksByOwner[msg.sender];
```

**Fix**: Ensure retrieval also uses `EvmAccessors.getMsgSender()`

### Issue 2: Task Count Calculation

**Symptom**: Count returns 0

**Possible Code**:

```solidity
function scheduledCouponListingCount() external view returns (uint256) {
  // If this uses msg.sender instead of EvmAccessors.getMsgSender()
  return scheduledTasks[msg.sender].length;
}
```

**Fix**: Update to use `EvmAccessors.getMsgSender()`

### Issue 3: Task Triggering Logic

**Symptom**: Only 1 task triggered instead of 2

**Possible Code**:

```solidity
// When adding proceed recipient, should trigger 2 tasks
function addProceedRecipient(...) external {
    // Task 1: Update recipient list
    scheduleTask(TaskType.UpdateRecipients, ...);

    // Task 2: Recalculate distributions (might not be triggered)
    scheduleTask(TaskType.RecalculateDistributions, ...);
}
```

**Fix**: Verify both tasks are created with correct sender

---

## Expected Behavior (from Tests)

### ScheduledCouponListing Test Flow

```typescript
// Test setup creates 5 scheduled coupons
await bond.scheduleCoupon(coupon1);
await bond.scheduleCoupon(coupon2);
await bond.scheduleCoupon(coupon3);
await bond.scheduleCoupon(coupon4);
await bond.scheduleCoupon(coupon5);

// Expected: scheduledCouponListingCount() returns 5
// Actual: returns 0 ❌

// Expected: getScheduledCouponListing(0, 10) returns all 5
// Actual: returns empty array ❌
```

### Proceed Recipients Test Flow

```typescript
// Test adds a proceed recipient
await bond.addProceedRecipient(recipient);

// Expected: 2 pending tasks triggered
// 1. Update recipient list
// 2. Recalculate distributions
// Actual: Only 1 task triggered ❌
```

---

## Comparison with Main Branch

To identify if this is a regression:

```bash
# Checkout main branch
git stash
git checkout main

# Run same tests
rtk npm run test -- --grep "ScheduledCouponListing|Proceed Recipients"

# Compare results
# If main branch passes → regression from EvmAccessors migration
# If main branch fails → pre-existing issue
```

---

## Success Criteria

✅ All ScheduledCouponListing tests pass (6 tests)  
✅ All Proceed Recipients tests pass (2 tests)  
✅ Task counts return expected values  
✅ Task retrieval returns correct tasks  
✅ Task triggering creates all expected tasks

---

## Estimated Effort

**Investigation**: 1-2 hours  
**Fix Implementation**: 1-2 hours  
**Testing & Verification**: 1 hour  
**Total**: 3-5 hours

---

## Notes for Implementation

1. **Don't modify EvmAccessors pattern** - it's correct and working in other wrappers
2. **Focus on task registration/retrieval logic** - likely the issue is in how tasks are stored/queried
3. **Check test expectations** - ensure tests are looking for tasks in the right place
4. **Verify event emissions** - events should use `EvmAccessors.getMsgSender()`

---

## Contact

If you find the root cause or need help, ping me. I'm working on the Lock system issues in parallel.

**Related Document**: `TEST_SUMMARY.md` - Full test analysis  
**Migration Context**: All `msg.sender` → `EvmAccessors.getMsgSender()` across 15 storage wrappers

Good luck! 🚀
