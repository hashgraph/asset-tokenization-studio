# ILock

_Asset Tokenization Studio Team_

> ILock

Interface for default-partition token lock operations and global (all-partition) read queries.

_Exposes the single-partition write methods (`lock`, `release`) and the global read methods. Partition-aware writes and partition-scoped reads live in `ILockByPartition`. Inherits `ILockTypes` for the `LockedByPartition` / `LockByPartitionReleased` events and the `LockExpirationNotReached` / `WrongLockId` errors that both Lock facets share. The `LockData` struct is declared here because it is the I/O of `getLockByPartition`, exposed only by `LockFacet`._

## Methods

### forceReleaseByPartition

```solidity
function forceReleaseByPartition(bytes32 _partition, uint256 _lockId, address _tokenHolder) external nonpayable returns (bool success_)
```

Releases a lock unconditionally, before its expiration timestamp.

_Authorised path used to recover locked balances when the holder is unable to do so. Pause-gated, partition validated against single-partition mode and restricted to callers holding `LOCKER_ROLE` or `CONTROLLER_ROLE` (checked explicitly via `AccessControlStorageWrapper.checkAnyRole`). Skips the `LockExpirationNotReached` guard that `releaseByPartition` enforces. Emits `LockByPartitionReleased`._

#### Parameters

| Name          | Type    | Description                            |
| ------------- | ------- | -------------------------------------- |
| \_partition   | bytes32 | The partition the lock lives on.       |
| \_lockId      | uint256 | Identifier of the lock to release.     |
| \_tokenHolder | address | The address whose tokens are returned. |

#### Returns

| Name      | Type | Description                                                   |
| --------- | ---- | ------------------------------------------------------------- |
| success\_ | bool | True when the lock has been removed and the balance returned. |

### getLockCountFor

```solidity
function getLockCountFor(address _tokenHolder) external view returns (uint256 lockCount_)
```

Returns the number of active locks held by `_tokenHolder` across every partition.

#### Parameters

| Name          | Type    | Description                              |
| ------------- | ------- | ---------------------------------------- |
| \_tokenHolder | address | The address whose lock count is queried. |

#### Returns

| Name        | Type    | Description                                       |
| ----------- | ------- | ------------------------------------------------- |
| lockCount\_ | uint256 | The number of active locks across all partitions. |

### getLockFor

```solidity
function getLockFor(address _tokenHolder, uint256 _lockId) external view returns (uint256 amount_, uint256 expirationTimestamp_)
```

Returns the amount and expiration of a lock created on the default partition.

_Convenience wrapper that delegates to the partition-aware lookup using the default partition; both fields are zero when the identifier does not exist. The returned amount is adjusted by any pending balance-adjustment factors._

#### Parameters

| Name          | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| \_tokenHolder | address | The address whose lock is queried. |
| \_lockId      | uint256 | Identifier of the lock to read.    |

#### Returns

| Name                  | Type    | Description                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| amount\_              | uint256 | The locked amount, in token base units.              |
| expirationTimestamp\_ | uint256 | Unix timestamp at which the lock becomes releasable. |

### getLockedAmountFor

```solidity
function getLockedAmountFor(address _tokenHolder) external view returns (uint256 amount_)
```

Returns the total amount currently locked for `_tokenHolder` across every partition, adjusted by any pending balance-adjustment factors.

#### Parameters

| Name          | Type    | Description                                       |
| ------------- | ------- | ------------------------------------------------- |
| \_tokenHolder | address | The address whose total locked amount is queried. |

#### Returns

| Name     | Type    | Description                                        |
| -------- | ------- | -------------------------------------------------- |
| amount\_ | uint256 | The aggregate locked amount across all partitions. |

### getLocksIdFor

```solidity
function getLocksIdFor(address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) external view returns (uint256[] locksId_)
```

Returns a paginated list of lock identifiers held by `_tokenHolder` across every partition.

_Pagination is bounded by the caller through `_pageLength`; the returned array length is at most `_pageLength`. A query past the available range returns an empty array._

#### Parameters

| Name          | Type    | Description                                          |
| ------------- | ------- | ---------------------------------------------------- |
| \_tokenHolder | address | The address whose locks are listed.                  |
| \_pageIndex   | uint256 | Zero-based index of the page to retrieve.            |
| \_pageLength  | uint256 | Maximum number of identifiers to return on the page. |

#### Returns

| Name      | Type      | Description                                       |
| --------- | --------- | ------------------------------------------------- |
| locksId\_ | uint256[] | Array of lock identifiers for the requested page. |

### initializeLock

```solidity
function initializeLock() external nonpayable
```

Initialises the lock capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### lock

```solidity
function lock(uint256 _amount, address _tokenHolder, uint256 _expirationTimestamp) external nonpayable returns (uint256 lockId_)
```

Locks `_amount` tokens of `_tokenHolder` on the default partition until `_expirationTimestamp`.

_Single-partition convenience for `lockByPartition` against the default partition. The implementation enforces the unpaused state, the `ROLE_LOCKER`, single-partition mode, an unrecovered token holder and a future expiration timestamp; it emits `LockedByPartition`._

#### Parameters

| Name                  | Type    | Description                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| \_amount              | uint256 | The amount of tokens to lock.                        |
| \_tokenHolder         | address | The address whose tokens are locked.                 |
| \_expirationTimestamp | uint256 | Unix timestamp at which the lock becomes releasable. |

#### Returns

| Name     | Type    | Description                                               |
| -------- | ------- | --------------------------------------------------------- |
| lockId\_ | uint256 | Identifier assigned to the new lock for the token holder. |

### release

