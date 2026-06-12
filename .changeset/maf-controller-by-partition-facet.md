---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `controllerTransferByPartition` and `controllerRedeemByPartition` from `ERC1410ManagementFacet` into a dedicated `ControllerByPartitionFacet`; `IAsset` exposes them via `IControllerByPartition`.

Non-breaking: the 4-byte selectors of both functions are unchanged, so calls through `IAsset` continue to work without modification.
