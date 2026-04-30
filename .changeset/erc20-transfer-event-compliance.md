---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix ERC-20 Transfer event compliance on partition-based balance movements.

ERC1410StorageWrapper was emitting TransferByPartition without the mandatory ERC-20 Transfer event, breaking off-chain indexer traceability. Adds the missing emit and regression tests across batchBurn, batchMint, batchTransfer, batchForcedTransfer, batchFreeze, and batchUnfreeze.

Also removes duplicate Transfer event emissions from BatchBurn, Burn, BatchMint, and Mint facets, which were re-emitting an event already fired internally by TokenCoreOps.
