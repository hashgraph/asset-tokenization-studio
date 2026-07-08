# ILockAtSnapshot

_Asset Tokenization Studio Team_

> ILockAtSnapshot

Interface for querying a token holder&#39;s locked balance at the time of a previously taken snapshot.

_Reads are delegated to `SnapshotsStorageWrapper`, which in turn consults `LockStorageWrapper.getLockedAmountForAdjustedAt` to account for any balance-adjustment factor active at the snapshot timestamp. Reverts with `SnapshotIdNull` when `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers._

## Methods

### initializeLockAtSnapshot

```solidity
function initializeLockAtSnapshot() external nonpayable
```

Initialises the lock-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### lockedBalanceOfAtSnapshot

```solidity
function lockedBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the locked balance of a token holder at the time of a given snapshot.

_Queries the adjusted locked-balance snapshot recorded by `LockStorageWrapper` at `_snapshotID`. The value reflects the lock escrow amount as it stood at the snapshot block, adjusted for any scheduled balance-adjustment factor._

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                     |
| --------- | ------- | --------------------------------------------------------------- |
| balance\_ | uint256 | The locked balance of `_tokenHolder` recorded at `_snapshotID`. |

## Events

### LockAtSnapshotInitialized

```solidity
event LockAtSnapshotInitialized()
```

Emitted once when the lock-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeLockAtSnapshot`._
