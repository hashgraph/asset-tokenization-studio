---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-120: holder incorrectly removed from registry when burning or transferring all free tokens while encumbered tokens (locked/held/cleared/frozen) remain. Replace `_balanceOfAdjustedAt` with `_getTotalBalanceForAdjustedAt` in `ERC1410StorageWrapper.beforeTokenTransfer` for both burn and transfer paths. Update `deployOrchestratorLibraries` deployment order so `ClearingReadOps` is deployed before `TokenCoreOps`, which now depends on it transitively.
