---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-022: reject `address(0)` in `SsiManagementStorageWrapper.addIssuer`.

`addIssuer` in `SsiManagementStorageWrapper` delegated directly to `EnumerableSet.add` without any zero-address check, allowing `address(0)` to be registered as a trusted credential issuer. A listed zero address would permanently pollute the issuer list and could interfere with any SSI validation logic that iterates or looks up issuers.

The fix adds an explicit `address(0)` guard at the top of `addIssuer`, reverting eagerly with `ICommonErrors.ZeroAddressNotAllowed()` before the set mutation. The check is placed at the storage-wrapper layer (layer_0) so it is enforced regardless of the call path.
