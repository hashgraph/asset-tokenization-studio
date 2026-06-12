---
"@hashgraph/asset-tokenization-contracts": minor
---

Fix FIND-059: add `updateLockExpirationByPartition` and `updateLockExpiration` so `ROLE_LOCKER` accounts can correct a lock's expiration timestamp. Previously `lockByPartition`/`lock` imposed no upper bound, so a locker could set `type(uint256).max` and create a permanently unreleasable lock; a second locker can now fix the date, and an admin can revoke a compromised locker's role first. Adds a `LockExpirationUpdated` event and an internal `updateLockExpiration` that mutates only the expiration field, leaving amount aggregates and ABAF/LABAF untouched. Both new selectors are ABI additions; no existing signature changes.
