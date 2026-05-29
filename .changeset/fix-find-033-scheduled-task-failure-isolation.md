---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-033: remove try/catch from scheduled task dispatch so failures revert the queue.

Previously, `triggerScheduledTasks` wrapped each `ScheduledTasksDispatchOps.execute` call in a `try/catch`: a failing task silently cancelled the corporate action, emitted `TaskExecutionFailed`, and let the queue continue. This masked errors and allowed bad state to accumulate.

The fix removes the `try/catch` entirely. A failing dispatch now reverts the entire `triggerScheduledTasks` call, leaving the queue intact at the failing task. The queue remains blocked until an authorised caller uses one of the force-cancel methods introduced in the same fix (see `feat-find-033-force-cancel-corporate-actions`) to remove the stuck action and let processing resume.

The `TaskExecutionFailed` event has been removed from `IScheduledCrossOrderedTasks` as it is no longer emitted. The dead-code helpers `_onTaskExecutionFailed`, `_cancelPendingSubTaskAction`, `_cancelTopQueueAction`, and `_getActionIdFromScheduledTask` have also been removed from `ScheduledTasksStorageWrapper`.
