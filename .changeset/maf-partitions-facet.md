---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `partitionsOf` and `isMultiPartition` into a dedicated `PartitionsFacet`, and remove the now-empty `ERC1410ReadFacet` (its other selectors were migrated by earlier facet splits). The `IERC1410` umbrella interface is dropped in favour of `IPartitions`, `IERC1410Management`, and `ITransferByPartition`.

Non-breaking: every selector previously routed through `ERC1410ReadFacet` is preserved on its new facet, so calls through `IAsset` continue to work without modification.
