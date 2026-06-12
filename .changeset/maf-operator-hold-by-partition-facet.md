---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `operatorCreateHoldByPartition` from `HoldManagementFacet` into a dedicated `OperatorHoldByPartitionFacet`; the now-empty `HoldManagementFacet` is removed and `IAsset` inherits `IOperatorHoldByPartition`.

Non-breaking: the 4-byte selector is unchanged, so calls through `IAsset` continue to work without modification.
