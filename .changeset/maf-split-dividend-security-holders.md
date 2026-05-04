---
"@hashgraph/asset-tokenization-contracts": major
---

Refactor `getDividendHolders` and `getTotalDividendHolders` out of `DividendFacet` into a new
`DividendSecurityHoldersFacet` (resolver key `_DIVIDEND_SECURITY_HOLDERS_RESOLVER_KEY`),
aggregated into `IAsset` via the new `IDividendSecurityHolders` interface. Introduces shared
`IDividendTypes` (structs only) for the dividend domain.
