# LockByPartitionFacet

_Asset Tokenization Studio Team_

> LockByPartitionFacet

Diamond facet exposing partition-aware lock operations and partition-scoped read queries via `ILockByPartition`, registered under `RESOLVER_KEY_LOCK_BY_PARTITION`.

_Inherits the implementation from `LockByPartition` and satisfies the `IStaticFunctionSelectors` contract required by the Diamond proxy for static selector registration. Exposes 6 selectors: `lockByPartition`, `releaseByPartition`, `getLockedAmountForByPartition`, `getLockCountForByPartition`, `getLocksIdForByPartition`, `getLockForByPartition`._

## Methods

### getLockCountForByPartition

```solidity
function getLockCountForByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256 lockCount_)
```

Returns the number of active locks held by `_tokenHolder` on `_partition`.

#### Parameters

| Name          | Type    | Description                              |
| ------------- | ------- | ---------------------------------------- |
| \_partition   | bytes32 | The partition the query is scoped to.    |
| \_tokenHolder | address | The address whose lock count is queried. |

#### Returns

| Name        | Type    | Description                                        |
| ----------- | ------- | -------------------------------------------------- |
| lockCount\_ | uint256 | The number of active locks on the given partition. |

### getLockForByPartition

```solidity
function getLockForByPartition(bytes32 _partition, address _tokenHolder, uint256 _lockId) external view returns (uint256 amount_, uint256 expirationTimestamp_)
```

Returns the amount and expiration of a lock on `_partition`.

_Returns the partition figures adjusted by any pending balance-adjustment factors, evaluated at `EvmAccessors.getBlockTimestamp()`._

#### Parameters

| Name          | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| \_partition   | bytes32 | The partition the lock lives on.   |
| \_tokenHolder | address | The address whose lock is queried. |
| \_lockId      | uint256 | Identifier of the lock to read.    |

#### Returns

| Name                  | Type    | Description                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| amount\_              | uint256 | The locked amount, in token base units.              |
| expirationTimestamp\_ | uint256 | Unix timestamp at which the lock becomes releasable. |

### getLockedAmountForByPartition

```solidity
function getLockedAmountForByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256 amount_)
```

Returns the total locked amount of `_tokenHolder` on `_partition`, adjusted by any pending balance-adjustment factors.

_Returns the partition figure adjusted by any pending balance-adjustment factors, evaluated at `EvmAccessors.getBlockTimestamp()`._

#### Parameters

| Name          | Type    | Description                                 |
| ------------- | ------- | ------------------------------------------- |
| \_partition   | bytes32 | The partition the query is scoped to.       |
| \_tokenHolder | address | The address whose locked amount is queried. |

#### Returns

| Name     | Type    | Description                               |
| -------- | ------- | ----------------------------------------- |
| amount\_ | uint256 | The locked amount on the given partition. |

### getLocksIdForByPartition

```solidity
function getLocksIdForByPartition(bytes32 _partition, address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) external view returns (uint256[] locksId_)
```

Returns a paginated list of lock identifiers for `_tokenHolder` on `_partition`.

_Pagination is bounded by the caller through `_pageLength`; the returned array length is at most `_pageLength`. A query past the available range returns an empty array._

#### Parameters

| Name          | Type    | Description                                          |
| ------------- | ------- | ---------------------------------------------------- |
| \_partition   | bytes32 | The partition the query is scoped to.                |
| \_tokenHolder | address | The address whose locks are listed.                  |
| \_pageIndex   | uint256 | Zero-based index of the page to retrieve.            |
| \_pageLength  | uint256 | Maximum number of identifiers to return on the page. |

#### Returns

| Name      | Type      | Description                                       |
| --------- | --------- | ------------------------------------------------- |
| locksId\_ | uint256[] | Array of lock identifiers for the requested page. |

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[])
```

Gets all function selectors of a facet

#### Returns

| Name | Type     | Description              |
| ---- | -------- | ------------------------ |
| \_0  | bytes4[] | Face functions selectors |

### getStaticInterfaceIds

```solidity
function getStaticInterfaceIds() external pure returns (bytes4[])
```

Gets all interfaces ids of a facet.

#### Returns

| Name | Type     | Description        |
| ---- | -------- | ------------------ |
| \_0  | bytes4[] | Face interface ids |

### getStaticResolverKey

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_)
```

Gets the static resolver key

#### Returns

| Name                | Type    | Description         |
| ------------------- | ------- | ------------------- |
| staticResolverKey\_ | bytes32 | Static resolver key |

