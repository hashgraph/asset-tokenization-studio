---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate `ERC20Permit` facet out of `layer_1/ERC1400/` nesting into `facets/erc20Permit/` as part of the POST-MAF layer-flattening effort.

What changes:

- `facets/layer_1/ERC1400/ERC20Permit/` moved to `facets/erc20Permit/`. Directory name follows the existing `eip712/` lowercase-camelCase convention.
- Import paths updated in all callers: `IAsset.sol`, `ERC20PermitStorageWrapper.sol`, `Factory.sol`.
- `ERC20PermitFacetTimeTravel` removed — the asset time-travel contract already covers this facet; the dedicated wrapper was redundant.

No ABI, selector, or storage layout changes.
