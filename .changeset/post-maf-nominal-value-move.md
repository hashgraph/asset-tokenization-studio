---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate `NominalValue` facet out of `layer_2/` nesting into `facets/nominalValue/` as part of the POST-MAF layer-flattening effort.

What changes:

- `facets/layer_2/nominalValue/INominalValue.sol` moved to `facets/nominalValue/`
- `facets/layer_2/nominalValue/NominalValue.sol` moved to `facets/nominalValue/`
- `facets/layer_2/nominalValue/NominalValueFacet.sol` moved to `facets/nominalValue/`
- Import paths updated in all callers: `Factory.sol`, `IAsset.sol`

No ABI, selector, or storage layout changes.
