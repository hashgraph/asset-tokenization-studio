# ControllerByPartition

_Asset Tokenization Studio Team_

> ControllerByPartition

Abstract implementation of controller-initiated forced transfers and redemptions on a specific partition. Delegates into `TokenCoreOps` so semantics match `ERC1410Management` exactly.

_Inherits modifier guards from `Modifiers`. Intended to be used only through `ControllerByPartitionFacet`._

## Methods

### controllerRedeemByPartition

```solidity
function controllerRedeemByPartition(bytes32 _partition, address _tokenHolder, uint256 _value, bytes _data, bytes _operatorData) external nonpayable
```

Forces a redemption in a partition from a token holder.

_Emits {RedeemedByPartition} via TokenCoreOps.redeemByPartition._

#### Parameters

| Name           | Type    | Description                                                 |
| -------------- | ------- | ----------------------------------------------------------- |
| \_partition    | bytes32 | The partition from which tokens are redeemed.               |
| \_tokenHolder  | address | The address whose tokens are redeemed.                      |
| \_value        | uint256 | The amount of tokens to redeem.                             |
| \_data         | bytes   | Additional data attached to the redemption.                 |
| \_operatorData | bytes   | Additional data attached to the redemption by the operator. |

### controllerTransferByPartition

```solidity
function controllerTransferByPartition(bytes32 _partition, address _from, address _to, uint256 _value, bytes _data, bytes _operatorData) external nonpayable returns (bytes32)
```

Forces a transfer in a partition from a token holder to a destination address.

_Emits {TransferByPartition} via TokenCoreOps.transferByPartition._

#### Parameters

| Name           | Type    | Description                                               |
| -------------- | ------- | --------------------------------------------------------- |
| \_partition    | bytes32 | The partition from which tokens are transferred.          |
| \_from         | address | The address from which tokens are transferred.            |
| \_to           | address | The address to which tokens are transferred.              |
| \_value        | uint256 | The amount of tokens to transfer.                         |
| \_data         | bytes   | Additional data attached to the transfer.                 |
| \_operatorData | bytes   | Additional data attached to the transfer by the operator. |

#### Returns

| Name | Type    | Description                                           |
| ---- | ------- | ----------------------------------------------------- |
| \_0  | bytes32 | The partition from which the tokens were transferred. |

### initializeControllerByPartition

```solidity
function initializeControllerByPartition() external nonpayable
```

