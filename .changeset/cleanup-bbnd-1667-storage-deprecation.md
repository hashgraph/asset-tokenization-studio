---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/asset-tokenization-sdk": patch
---

Retire four classes of deprecated storage from the contracts package: the orphaned ERC20Permit storage slot and its struct; the bond/equity nominal-value migration shim and its test facet; the ERC1410-to-ERC20 totalSupply/balances migration shim and its test facet; and the trailing deprecated name/version/nonces fields on ProtectedPartitions and ERC20Votes. Re-slots BondDataStorage, EquityDataStorage, ERC1410BasicStorage, and ERC20VotesStorage — greenfield deployment required. Tier 4 (callTriggerPendingScheduledCrossOrderedTasks removal) was attempted and deferred in the same session because the replacement inlined a task-loop body into every caller, pushing HoldOps over the EIP-170 24 KB deployable-bytecode limit. Re-attempt requires converting ScheduledTasksStorageWrapper.triggerScheduledTasks to an external linked library.
