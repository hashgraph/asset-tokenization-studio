---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate the `ProtectedPartitions` facet out of `layer_1/` into `facets/protectedPartition/` as part of the POST-MAF layer-flattening, updating import paths in all callers, and add the missing contract-, event-, error- and struct-level NatSpec across `IProtectedPartitions`, `ProtectedPartitions`, and `ProtectedPartitionsFacet`. No ABI, selector, or storage-layout change.
