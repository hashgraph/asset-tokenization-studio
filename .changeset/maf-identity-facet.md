---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `setIdentityRegistry`, `setOnchainID`, `identityRegistry`, and `onchainID` from the ERC3643 facets into a dedicated `IdentityFacet`; `IAsset` now inherits `IIdentity`.

Non-breaking: the 4-byte selectors of all four functions are unchanged, so calls through `IAsset` continue to work without modification.
