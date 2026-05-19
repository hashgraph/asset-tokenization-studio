---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-134: align expiration boundary behaviour across all encumbrance types. `HoldStorageWrapper::isHoldExpired` and `ClearingStorageWrapper::requireExpirationTimestamp` used a strict `>` comparison, so holds and clearings were not considered expired at exactly `block.timestamp == expirationTimestamp`, while `LockStorageWrapper::isLockedExpirationTimestamp` used `<=` and treated the same instant as expired. Change both hold and clearing checks from `>` to `>=` so all three encumbrance types share inclusive expiration semantics: an operation is expired at the expiration timestamp, not one second after.
