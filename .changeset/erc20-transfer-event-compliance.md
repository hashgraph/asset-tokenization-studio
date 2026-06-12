---
"@hashgraph/asset-tokenization-contracts": minor
---

Fix ERC-20 `Transfer` event compliance and centralise balance-mutation logic. `ERC1410StorageWrapper` now emits the mandatory ERC-20 `Transfer` on partition operations (previously only `TransferByPartition` fired), and the duplicate `Transfer` emissions in the mint/burn facets and `ERC20StorageWrapper` are removed so every operation logs exactly one `Transfer`. A new `ERC20StorageWrapper.performTransfer` becomes the single internal entry point for balance accounting and event emission, with all call sites routed through it; dead passthrough helpers are dropped and direct `msg.sender` uses in several facets move to `EvmAccessors.getMsgSender()`. Adds regression tests asserting one `Transfer` per operation across batch and partition paths.
