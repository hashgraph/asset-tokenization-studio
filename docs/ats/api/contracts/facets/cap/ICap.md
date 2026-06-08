# ICap

_Asset Tokenization Studio Team_

> ICap

Interface for managing the maximum token supply of a security token, both globally and per partition. The cap enforces an upper bound on minting and may be updated by authorised callers provided the new cap is not below the current total supply.

_Part of the Diamond facet system. Cap state is stored at `STORAGE_LOCATION_CAP` via `CapStorageWrapper`. `ROLE_CAP` is required to update the cap after initialisation. `getMaxSupply` returns the cap adjusted for any pending scheduled balance-adjustment factor (ABAF); if the adjusted value would overflow `uint256` it saturates to `MAX_UINT256`. Partition caps are initialised once alongside the global cap and updated through separate partition-scoped functions not exposed by this interface._

## Methods

### getMaxSupply

```solidity
function getMaxSupply() external view returns (uint256 maxSupply_)
```

Returns the current effective maximum supply.

_The raw stored cap is multiplied by any pending scheduled balance-adjustment factor (ABAF) at the current block timestamp. If the product would overflow `uint256`, the value saturates to `MAX_UINT256`._

#### Returns

| Name        | Type    | Description                                            |
| ----------- | ------- | ------------------------------------------------------ |
| maxSupply\_ | uint256 | The effective maximum supply at the current timestamp. |

### initializeCap

```solidity
function initializeCap(uint256 maxSupply, ICap.PartitionCap[] partitionCap) external nonpayable
```

#### Parameters

| Name         | Type                | Description |
| ------------ | ------------------- | ----------- |
| maxSupply    | uint256             | undefined   |
| partitionCap | ICap.PartitionCap[] | undefined   |

### setMaxSupply

```solidity
function setMaxSupply(uint256 _maxSupply) external nonpayable returns (bool success_)
```

Updates the global maximum supply of the token.

_Requires `ROLE_CAP` and the token to be unpaused. The new cap must be non-zero and at least equal to the current adjusted total supply. Emits `MaxSupplySet`._

#### Parameters

| Name        | Type    | Description                    |
| ----------- | ------- | ------------------------------ |
| \_maxSupply | uint256 | The new global maximum supply. |

#### Returns

| Name      | Type | Description                               |
| --------- | ---- | ----------------------------------------- |
| success\_ | bool | True if the cap was successfully updated. |

## Events

### CapInitialized

```solidity
event CapInitialized(uint256 maxSupply, ICap.PartitionCap[] partitionCap)
```

Emitted once when the Cap capability is initialised on a token.

_Fires exclusively from `initializeCap` after the storage write succeeds._

#### Parameters

| Name         | Type                | Description                                                |
| ------------ | ------------------- | ---------------------------------------------------------- |
| maxSupply    | uint256             | The global maximum token supply set during initialisation. |
| partitionCap | ICap.PartitionCap[] | Array of per-partition cap configurations.                 |

### MaxSupplyByPartitionSet

```solidity
event MaxSupplyByPartitionSet(address indexed operator, bytes32 indexed partition, uint256 newMaxSupply, uint256 previousMaxSupply)
```

Emitted when the maximum supply for a specific partition is updated.

#### Parameters

| Name                | Type    | Description                                          |
| ------------------- | ------- | ---------------------------------------------------- |
| operator `indexed`  | address | Address of the caller who performed the update.      |
| partition `indexed` | bytes32 | The partition whose cap was changed.                 |
| newMaxSupply        | uint256 | The new maximum supply value for the partition.      |
| previousMaxSupply   | uint256 | The previous maximum supply value for the partition. |

### MaxSupplySet

```solidity
event MaxSupplySet(address indexed operator, uint256 newMaxSupply, uint256 previousMaxSupply)
```

Emitted when the global maximum supply is updated.

#### Parameters

| Name               | Type    | Description                                     |
| ------------------ | ------- | ----------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the update. |
| newMaxSupply       | uint256 | The new maximum supply value.                   |
| previousMaxSupply  | uint256 | The previous maximum supply value.              |

## Errors

### MaxSupplyReached

```solidity
error MaxSupplyReached(uint256 maxSupply)
```

Thrown when a mint would cause the total supply to exceed the global maximum.

#### Parameters

| Name      | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| maxSupply | uint256 | The current global maximum supply. |

### MaxSupplyReachedForPartition

```solidity
error MaxSupplyReachedForPartition(bytes32 partition, uint256 maxSupply)
```

Thrown when a mint would cause a partition&#39;s total supply to exceed its cap.

#### Parameters

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| partition | bytes32 | The partition whose cap would be exceeded.    |
| maxSupply | uint256 | The current maximum supply for the partition. |

### NewMaxSupplyCannotBeZero

```solidity
error NewMaxSupplyCannotBeZero()
```

Thrown when a proposed new global cap is zero.

### NewMaxSupplyForPartitionTooLow

```solidity
error NewMaxSupplyForPartitionTooLow(bytes32 partition, uint256 maxSupply, uint256 totalSupply)
```

Thrown when a proposed new partition cap is below the partition&#39;s current adjusted total supply.

#### Parameters

| Name        | Type    | Description                                                    |
| ----------- | ------- | -------------------------------------------------------------- |
| partition   | bytes32 | The partition whose cap would be set below its current supply. |
| maxSupply   | uint256 | The proposed new maximum supply for the partition.             |
| totalSupply | uint256 | The current adjusted total supply for the partition.           |

### NewMaxSupplyTooLow

```solidity
error NewMaxSupplyTooLow(uint256 maxSupply, uint256 totalSupply)
```

Thrown when a proposed new global cap is below the current adjusted total supply.

#### Parameters

| Name        | Type    | Description                                        |
| ----------- | ------- | -------------------------------------------------- |
| maxSupply   | uint256 | The proposed new maximum supply.                   |
| totalSupply | uint256 | The current adjusted total supply that exceeds it. |
