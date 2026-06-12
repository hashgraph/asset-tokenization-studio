---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `DOMAIN_SEPARATOR` from `ERC20PermitFacet` into a dedicated `EIP712Facet`; `IAsset` now inherits `IEIP712`.

Non-breaking: the 4-byte selector is unchanged, so calls through `IAsset` continue to work without modification.
