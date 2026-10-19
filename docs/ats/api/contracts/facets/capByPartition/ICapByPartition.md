# ICapByPartition

_Asset Tokenization Studio Team_

> ICapByPartition

Interface for managing the per-partition maximum supply cap of a token.

_The partition-scoped cap sits underneath the global cap declared in `ICap`. Setting a partition cap requires the `ROLE_CAP` and the token to be unpaused; the cap value is validated against the partition&#39;s current total supply and the global max supply both adjusted for any pending balance adjustments. Reads expose the same balance-adjusted view, so values returned reflect scheduled adjustments effective at the current block timestamp._

## Methods

### getMaxSupplyByPartition

```solidity
function getMaxSupplyByPartition(bytes32 _partition) external view returns (uint256 maxSupply_)
```

Returns the maximum supply cap currently in effect for a partition.

_The returned value is adjusted for pending balance adjustments effective at the current block timestamp._

#### Parameters

| Name        | Type    | Description                        |
| ----------- | ------- | ---------------------------------- |
| \_partition | bytes32 | The partition identifier to query. |

#### Returns

| Name        | Type    | Description                                           |
| ----------- | ------- | ----------------------------------------------------- |
| maxSupply\_ | uint256 | The balance-adjusted maximum supply for `_partition`. |

### initializeCapByPartition

```solidity
function initializeCapByPartition() external nonpayable
```

Initialises the CapByPartition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### setMaxSupplyByPartition

```solidity
function setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply) external nonpayable returns (bool success_)
```

Sets the maximum supply cap for a specific partition of the token.

_Reverts with `NewMaxSupplyCannotBeZero` when `_maxSupply` is zero, and with `NewMaxSupplyForPartitionTooLow` when it is below the partition&#39;s adjusted total supply. Emits {MaxSupplyByPartitionSet}._

#### Parameters

| Name        | Type    | Description                                          |
| ----------- | ------- | ---------------------------------------------------- |
| \_partition | bytes32 | The partition identifier whose cap is being updated. |
| \_maxSupply | uint256 | The new maximum supply value for the partition.      |

#### Returns

| Name      | Type | Description                   |
| --------- | ---- | ----------------------------- |
| success\_ | bool | True when the cap is updated. |

## Events

### CapByPartitionInitialized

```solidity
event CapByPartitionInitialized()
```

Emitted once when the CapByPartition capability is initialised on a token.

_Fires exclusively from `initializeCapByPartition` after the storage write succeeds._
