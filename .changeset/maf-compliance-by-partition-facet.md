---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `canTransferByPartition` and `canRedeemByPartition` from `ERC1410ReadFacet` into a dedicated `ComplianceByPartitionFacet`; `IAsset` now also inherits `IComplianceByPartition`.

Non-breaking: the 4-byte selectors of both functions are unchanged, so calls through `IAsset` continue to work without modification.
