---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-033: isolate scheduled task failures to prevent DoS on the task queue.

Previously, a single failing scheduled task would revert the entire `triggerPendingScheduledTasks` call, permanently blocking all subsequent tasks in the queue. The fix wraps each task dispatch in a `try/catch` via an external call to `executeScheduledTaskCallback`. On failure, the corporate action (if any) is cancelled and a `TaskExecutionFailed` event is emitted, allowing the queue to continue processing the remaining tasks.
