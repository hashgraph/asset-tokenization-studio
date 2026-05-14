---
"@hashgraph/asset-tokenization-contracts": minor
"@hashgraph/asset-tokenization-sdk": patch
---

Introduce ScheduledTasksOps, a new external orchestrator library following the same pattern as HoldOps and TokenCoreOps. Nine production callers (KpiLinkedRate, ProceedRecipients facets, ERC1410StorageWrapper, ERC20VotesStorageWrapper, NominalValueStorageWrapper) now DELEGATECALL into the standalone library instead of the legacy self-CALL helper, saving roughly 2000 gas per invocation. Removes callTriggerPendingScheduledCrossOrderedTasks from ScheduledTasksStorageWrapper.
