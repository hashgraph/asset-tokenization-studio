---
"@hashgraph/asset-tokenization-contracts": major
---

Extract `protectedClearingCreateHoldByPartition` from `ClearingHoldCreation` into a new `ProtectedClearingHoldByPartitionFacet` (BBND-1631). The source `ClearingHoldCreation` MAF is fully drained as part of this split: its facet/interface/abstract files are deleted, its resolver key (`_CLEARING_HOLDCREATION_RESOLVER_KEY`) is removed, the orphaned TimeTravel mirror is deleted, and all consumers (`IAsset`, seven `createConfiguration.ts` files, `orchestratorLibraries.ts`, two doc-comments in `clearingHoldByPartition/`) are repointed to the new facet. Resolver key `_PROTECTED_CLEARING_HOLD_BY_PARTITION_RESOLVER_KEY` derived deterministically from `keccak256("security.token.standard.protectedClearingHoldByPartition.resolverKey")`.
