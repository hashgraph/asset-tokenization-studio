# IHoldAtSnapshot

_Asset Tokenization Studio Team_

> IHoldAtSnapshot

Interface for querying a token holder&#39;s held (escrowed) balance at the time of a previously taken snapshot.

_Reads are delegated to `SnapshotsStorageWrapper` and depend on the snapshot index recorded by `takeSnapshot`. The held amount is computed against the adjustment factor active at the snapshot timestamp via `HoldStorageWrapper.getHeldAmountForAdjustedAt`. Reverts with `SnapshotIdNull` when `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers._

## Methods

### heldBalanceOfAtSnapshot

```solidity
function heldBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the held balance of a token holder at the time of a given snapshot.

_Sums all hold escrow amounts active at `_snapshotID`, adjusted for any balance-adjustment factor recorded at that snapshot timestamp._

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                   |
| --------- | ------- | ------------------------------------------------------------- |
| balance\_ | uint256 | The held balance of `_tokenHolder` recorded at `_snapshotID`. |

### initializeHoldAtSnapshot

```solidity
function initializeHoldAtSnapshot() external nonpayable
```

Initialises the hold-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### HoldAtSnapshotInitialized

```solidity
event HoldAtSnapshotInitialized()
```

Emitted once when the hold-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeHoldAtSnapshot`._
