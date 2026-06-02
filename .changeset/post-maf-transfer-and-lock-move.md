---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate `TransferAndLock` facet out of `layer_3/` nesting into `facets/transferAndLock/` as part of the POST-MAF layer-flattening effort.

What changes:

- `facets/layer_3/transferAndLock/` moved to `facets/transferAndLock/`. Directory name follows the existing lowercase-camelCase convention.
- Import paths updated in all callers: `IAsset.sol`, `Factory.sol`, `ITransferAndLockByPartition.sol`.
- Internal imports updated inside the moved files (`TransferAndLock.sol`, `TransferAndLockFacetBase.sol`, and the three variant facets).
- `TransferAndLockFacetTimeTravel`, `TransferAndLockFixedRateFacetTimeTravel`, and `TransferAndLockKpiLinkedRateFacetTimeTravel` removed — the asset time-travel contract already covers these facets; the dedicated wrappers were redundant.

No ABI, selector, or storage layout changes.
