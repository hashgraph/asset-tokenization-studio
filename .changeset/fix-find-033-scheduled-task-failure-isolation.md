---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-033: remove the `try/catch` from scheduled-task dispatch so failures revert the queue. `triggerScheduledTasks` previously caught a failing `execute`, silently cancelling the corporate action, emitting `TaskExecutionFailed`, and continuing — masking errors and accumulating bad state. A failing dispatch now reverts the whole call, leaving the queue intact at the failing task until an authorised caller force-cancels the stuck action (see `feat-find-033-force-cancel-corporate-actions`). The `TaskExecutionFailed` event and the now-dead failure-handling helpers are removed.
