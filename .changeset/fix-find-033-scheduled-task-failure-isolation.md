---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-033: isolate scheduled task failures to prevent DoS on the task queue.

Previously, a single failing scheduled task would revert the entire `triggerScheduledTasks` call, permanently blocking all subsequent tasks in the queue.

The fix extracts all dispatch logic into a new external library `ScheduledTasksDispatchOps`, which handles the four task types (snapshot, coupon listing, balance adjustment, cross-ordered). `ScheduledTasksStorageWrapper.triggerScheduledTasks` calls `ScheduledTasksDispatchOps.execute()` inside a `try/catch`; a task failure is contained, the corporate action is cancelled, and a `TaskExecutionFailed` event is emitted so the queue continues processing the remaining tasks. The `ScheduledTasksDataStorage` slot is only ever manipulated through `ScheduledTasksStorageWrapper` — `ScheduledTasksDispatchOps` has no direct slot access, preserving the storage-ownership boundary.
