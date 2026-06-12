---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-073: enforce sequential nonces in EIP-712 protected operations. `_isNonceValid` accepted any nonce greater than the current value, so an attacker could submit a signed operation with an arbitrarily large nonce and make the on-chain counter jump, permanently invalidating all intermediate pre-signed operations (a denial-of-service); `setNonceFor` compounded it by assigning the supplied value directly. The fix requires strict `_nonce == _currentNonce + 1`, changes `setNonceFor(address)` to unconditionally increment by 1, and updates all call sites (the protected transfer/redeem/hold/clearing operations and `ERC20Permit.permit`).
