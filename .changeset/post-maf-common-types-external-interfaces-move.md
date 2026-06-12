---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate the shared ERC-1410/ERC-3643 type files (`IERC1410Types`, `IERC3643Types`) to `facets/commonTypes/` and the external adapter interfaces (`ICompliance`, `IIdentityRegistry`) into the respective facets' `externalInterfaces/` directories, as part of the POST-MAF layer-flattening, updating import paths in all callers. No ABI, selector, or storage-layout change.
