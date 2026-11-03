# CapFacet

_Asset Tokenization Studio Team_

> CapFacet

Diamond facet that exposes maximum supply management operations — initialisation, cap update, and cap query — as selectable proxy functions.

_Inherits `Cap` for the business logic and implements `IStaticFunctionSelectors` for the Diamond resolver pattern. The resolver key `RESOLVER_KEY_CAP` identifies this facet within the diamond proxy._

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
function setMaxSupply(uint256 maxSupply) external nonpayable returns (bool success_)
```

Updates the global maximum supply of the token.

_Requires the token to be unpaused and `ROLE_CAP`. Cap validation and event emission are handled inside `CapStorageWrapper.setMaxSupply`._

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| maxSupply | uint256 | undefined   |

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

### UnrecognizedResolverProxyVersion

```solidity
error UnrecognizedResolverProxyVersion(bytes8 _resolverProxyVersion)
```

Thrown when the provided proxy version does not match any BLR compatible standard.

#### Parameters

| Name                   | Type   | Description                                        |
| ---------------------- | ------ | -------------------------------------------------- |
| \_resolverProxyVersion | bytes8 | proxy version that is not compatible with the BLR. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