### initializeLockByPartition

```solidity
function initializeLockByPartition() external nonpayable
```

Initialises the lock-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### lockByPartition

```solidity
function lockByPartition(bytes32 _partition, uint256 _amount, address _tokenHolder, uint256 _expirationTimestamp) external nonpayable returns (uint256 lockId_)
```

Locks `_amount` tokens of `_tokenHolder` on `_partition` until `_expirationTimestamp`.

_Pause-gated, restricted to `ROLE_LOCKER`, validated against the single-partition / default-partition rule and against unrecovered token holders. Delegates to `LockStorageWrapper.lockByPartition` and emits `LockedByPartition`._

#### Parameters

| Name                  | Type    | Description                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| \_partition           | bytes32 | The partition the tokens are locked on.              |
| \_amount              | uint256 | The amount of tokens to lock.                        |
| \_tokenHolder         | address | The address whose tokens are locked.                 |
| \_expirationTimestamp | uint256 | Unix timestamp at which the lock becomes releasable. |

#### Returns

| Name     | Type    | Description                                                         |
| -------- | ------- | ------------------------------------------------------------------- |
| lockId\_ | uint256 | Identifier assigned to the new lock for `(partition, tokenHolder)`. |

### releaseByPartition

```solidity
function releaseByPartition(bytes32 _partition, uint256 _lockId, address _tokenHolder) external nonpayable returns (bool success_)
```

Releases a lock on `_partition` previously created with `lockByPartition`.

_Pause-gated and validated against the single-partition / default-partition rule. Reverts with `WrongLockId` when `_lockId` is unknown for `(_partition, _tokenHolder)` and with `LockExpirationNotReached` before the lock expires. Emits `LockByPartitionReleased`._

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

### updateLockExpirationByPartition

```solidity
function updateLockExpirationByPartition(bytes32 _partition, address _tokenHolder, uint256 _lockId, uint256 _newExpirationTimestamp) external nonpayable returns (bool success_)
```

Updates the expiration timestamp of an existing lock on `_partition`.

_Pause-gated, restricted to `ROLE_LOCKER`, validated against the single-partition / default-partition rule and the lock-id existence check. Delegates the storage mutation to `LockStorageWrapper.updateLockExpiration` and emits `LockExpirationUpdated` with both the old and new timestamps._

#### Parameters

| Name                     | Type    | Description                                              |
| ------------------------ | ------- | -------------------------------------------------------- |
| \_partition              | bytes32 | The partition the lock lives on.                         |
| \_tokenHolder            | address | The address whose lock expiration is being updated.      |
| \_lockId                 | uint256 | Identifier of the lock to update.                        |
| \_newExpirationTimestamp | uint256 | New Unix timestamp at which the lock becomes releasable. |

#### Returns

| Name      | Type | Description                                          |
| --------- | ---- | ---------------------------------------------------- |
| success\_ | bool | True when the expiration timestamp has been updated. |

## Events

### DelegateVotesChanged

```solidity
event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)
```

Emitted when delegate votes change due to balance changes

#### Parameters

| Name               | Type    | Description                      |
| ------------------ | ------- | -------------------------------- |
| delegate `indexed` | address | The delegate whose votes changed |
| previousBalance    | uint256 | The previous vote balance        |
| newBalance         | uint256 | The new vote balance             |

### LockByPartitionInitialized

```solidity
event LockByPartitionInitialized()
```

Emitted once when the lock-by-partition capability is initialised on a token.

