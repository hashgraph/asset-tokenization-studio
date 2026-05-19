---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-128: guard `controllerCreateHoldByPartition` against active clearing.

Added the `onlyClearingDisabled` modifier to `ControllerHoldByPartition.controllerCreateHoldByPartition`. Without it, a controller could place a hold on a partition that is currently under a clearing workflow, potentially conflicting with in-flight clearing operations and leaving the asset in an inconsistent state.
