---
"@hashgraph/asset-tokenization-contracts": major
---

Remove the `SecurityType` enum and the stored `securityType` metadata; `ERC20Metadata` is now the flat `{ name, symbol, decimals }` struct consumed directly by `initializeCore` and `getERC20Metadata`.
