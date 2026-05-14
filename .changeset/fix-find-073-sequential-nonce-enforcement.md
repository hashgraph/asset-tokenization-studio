---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-073: enforce sequential nonces in EIP-712 protected operations.

`_isNonceValid` accepted any nonce strictly greater than the current value (`_currentNonce < _nonce`), allowing an attacker to submit a signed operation with an arbitrarily large nonce (e.g. 1000). The on-chain counter would jump to that value, permanently invalidating all intermediate pre-signed operations — a denial-of-service against legitimate pending signatures.

`NonceStorageWrapper.setNonceFor` compounded the issue by directly assigning the caller-supplied value to storage instead of incrementing, making the jump persistent.

The fix closes both vectors:

- `_isNonceValid` now requires strict equality: `_nonce == _currentNonce + 1`.
- `setNonceFor` signature changed to `setNonceFor(address _account)` — it unconditionally increments by 1 and no longer accepts an arbitrary value.
- All call sites updated: `protectedTransferFromByPartition`, `protectedRedeemFromByPartition`, `protectedCreateHoldByPartition`, the three `protectedClearing*` operations, and `ERC20Permit.permit`.
