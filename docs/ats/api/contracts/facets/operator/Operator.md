# Operator

_Asset Tokenization Studio Team_

> Operator

Abstract implementation of `IOperator`.

_Delegates all storage reads to `ERC1410StorageWrapper`. Intended to be inherited solely by `OperatorFacet`._

## Methods

### authorizeOperator

```solidity
function authorizeOperator(address _operator) external nonpayable
```

Authorises an operator for all partitions of `msg.sender`

#### Parameters

| Name       | Type    | Description                          |
| ---------- | ------- | ------------------------------------ |
| \_operator | address | An address which is being authorised |

### initializeOperator

```solidity
function initializeOperator() external nonpayable
```

Initialises the operator capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### isOperator

```solidity
function isOperator(address _operator, address _tokenHolder) external view returns (bool)
```

Determines whether `_operator` is an operator for all partitions of `_tokenHolder`

#### Parameters

| Name          | Type    | Description               |
| ------------- | ------- | ------------------------- |
| \_operator    | address | The operator to check     |
| \_tokenHolder | address | The token holder to check |

#### Returns

| Name | Type | Description                                                                 |
| ---- | ---- | --------------------------------------------------------------------------- |
| \_0  | bool | Whether the `_operator` is an operator for all partitions of `_tokenHolder` |

### revokeOperator

```solidity
function revokeOperator(address _operator) external nonpayable
```

Revokes authorisation of an operator previously given for all partitions of `msg.sender`

#### Parameters

| Name       | Type    | Description                             |
| ---------- | ------- | --------------------------------------- |
| \_operator | address | An address which is being de-authorised |

## Events

### AuthorizedOperator

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenHolder)
```

#### Parameters

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| operator `indexed`    | address | undefined   |
| tokenHolder `indexed` | address | undefined   |

### OperatorAuthorized

```solidity
event OperatorAuthorized(address indexed operator, address indexed tokenHolder)
```

Emitted when an operator is authorized by an account for all partitions of the account

#### Parameters

| Name                  | Type    | Description                               |
| --------------------- | ------- | ----------------------------------------- |
| operator `indexed`    | address | The account that changed their delegation |
| tokenHolder `indexed` | address | The account who authorized the operator   |

### OperatorInitialized

```solidity
event OperatorInitialized()
```

Emitted once when the operator capability is initialised on a token.

_Fires exclusively from `initializeOperator`._

### OperatorRevoked

```solidity
event OperatorRevoked(address indexed operator, address indexed tokenHolder)
```

Emitted when an operator is revoked by an account for all partitions of the account

#### Parameters

| Name                  | Type    | Description                               |
| --------------------- | ------- | ----------------------------------------- |
| operator `indexed`    | address | The account that changed their delegation |
| tokenHolder `indexed` | address | The account who revoked the operator      |

### RevokedOperator

```solidity
event RevokedOperator(address indexed operator, address indexed tokenHolder)
```

#### Parameters

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| operator `indexed`    | address | undefined   |
| tokenHolder `indexed` | address | undefined   |

## Errors

### AccessControlRequired

```solidity
error AccessControlRequired(bytes32 role, address sender)
```

_Emitted when a role check fails_

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| role   | bytes32 | undefined   |
| sender | address | undefined   |

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
