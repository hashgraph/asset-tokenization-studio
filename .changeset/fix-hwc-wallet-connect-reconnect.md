---
"@hashgraph/asset-tokenization-sdk": patch
"@hashgraph/asset-tokenization-dapp": patch
---

Fix HederaWalletConnect reconnection and disconnect flow

- Upgrade `@reown/appkit` (and related packages) from 1.8.10 to 1.8.19 to resolve SVG rendering errors in the modal and the `adapterType` undefined crash when creating AppKit after a disconnect
- Add a 500 ms wait after AppKit is first created so that its background `initialize()` task (which calls `unSyncExistingConnection → ModalController.close`) completes before the pairing modal is opened — this prevents the modal from being immediately closed on the first connect attempt
- Wrap `createAppKit` in a try/catch that clears all adapter singletons on failure so that a subsequent connect attempt retries from a clean state instead of hitting `NotInitialized`
- Replace the inline `reset() + window.location.reload()` in the Header disconnect button with a proper call to `SDKService.disconnectWallet()` (via `useSDKDisconnectFromMetamask`) so the WalletConnect session is cleanly terminated and navigation back to the landing page is handled by the router, without a full page reload
- Remove leftover debug `console.log` from the `walletDisconnect` event handler
