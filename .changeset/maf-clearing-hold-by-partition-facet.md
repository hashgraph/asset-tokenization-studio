---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `clearingCreateHoldByPartition`, `clearingCreateHoldFromByPartition`, and `getClearingCreateHoldForByPartition` from `ClearingHoldCreationFacet` into a dedicated `ClearingHoldByPartitionFacet`; `ClearingHoldCreationFacet` retains only `protectedClearingCreateHoldByPartition`.

Non-breaking: the 4-byte selectors of the three moved functions are unchanged, so calls through `IAsset` continue to work without modification.