```solidity
function release(uint256 _lockId, address _tokenHolder) external nonpayable returns (bool success_)
```

Releases a lock on the default partition previously created with `lock`.

_Reverts with `WrongLockId` when `_lockId` is unknown for `_tokenHolder` and with `LockExpirationNotReached` before the lock&#39;s expiration. Emits `LockByPartitionReleased`._

#### Parameters

| Name          | Type    | Description                            |
| ------------- | ------- | -------------------------------------- |
| \_lockId      | uint256 | Identifier of the lock to release.     |
| \_tokenHolder | address | The address whose tokens are unlocked. |

#### Returns

| Name      | Type | Description                                                   |
| --------- | ---- | ------------------------------------------------------------- |
| success\_ | bool | True when the lock has been removed and the balance returned. |

### updateLockExpiration

```solidity
function updateLockExpiration(address _tokenHolder, uint256 _lockId, uint256 _newExpirationTimestamp) external nonpayable returns (bool success_)
```

Updates the expiration timestamp of an existing lock on the default partition.

_Callers must hold `ROLE_LOCKER`. The new timestamp must be in the future. Both shortening and extending are allowed — this is an intentional trusted-role design: a second locker can correct an excessively far expiration set by a compromised account, while an admin can revoke the malicious locker&#39;s role if needed. Emits `LockExpirationUpdated`._

#### Parameters

| Name                     | Type    | Description                                              |
| ------------------------ | ------- | -------------------------------------------------------- |
| \_tokenHolder            | address | The address whose lock expiration is being updated.      |
| \_lockId                 | uint256 | Identifier of the lock to update.                        |
| \_newExpirationTimestamp | uint256 | New Unix timestamp at which the lock becomes releasable. |

#### Returns

| Name      | Type | Description                                          |
| --------- | ---- | ---------------------------------------------------- |
| success\_ | bool | True when the expiration timestamp has been updated. |

## Events

### LockByPartitionReleased

```solidity
event LockByPartitionReleased(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 lockId)
```

Emitted when a previously created lock is released back to its token holder.

_Emitted by `release`, `releaseByPartition` and `forceReleaseByPartition`. The released amount is not part of the event because the underlying lock entry is removed atomically; consumers can correlate with the prior `LockedByPartition` via `(partition, tokenHolder, lockId)`._

#### Parameters

| Name                  | Type    | Description                                        |
| --------------------- | ------- | -------------------------------------------------- |
| operator `indexed`    | address | The caller that requested the release.             |
| tokenHolder `indexed` | address | The address the tokens are returned to.            |
| partition `indexed`   | bytes32 | The partition the lock was held on.                |
| lockId                | uint256 | The identifier of the lock that has been released. |

### LockExpirationUpdated

```solidity
event LockExpirationUpdated(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 lockId, uint256 oldExpirationTimestamp, uint256 newExpirationTimestamp)
```

Emitted when a lock&#39;s expiration timestamp is updated by a locker.

_Emitted by both `updateLockExpiration` (default partition) and `updateLockExpirationByPartition` (any partition)._

#### Parameters

| Name                   | Type    | Description                                                     |
| ---------------------- | ------- | --------------------------------------------------------------- |
| operator `indexed`     | address | The caller that requested the update (must hold `ROLE_LOCKER`). |
| tokenHolder `indexed`  | address | The address whose lock expiration is being updated.             |
| partition `indexed`    | bytes32 | The partition the lock lives on.                                |
| lockId                 | uint256 | The identifier of the lock being updated.                       |
| oldExpirationTimestamp | uint256 | The expiration timestamp before the update.                     |
| newExpirationTimestamp | uint256 | The new expiration timestamp after the update.                  |

### LockInitialized

```solidity
event LockInitialized()
```

Emitted once when the lock capability is initialised on a token.

_Fires exclusively from `initializeLock`._

### LockedByPartition

```solidity
event LockedByPartition(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 lockId, uint256 amount, uint256 expirationTimestamp)
```

Emitted when an amount of tokens is locked on a specific partition until an expiration timestamp.

_Emitted by both `lock` (default partition) and `lockByPartition` (any partition) so consumers can monitor every lock creation through a single topic._

#### Parameters

| Name                  | Type    | Description                                                             |
| --------------------- | ------- | ----------------------------------------------------------------------- |
| operator `indexed`    | address | The caller that requested the lock (typically holds `ROLE_LOCKER`).     |
| tokenHolder `indexed` | address | The address whose tokens are locked.                                    |
| partition `indexed`   | bytes32 | The partition the tokens are locked on.                                 |
| lockId                | uint256 | The identifier assigned to the new lock for `(partition, tokenHolder)`. |
| amount                | uint256 | The amount of tokens locked.                                            |
| expirationTimestamp   | uint256 | The Unix timestamp at which the lock becomes releasable.                |

## Errors

### InvalidLockAmount

```solidity
error InvalidLockAmount()
```

Reverts when a lock creation is attempted with a zero amount.

_Checked at the start of `LockStorageWrapper.lockByPartition`, which is the single entry point shared by both `Lock.lock` and `LockByPartition.lockByPartition`._

### LockExpirationNotReached

```solidity
error LockExpirationNotReached()
```

Reverts when a release is attempted before the lock&#39;s expiration timestamp.

_Used by the `onlyWithLockedExpirationTimestamp` modifier and by `LockStorageWrapper.checkLockedExpirationTimestamp`._

### WrongLockId

```solidity
error WrongLockId()
```

Reverts when a lock identifier does not exist for the given `(partition, tokenHolder)` pair.

_Used by the `onlyWithValidLockId` modifier and by `LockStorageWrapper.checkValidLockId`._
