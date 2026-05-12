---
"@hashgraph/asset-tokenization-contracts": minor
---

Migrate 94 facets to Bytes4Builder pattern, eliminating manual bytes4[] array construction

Extended `Bytes4Builder` library with overloads 7–12 (stack-safe without `viaIR`, capped at
12 parameters). Migrated 94 `*Facet.sol` contracts from repetitive manual `bytes4[]`
construction to `Bytes4Builder.build(...)`, reducing boilerplate and improving consistency.

Two facets remain with the manual pattern due to Solidity stack limits without `viaIR`:
`LoansPortfolioFacet` (20 selectors) and `AmortizationFacetBase` (15 selectors).
