---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix `_recoverSigner` not validating that `ecrecover` returned a non-zero address.

`ecrecover` silently returns `address(0)` for invalid or malformed signatures instead of reverting. `_recoverSigner` was forwarding that result directly, which meant `_verify(address(0), …, invalidSig)` evaluated to `true` — allowing any malformed signature to pass verification when the expected signer happened to be `address(0)`.

`_recoverSigner` now reverts with `ICommonErrors.WrongSignature()` when `ecrecover` returns `address(0)`.
