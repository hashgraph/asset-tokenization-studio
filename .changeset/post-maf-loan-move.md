---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate `Loan` facet out of `layer_2/` nesting into `facets/loan/` as part of the POST-MAF layer-flattening effort.

What changes:

- `facets/layer_2/loan/ILoan.sol` moved to `facets/loan/`
- `facets/layer_2/loan/Loan.sol` moved to `facets/loan/`
- `facets/layer_2/loan/LoanFacet.sol` moved to `facets/loan/`
- Import paths updated in all callers: `LoanStorageWrapper.sol`, `LoansPortfolioStorageWrapper.sol`

No ABI, selector, or storage layout changes.
