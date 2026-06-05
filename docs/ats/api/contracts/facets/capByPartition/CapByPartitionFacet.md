# CapByPartitionFacet

_Asset Tokenization Studio Team_

> CapByPartitionFacet

Diamond facet that exposes the per-partition maximum supply cap surface through the `ICapByPartition` interface, registered under `RESOLVER_KEY_CAP_BY_PARTITION`.

_Inherits behaviour from `CapByPartition` and satisfies `IStaticFunctionSelectors` for Diamond proxy selector registration. Exposes three selectors: `initializeCapByPartition`, `setMaxSupplyByPartition`, `getMaxSupplyByPartition`._

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

## Errors

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

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

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
