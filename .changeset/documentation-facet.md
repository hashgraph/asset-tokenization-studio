---
"@hashgraph/asset-tokenization-contracts": minor
"@hashgraph/asset-tokenization-sdk": patch
---

- Add `DocumentationFacet` with `setDocument`, `removeDocument`, `getDocument` and `getAllDocuments`, registering document-management selectors under the new `_DOCUMENTATION_RESOLVER_KEY`.
- Remove `ERC1643Facet`, `ERC1643`, `IERC1643`, `ERC1643FacetTimeTravel`, `_ERC1643_RESOLVER_KEY` and `_ERC1643_STORAGE_POSITION`.
- `IAsset` updated to inherit `IDocumentation` instead of `IERC1643`; selectors and ABI are unchanged.
- SDK adapters (`RPCQueryAdapter`, `RPCTransactionAdapter`, `SecurityMetadataOperations`) updated to connect via `IAsset__factory` instead of `ERC1643Facet__factory`.
