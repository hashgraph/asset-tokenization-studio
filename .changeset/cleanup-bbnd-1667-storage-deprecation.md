---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/asset-tokenization-sdk": patch
---

Retire four classes of deprecated storage from the contracts package and ship the long-term resolution of the deferred Tier 4 cleanup.

Storage retirements: the orphaned ERC20Permit storage slot and its struct; the bond/equity nominal-value migration shim and its test facet; the ERC1410-to-ERC20 totalSupply/balances migration shim and its test facet; and the trailing deprecated name/version/nonces fields on ProtectedPartitions and ERC20Votes. Re-slots BondDataStorage, EquityDataStorage, ERC1410BasicStorage, and ERC20VotesStorage — greenfield deployment required.

ScheduledTasksOps orchestrator: new external library following the same pattern as HoldOps and TokenCoreOps. Nine production callers (KpiLinkedRate, ProceedRecipients facets, ERC1410StorageWrapper, ERC20VotesStorageWrapper, NominalValueStorageWrapper) now DELEGATECALL into the standalone library instead of the legacy self-CALL helper, saving roughly 2000 gas per invocation. Removes callTriggerPendingScheduledCrossOrderedTasks from ScheduledTasksStorageWrapper. Pause-guard preserved at the orchestrator boundary so Burn / Transfer / ERC1594 / BurnByPartition facets keep their cascading IsPaused revert semantics.