_Fires exclusively from `initializeLockByPartition`._

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

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
```

Emitted whenever tokens move between accounts, are minted, or are burned.

#### Parameters

| Name           | Type    | Description                                 |
| -------------- | ------- | ------------------------------------------- |
| from `indexed` | address | Source account (zero address on mint).      |
| to `indexed`   | address | Destination account (zero address on burn). |
| value          | uint256 | Amount of tokens transferred.               |

### TransferByPartition

```solidity
event TransferByPartition(bytes32 indexed _fromPartition, address _operator, address indexed _from, address indexed _to, uint256 _value, bytes _data, bytes _operatorData)
```

#### Parameters

| Name                      | Type    | Description |
| ------------------------- | ------- | ----------- |
| \_fromPartition `indexed` | bytes32 | undefined   |
| \_operator                | address | undefined   |
| \_from `indexed`          | address | undefined   |
| \_to `indexed`            | address | undefined   |
| \_value                   | uint256 | undefined   |
| \_data                    | bytes   | undefined   |
| \_operatorData            | bytes   | undefined   |

## Errors

### AbafChangeForBlockForbidden

```solidity
error AbafChangeForBlockForbidden(uint256 blockNumber)
```

Raised when attempting to change ABAF for a block that is forbidden

#### Parameters

| Name        | Type    | Description                        |
| ----------- | ------- | ---------------------------------- |
| blockNumber | uint256 | The block number that is forbidden |

### AccountHasNoRole

```solidity
error AccountHasNoRole(address account, bytes32 role)
```

Thrown when an account does not hold a required role.

#### Parameters

| Name    | Type    | Description                      |
| ------- | ------- | -------------------------------- |
| account | address | The account that lacks the role. |
| role    | bytes32 | The role that is not held.       |

### AssetNotOperational

```solidity
error AssetNotOperational(bytes32 configId, uint256 versionId)
```

Raised by `InitializerStorageWrapper.checkOperational` (and the related `isConfigVersionOperational` helper) when an operation is attempted on a configuration version that has not yet been marked operational.

#### Parameters

| Name      | Type    | Description                                                        |
| --------- | ------- | ------------------------------------------------------------------ |
| configId  | bytes32 | Resolver-proxy configuration whose operational status was checked. |
| versionId | uint256 | Configuration version whose operational status was checked.        |

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

### FacetAlreadyRegistered

```solidity
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion)
```

Raised when an initialiser tries to register a facet that already has a non-zero last registered version (i.e. the facet is being re-initialised on a fresh install).

#### Parameters

| Name        | Type    | Description                                                    |
| ----------- | ------- | -------------------------------------------------------------- |
| facetId     | bytes32 | Identifier of the offending facet.                             |
| lastVersion | uint256 | Last version recorded for that facet at the time of the check. |

### InsufficientBalance

```solidity
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition)
```

Thrown when a transfer or redemption is attempted with insufficient partition balance.

#### Parameters

| Name      | Type    | Description                            |
| --------- | ------- | -------------------------------------- |
| account   | address | The account whose balance was checked. |
| balance   | uint256 | The actual balance available.          |
| value     | uint256 | The amount that was requested.         |
| partition | bytes32 | The partition that was checked.        |

### InvalidLockAmount

```solidity
error InvalidLockAmount()
```

Reverts when a lock creation is attempted with a zero amount.

_Checked at the start of `LockStorageWrapper.lockByPartition`, which is the single entry point shared by both `Lock.lock` and `LockByPartition.lockByPartition`._

### InvalidPartition

```solidity
error InvalidPartition(address account, bytes32 partition)
```

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| account   | address | undefined   |
| partition | bytes32 | undefined   |

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### LockExpirationNotReached

```solidity
error LockExpirationNotReached()
```

Reverts when a release is attempted before the lock&#39;s expiration timestamp.

_Used by the `onlyWithLockedExpirationTimestamp` modifier and by `LockStorageWrapper.checkLockedExpirationTimestamp`._

### PartitionNotAllowedInSinglePartitionMode

```solidity
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition)
```

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| partition | bytes32 | undefined   |

### SnapshotIdDoesNotExists

```solidity
error SnapshotIdDoesNotExists(uint256 snapshotId)
```

Thrown when the requested snapshot identifier has never been taken on this token.

#### Parameters

| Name       | Type    | Description                                             |
| ---------- | ------- | ------------------------------------------------------- |
| snapshotId | uint256 | The unrecognised snapshot identifier that was supplied. |

### SnapshotIdNull

```solidity
error SnapshotIdNull()
```

Thrown when a snapshot identifier of zero is supplied; zero is reserved and never assigned to a valid snapshot.

### UnexpectedError

```solidity
error UnexpectedError(bytes4 _errorId)
```

Reverts when an unreachable validation state is detected.

_Replaces assertions for defensive handling of logically impossible states._

#### Parameters

| Name      | Type   | Description                                        |
| --------- | ------ | -------------------------------------------------- |
| \_errorId | bytes4 | Identifier of the unexpected validation condition. |

### WalletRecovered

```solidity
error WalletRecovered()
```

### WrongExpirationTimestamp

```solidity
error WrongExpirationTimestamp()
```

Reverts when an expiration timestamp is invalid.

_Used for expired, past, or otherwise unacceptable expiration values._

### WrongLockId

```solidity
error WrongLockId()
```

Reverts when a lock identifier does not exist for the given `(partition, tokenHolder)` pair.

_Used by the `onlyWithValidLockId` modifier and by `LockStorageWrapper.checkValidLockId`._
