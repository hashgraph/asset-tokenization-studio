---
"@hashgraph/asset-tokenization-contracts": major
---

Extract `protectedClearingRedeemByPartition` (from `ClearingRedeem`) and `protectedClearingTransferByPartition` (from `ClearingTransfer`) into a new `ProtectedClearingByPartitionFacet` (BBND-1630). Pure capability split — no behaviour change. The new facet is wired into all seven asset archetypes that include both source clearing facets. Resolver key `_PROTECTED_CLEARING_BY_PARTITION_RESOLVER_KEY` derived deterministically from `keccak256("security.token.standard.protectedClearingByPartition.resolverKey")`.
