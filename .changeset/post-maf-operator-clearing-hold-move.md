---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate `OperatorClearingHoldByPartition` facet and shared type interfaces out of `layer_1/` nesting into top-level `facets/` subdirectories as part of the POST-MAF layer-flattening effort.

What changes:

- `facets/layer_1/clearing/operatorClearingHoldByPartition/` moved to `facets/operatorClearingHoldByPartition/`.
- `facets/layer_1/clearing/IClearingTypes.sol` moved to `facets/clearing/IClearingTypes.sol`.
- `facets/layer_1/hold/IHoldTypes.sol` moved to `facets/hold/IHoldTypes.sol`.
- Import paths updated in all callers: `IOperatorClearingByPartition.sol`, `IOperatorHoldByPartition.sol`, `OperatorHoldByPartition.sol`, `OperatorClearingHoldByPartition.sol`, `OperatorClearingHoldByPartitionFacet.sol`.

No ABI, selector, or storage layout changes.
