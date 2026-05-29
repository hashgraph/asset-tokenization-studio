---
"@hashgraph/asset-tokenization-contracts": minor
---

Audit FIND-059: Add `updateLockExpirationByPartition` and `updateLockExpiration` to allow
`ROLE_LOCKER` accounts to correct a lock's expiration timestamp.

Previously `lockByPartition` (and `lock`) imposed no upper bound on `_expirationTimestamp`,
so a locker could set it to `type(uint256).max`, creating a lock that could never be released
through any existing path. A second locker can now correct the date in two transactions;
if the original locker is compromised, an admin can revoke its role first.

Changes:

- `ILockTypes` — new `LockExpirationUpdated` event carrying `operator`, `tokenHolder`,
  `partition`, `lockId`, `oldExpirationTimestamp`, and `newExpirationTimestamp`.
- `LockStorageWrapper` — new internal `updateLockExpiration` that mutates only the
  `expirationTimestamp` field of the stored `LockData` record; amount aggregates and
  ABAF/LABAF values are left untouched.
- `ILockByPartition` / `LockByPartition` / `LockByPartitionFacet` — new external
  `updateLockExpirationByPartition(partition, tokenHolder, lockId, newExpirationTimestamp)`
  gated by `onlyRole(ROLE_LOCKER)`, `onlyWithValidLockId`, and
  `onlyValidExpirationTimestamp`.
- `ILock` / `Lock` / `LockFacet` — new external `updateLockExpiration(tokenHolder, lockId,
newExpirationTimestamp)` as the default-partition convenience counterpart, additionally
  gated by `onlyWithoutMultiPartition`.

Both new selectors are ABI additions and do not change existing function signatures.
