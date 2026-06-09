# BatchControllerFacet

> BatchControllerFacet

Diamond facet exposing controller-only batch transfer operations.

_Registers the `batchForcedTransfer` selector. Inherits business logic from the `BatchController` abstract contract._

## Methods

### batchForcedTransfer

```solidity
function batchForcedTransfer(address[] _fromList, address[] _toList, uint256[] _amounts) external nonpayable
```

Batch forced transfer of tokens from multiple source addresses to multiple destinations.

_Restricted to accounts holding the controller or agent role. Requires the token to be controllable and operating in single-partition mode. Emits one `IController.ControllerTransfer` event per element._

#### Parameters

| Name       | Type      | Description                                                               |
| ---------- | --------- | ------------------------------------------------------------------------- |
| \_fromList | address[] | Source addresses to debit.                                                |
| \_toList   | address[] | Destination addresses to credit.                                          |
| \_amounts  | uint256[] | Amounts to transfer, positionally aligned with `_fromList` and `_toList`. |

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

### initializeBatchController

```solidity
function initializeBatchController() external nonpayable
```

Initialises the batch controller capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### BatchControllerInitialized

```solidity
event BatchControllerInitialized()
```

Emitted once when the batch controller capability is initialised on a token.

_Fires exclusively from `initializeBatchController` after the storage write succeeds._

### ControllerTransfer

```solidity
event ControllerTransfer(address _controller, address indexed _from, address indexed _to, uint256 _value, bytes _data, bytes _operatorData)
```

Emitted when an authorised controller transfers tokens between two holders.

#### Parameters

| Name             | Type    | Description                                                     |
| ---------------- | ------- | --------------------------------------------------------------- |
| \_controller     | address | The address of the controller that initiated the transfer.      |
| \_from `indexed` | address | The address tokens are transferred from.                        |
| \_to `indexed`   | address | The address tokens are transferred to.                          |
| \_value          | uint256 | The amount of tokens transferred.                               |
| \_data           | bytes   | Optional data attached to the transfer for validation.          |
| \_operatorData   | bytes   | Optional data attached by the controller for event attribution. |

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

### AccountHasNoRoles

```solidity
error AccountHasNoRoles(address account, bytes32[] roles)
```

Thrown when an account does not hold any of the specified roles.

#### Parameters

| Name    | Type      | Description                       |
| ------- | --------- | --------------------------------- |
| account | address   | The account that lacks the roles. |
| roles   | bytes32[] | The roles that are not held.      |

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

### InputAmountsArrayLengthMismatch

```solidity
error InputAmountsArrayLengthMismatch()
```

Thrown when the lengths of two input amount arrays do not match.

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### NotAllowedInMultiPartitionMode

```solidity
error NotAllowedInMultiPartitionMode()
```

Thrown when a single-partition operation is attempted on a multi-partition token.

### TokenIsNotControllable

```solidity
error TokenIsNotControllable()
```

Thrown when an operation requires the token to be controllable but it is not.
