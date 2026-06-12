---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-047: remove the stale, unused `pos` and `scheduledTasksLength` parameters from `ScheduledTasksDispatchOps.execute()`. Both were captured before the processing loop and passed stale to each callback — `scheduledTasksLength` reflected the pre-execution count rather than the live count after each `popScheduledTask`, and `pos` the pre-pop index — yet all three handlers and the `crossOrdered` branch ignored them, making them dead code and a correctness hazard. They are removed from `execute()` and its private handlers, with both call sites in `ScheduledTasksStorageWrapper` cleaned up and a regression test added.
