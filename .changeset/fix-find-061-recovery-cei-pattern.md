---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: `recoveryAddress` now follows the Checks-Effects-Interactions pattern to prevent re-entrancy.

Previously, `recoveryAddress` in `ERC3643StorageWrapper` set the `addressRecovered` state flags **after** calling `ERC20StorageWrapper.transfer`, which triggers the external `compliance.transferred()` callback. A malicious compliance module could re-enter `recoveryAddress` during that callback while `addressRecovered[_lostWallet]` was still `false`, bypassing `onlyUnrecoveredAddress` and initiating a second recovery of the same lost wallet.

The fix moves the `addressRecovered` assignments to before the transfer call, so any re-entrant attempt immediately reverts.
