---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate external-adapter interfaces out of `layer_1/` nesting into top-level `facets/` subdirectories as part of the POST-MAF layer-flattening effort.

What changes:

- `facets/layer_1/externalControlList/IExternalControlList.sol` moved to `facets/externalControlListManagement/`
- `facets/layer_1/externalKycList/IExternalKycList.sol` moved to `facets/externalKycListManagement/`
- `facets/layer_1/externalPause/IExternalPause.sol` moved to `facets/externalPauseManagement/`
- Import paths updated in all callers: `ExternalListManagementStorageWrapper.sol`, `PauseStorageWrapper.sol`, `IAsset.sol`, `MockedExternalBlacklist.sol`, `MockedExternalKycList.sol`, `MockedExternalPause.sol`, `MockedExternalWhitelist.sol`

No ABI, selector, or storage layout changes.
