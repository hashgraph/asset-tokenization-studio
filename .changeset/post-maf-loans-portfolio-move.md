---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate `LoansPortfolio` facet out of `layer_2/` nesting into `facets/loansPortfolio/` as part of the POST-MAF layer-flattening effort.

What changes:

- `facets/layer_2/loansPortfolio/ILoansPortfolio.sol` moved to `facets/loansPortfolio/`
- `facets/layer_2/loansPortfolio/LoansPortfolio.sol` moved to `facets/loansPortfolio/`
- `facets/layer_2/loansPortfolio/LoansPortfolioFacet.sol` moved to `facets/loansPortfolio/`
- Import paths updated in all callers: `LoansPortfolioStorageWrapper.sol`, `LoansPortfolioModifiers.sol`

No ABI, selector, or storage layout changes.
