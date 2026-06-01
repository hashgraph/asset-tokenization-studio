---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate `Lock` facet out of `layer_1/` nesting into `facets/lock/` as part of the POST-MAF layer-flattening effort.

What changes:

- `facets/layer_1/lock/` moved to `facets/lock/`. Directory name follows the existing lowercase-camelCase convention.
- Import paths updated in all callers: `IAsset.sol`, `Factory.sol`, `LockStorageWrapper.sol`, `ILockByPartition.sol`.
- `LockFacetTimeTravel` removed — the asset time-travel contract already covers this facet; the dedicated wrapper was redundant.

No ABI, selector, or storage layout changes.
