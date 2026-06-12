---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `setMaxSupplyByPartition` and `getMaxSupplyByPartition` from `CapFacet` into a dedicated `CapByPartitionFacet`. Partition cap events and errors stay on `ICap` because the mint/burn paths still raise them.

Non-breaking: the 4-byte selectors of both methods are unchanged, so calls through `IAsset` continue to work without modification.
