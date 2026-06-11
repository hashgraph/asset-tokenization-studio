---
"@hashgraph/asset-tokenization-contracts": patch
---

Compose the per-domain deployment facet lists from shared, type-checked facet sets backed by a generated `FacetName` union, so unknown or mis-typed facet names become compile errors instead of runtime lookup misses. No on-chain, ABI, or configuration change — every deployment configuration resolves to the same facet set as before.
