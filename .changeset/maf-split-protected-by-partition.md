---
"@hashgraph/asset-tokenization-contracts": major
---

Extract `protectedRedeemFromByPartition` and `protectedTransferFromByPartition` from `ERC1410Management` into a new `ProtectedByPartitionFacet` (BBND-1629). Pure capability split — no behaviour change. The new facet is wired into all seven asset archetypes that already include `ERC1410ManagementFacet`. Resolver key `_PROTECTED_BY_PARTITION_RESOLVER_KEY` derived deterministically from `keccak256("security.token.standard.protectedByPartition.resolverKey")`.
