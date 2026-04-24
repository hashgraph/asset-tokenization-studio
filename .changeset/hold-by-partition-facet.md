---
"@hashgraph/asset-tokenization-contracts": major
---

Introduce `HoldByPartitionFacet` by merging the former `HoldTokenHolderFacet` (write operations: `createHoldByPartition`, `createHoldFromByPartition`, `executeHoldByPartition`, `releaseHoldByPartition`, `reclaimHoldByPartition`) with the partition-scoped read operations previously in `HoldReadFacet` (`getHeldAmountForByPartition`, `getHoldCountForByPartition`, `getHoldsIdForByPartition`, `getHoldForByPartition`) into a single facet registered under `_HOLD_BY_PARTITION_RESOLVER_KEY`. The old `HoldTokenHolderFacet` and `IHoldTokenHolder` are removed. `IHold` and all token configurations now reference `IHoldByPartition`. SDK adapters updated to use `IAsset__factory` for the affected hold operations.
