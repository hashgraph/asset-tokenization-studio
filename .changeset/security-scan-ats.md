---
"@hashgraph/asset-tokenization-contracts": patch
"@hashgraph/asset-tokenization-sdk": patch
"@hashgraph/asset-tokenization-dapp": patch
---

Security scan fixes. The BusinessLogicResolver proxy is now initialized in its deployment transaction, so `initializeBusinessLogicResolver` can no longer be front-run. Adding or removing blacklisted selectors emits `BlacklistSelectorsAdded` / `BlacklistSelectorsRemoved`. Deployment scripts report facet-lookup, Hardhat-detection and baseline-file failures instead of swallowing them. The SDK no longer logs custodial credentials, RPC API keys, full mirror node URLs or WalletConnect signatures. The web app's dev server only accepts localhost origins, and raw SDK errors are no longer shown to users.
