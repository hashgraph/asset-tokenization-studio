---
"@hashgraph/asset-tokenization-sdk": patch
"@hashgraph/asset-tokenization-dapp": patch
---

Fix HederaWalletConnect reconnection and disconnect flow. Upgrades `@reown/appkit` from 1.8.10 to 1.8.19 (fixing modal SVG rendering and the `adapterType` undefined crash on reconnect), adds a short wait after AppKit creation so its background `initialize()` completes before the pairing modal opens, and wraps `createAppKit` in a try/catch that clears adapter singletons on failure so the next connect retries cleanly. The Header disconnect button now calls `SDKService.disconnectWallet()` instead of `reset() + reload()`, terminating the WalletConnect session cleanly and letting the router handle navigation.
