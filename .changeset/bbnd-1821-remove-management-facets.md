---
"@hashgraph/asset-tokenization-contracts": major
---

Remove `ERC1410ManagementFacet` and `ERC3643ManagementFacet` (BBND-1821), which existed only to host single-shot initialisers now redundant under the centralised initializer system. Their initialisers fold into the natural owner facets: `PartitionsFacet.initializePartitions` takes the `multiPartition` flag, and the ERC-3643 wiring splits into `ComplianceFacet.initializeCompliance` and `IdentityFacet.initializeIdentity`. One-shot semantics stay enforced by `onlyFacetNotRegistered`.

Breaking: deployments must be regenerated — the `RESOLVER_KEY_ERC1410_MANAGEMENT`/`RESOLVER_KEY_ERC3643_MANAGEMENT` facets, keys and interface ids are removed, `IERC3643`/`IAsset` no longer inherit the management interfaces, and the `initialize{Partitions,Compliance,Identity}` selectors change signature. No storage-layout change.