Initialises the controller by partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### AuthorizedOperator

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenHolder)
```

Emitted when an operator is authorised to manage all partitions of a token holder.

#### Parameters

| Name                  | Type    | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| operator `indexed`    | address | Newly authorised operator address.          |
| tokenHolder `indexed` | address | Token holder who granted the authorisation. |

### AuthorizedOperatorByPartition

```solidity
event AuthorizedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder)
```

Emitted when an operator is authorised for a specific partition of a token holder.

#### Parameters

| Name                  | Type    | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| partition `indexed`   | bytes32 | Partition the authorisation applies to.     |
| operator `indexed`    | address | Newly authorised operator address.          |
| tokenHolder `indexed` | address | Token holder who granted the authorisation. |

### ControllerByPartitionInitialized

```solidity
event ControllerByPartitionInitialized()
```

Emitted once when the controller by partition capability is initialised on a token.

_Fires exclusively from `initializeControllerByPartition`._

### IssuedByPartition

```solidity
event IssuedByPartition(bytes32 indexed partition, address indexed operator, address indexed to, uint256 value, bytes data)
```

Emitted when new tokens are issued into a partition.

#### Parameters

| Name                | Type    | Description                                    |
| ------------------- | ------- | ---------------------------------------------- |
| partition `indexed` | bytes32 | Partition the tokens were issued into.         |
| operator `indexed`  | address | Address that performed the issuance.           |
| to `indexed`        | address | Recipient of the issued tokens.                |
| value               | uint256 | Token quantity issued.                         |
| data                | bytes   | Caller-supplied data attached to the issuance. |

### RedeemedByPartition

```solidity
event RedeemedByPartition(bytes32 indexed partition, address indexed operator, address indexed from, uint256 value, bytes data, bytes operatorData)
```

Emitted when tokens are redeemed from a partition.

#### Parameters

| Name                | Type    | Description                                        |
| ------------------- | ------- | -------------------------------------------------- |
| partition `indexed` | bytes32 | Partition the tokens were redeemed from.           |
| operator `indexed`  | address | Address that performed the redemption.             |
| from `indexed`      | address | Token holder whose tokens were redeemed.           |
| value               | uint256 | Token quantity redeemed.                           |
| data                | bytes   | Caller-supplied data attached to the redemption.   |
| operatorData        | bytes   | Operator-supplied data attached to the redemption. |

### RevokedOperator

```solidity
event RevokedOperator(address indexed operator, address indexed tokenHolder)
```

Emitted when an operator&#39;s authorisation over all partitions of a token holder is revoked.

#### Parameters

| Name                  | Type    | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| operator `indexed`    | address | Operator whose authorisation was revoked.   |
| tokenHolder `indexed` | address | Token holder who revoked the authorisation. |

### RevokedOperatorByPartition

```solidity
event RevokedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder)
```

Emitted when an operator&#39;s authorisation for a specific partition of a token holder is revoked.

#### Parameters

| Name                  | Type    | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| partition `indexed`   | bytes32 | Partition the revocation applies to.        |
| operator `indexed`    | address | Operator whose authorisation was revoked.   |
| tokenHolder `indexed` | address | Token holder who revoked the authorisation. |

### TransferByPartition

```solidity
event TransferByPartition(bytes32 indexed _fromPartition, address _operator, address indexed _from, address indexed _to, uint256 _value, bytes _data, bytes _operatorData)
```

Emitted when tokens are transferred from one partition to another or within the same partition.

#### Parameters

| Name                      | Type    | Description                           |
| ------------------------- | ------- | ------------------------------------- |
| \_fromPartition `indexed` | bytes32 | Source partition.                     |
| \_operator                | address | Address that initiated the transfer.  |
| \_from `indexed`          | address | Token holder whose balance decreased. |
| \_to `indexed`            | address | Recipient whose balance increased.    |
| \_value                   | uint256 | Token quantity transferred.           |
| \_data                    | bytes   | Caller-supplied data.                 |
| \_operatorData            | bytes   | Operator-supplied data.               |

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

### InvalidPartition

```solidity
error InvalidPartition(address account, bytes32 partition)
```

Thrown when an account does not hold or is not associated with the specified partition.

#### Parameters

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| account   | address | Address that was checked.                     |
| partition | bytes32 | Partition that was not found for the account. |

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

### PartitionNotAllowedInSinglePartitionMode

```solidity
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition)
```

Thrown when a multi-partition operation specifies a partition not permitted in single-partition mode.

#### Parameters

| Name      | Type    | Description                                      |
| --------- | ------- | ------------------------------------------------ |
| partition | bytes32 | The disallowed partition supplied by the caller. |

### TokenHolderNotFound

```solidity
error TokenHolderNotFound(address tokenHolder)
```

Thrown when an operation targets a token holder address that has no registered balance.

#### Parameters

| Name        | Type    | Description                     |
| ----------- | ------- | ------------------------------- |
| tokenHolder | address | The address that was not found. |

### TokenIsNotControllable

```solidity
error TokenIsNotControllable()
```

Thrown when an operation requires the token to be controllable but it is not.

### Unauthorized

```solidity
error Unauthorized(address operator, address tokenHolder, bytes32 partition)
```

Thrown when the caller is not an authorised operator for the token holder on the given partition.

#### Parameters

| Name        | Type    | Description                                   |
| ----------- | ------- | --------------------------------------------- |
| operator    | address | Address that attempted the operation.         |
| tokenHolder | address | Token holder whose tokens were targeted.      |
| partition   | bytes32 | Partition on which authorisation was checked. |

### ZeroPartition

```solidity
error ZeroPartition()
```

Thrown when the zero bytes32 value is supplied as a partition identifier.

### ZeroValue

```solidity
error ZeroValue()
```

Thrown when a zero token amount is supplied to an operation that requires a positive value.
