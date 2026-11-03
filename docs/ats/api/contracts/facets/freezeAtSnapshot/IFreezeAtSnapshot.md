# IFreezeAtSnapshot

_Asset Tokenization Studio Team_

> IFreezeAtSnapshot

Interface exposing historical frozen-balance queries against captured snapshots.

_Read-only counterpart to the freeze surface for snapshot-aware reporting. Returns the frozen amount as it was at the time the snapshot was taken, including time-based adjustments scheduled before that block._

## Methods

### frozenBalanceOfAtSnapshot

```solidity
function frozenBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the frozen balance of an account at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                        |
| ------------- | ------- | -------------------------------------------------- |
| \_snapshotID  | uint256 | The identifier of the snapshot to query.           |
| \_tokenHolder | address | The address whose frozen balance is being queried. |

#### Returns

| Name      | Type    | Description                                                     |
| --------- | ------- | --------------------------------------------------------------- |
| balance\_ | uint256 | The frozen balance of `_tokenHolder` at snapshot `_snapshotID`. |

### initializeFreezeAtSnapshot

```solidity
function initializeFreezeAtSnapshot() external nonpayable
```

Initialises the freeze-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### FreezeAtSnapshotInitialized

```solidity
event FreezeAtSnapshotInitialized()
```

Emitted once when the freeze-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeFreezeAtSnapshot`._
