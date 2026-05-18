---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-127: add missing `onlyUnrecoveredAddress` guards to prevent recovered wallets from calling issue/mint operations and from being targeted by release/hold creation. Added `onlyUnrecoveredAddress(getMsgSender())` to `Mint.issue`, `Mint.mint`, and `BatchMint.batchMint` to block recovered callers; added `onlyUnrecoveredAddress(_tokenHolder)` to `Lock.release` and `LockByPartition.releaseByPartition` to prevent releasing locks back to dead wallets; added `onlyUnrecoveredAddress(_from)` to `ControllerHoldByPartition.controllerCreateHoldByPartition` to block holds on recovered token holders.
