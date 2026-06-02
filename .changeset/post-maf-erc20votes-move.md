---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate `ERC20Votes` facet out of `layer_1/ERC1400/` nesting into `facets/erc20Votes/` as part of the POST-MAF layer-flattening effort.

What changes:

- `facets/layer_1/ERC1400/ERC20Votes/` moved to `facets/erc20Votes/`. Directory name follows the existing `eip712/` lowercase-camelCase convention.
- Import paths updated in all callers: `IAsset.sol`, `ERC20VotesStorageWrapper.sol`, `Factory.sol`.
- `ERC20VotesFacetTimeTravel` removed — the asset time-travel contract already covers this facet; the dedicated wrapper was redundant.

No ABI, selector, or storage layout changes.
