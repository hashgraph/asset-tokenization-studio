---
"@hashgraph/asset-tokenization-contracts": major
---

Migrate `DividendFacet` from `contracts/facets/layer_2/dividend/` to the canonical flat
location `contracts/facets/dividend/` and collapse the legacy 3-tier scaffold (`Dividend` →
`DividendFacetBase` → `DividendFacet`) into the modern 2-tier shape (`Dividend` abstract +
`DividendFacet` concrete) used by every post-split MAF facet. Resolver key
(`_DIVIDEND_RESOLVER_KEY`), selector set, ABI, and runtime behaviour are unchanged. Removes
the dead `DividendFacetTimeTravel` mirror. Aligns Dividend with the post-MAF-split layout
established by BBND-1605.
