---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate `Kyc` facet out of `layer_1/` nesting into `facets/kyc/` as part of the POST-MAF layer-flattening effort.

What changes:

- `facets/layer_1/kyc/` moved to `facets/kyc/`. Directory name follows the existing lowercase-camelCase convention.
- Import paths updated in all callers: `IAsset.sol`, `Factory.sol`, `KycStorageWrapper.sol`, `ExternalListManagementStorageWrapper.sol`, `ERC1594StorageWrapper.sol`, `KycModifiers.sol`, `ExternalKycListManagement.sol`, `IExternalKycListManagement.sol`, `IExternalKycList.sol`, `Maturity.sol`, `MaturityByPartition.sol`, `MockedExternalKycList.sol`.
- `KycFacetTimeTravel` removed — the asset time-travel contract already covers this facet; the dedicated wrapper was redundant.

No ABI, selector, or storage layout changes.
