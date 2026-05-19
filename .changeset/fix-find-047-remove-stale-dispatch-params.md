---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-047: remove stale and unused `pos` and `scheduledTasksLength` parameters from `ScheduledTasksDispatchOps.execute()`.

Both parameters were captured before the processing loop and passed stale to each callback invocation — `scheduledTasksLength` reflected the pre-execution queue count rather than the live count after each `popScheduledTask`, and `pos` was the pre-pop index. All three handlers (`snapshot`, `coupon`, `balance`) and the `crossOrdered` branch ignored both parameters entirely, making them dead code and a future correctness hazard.

The fix removes `pos` and `scheduledTasksLength` from `execute()` and its three private handlers, and cleans up both call sites in `ScheduledTasksStorageWrapper` (`triggerScheduledTasks` and `_triggerOneSubTask`). A regression test covering three due tasks processed in a single call is added to `scheduledTasks.test.ts`.
