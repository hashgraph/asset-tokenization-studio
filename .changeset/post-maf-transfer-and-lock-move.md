---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate the `TransferAndLock` facet out of `layer_3/` into `facets/transferAndLock/` as part of the POST-MAF layer-flattening, updating import paths in all callers and internal files, and remove the redundant `TransferAndLock*FacetTimeTravel` wrappers (the asset time-travel contract already covers these facets). No ABI, selector, or storage-layout change.
