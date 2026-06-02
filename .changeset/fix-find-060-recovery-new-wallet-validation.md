---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: `recoveryAddress` now rejects a `_newWallet` that has already been used in a prior recovery.

Previously, `recoveryAddress` applied `onlyUnrecoveredAddress` only to `_lostWallet`, leaving `_newWallet` unchecked. An already-recovered address could therefore be supplied as the recovery target, silently overwriting its recovered state and producing inconsistent on-chain identity data.

The fix adds `onlyUnrecoveredAddress(_newWallet)` to `recoveryAddress` in `Recovery.sol`, enforcing that the destination wallet is a fresh address with no prior recovery record. Calls that supply an already-recovered `_newWallet` now revert immediately.
