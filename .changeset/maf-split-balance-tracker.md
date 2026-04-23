---
"@hashgraph/asset-tokenization-contracts": minor
"@hashgraph/asset-tokenization-sdk": patch
---

- Add `BalanceTrackerFacet` with `balanceOf` and `totalSupply` methods, consolidating balance-read logic into a dedicated facet with `_BALANCE_TRACKER_RESOLVER_KEY`.
- Remove `balanceOf` and `totalSupply` from `ERC1410ReadFacet`.
- SDK `RPCQueryAdapter` updated to call `balanceOf` and `totalSupply` via `IAsset`.
