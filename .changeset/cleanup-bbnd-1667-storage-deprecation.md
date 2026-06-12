---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/asset-tokenization-sdk": patch
---

Retire four classes of deprecated storage from the contracts package and ship the deferred Tier 4 cleanup. Removes the orphaned ERC20Permit slot, the bond/equity nominal-value and ERC1410→ERC20 migration shims (and their test facets), and the trailing deprecated name/version/nonces fields on ProtectedPartitions and ERC20Votes; this re-slots `BondDataStorage`, `EquityDataStorage`, `ERC1410BasicStorage`, and `ERC20VotesStorage`. Also adds a `ScheduledTasksOps` external orchestrator library (matching `HoldOps`/`TokenCoreOps`) that nine production callers now DELEGATECALL instead of the legacy self-CALL helper, saving ~2000 gas per invocation while preserving the pause-guard revert semantics.

Breaking: the storage re-slotting requires a greenfield deployment.
