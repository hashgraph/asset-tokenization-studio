---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract the per-partition operator functions (`authorizeOperatorByPartition`, `revokeOperatorByPartition`, `isOperatorForPartition`, `operatorTransferByPartition`, `operatorRedeemByPartition`) from the ERC1410 facets into a dedicated `OperatorByPartitionFacet`; `IERC1410` now inherits `IOperatorByPartition`.

Non-breaking: the 4-byte selectors of all five functions are unchanged, so calls through `IAsset` or `IERC1410` continue to work without modification.
