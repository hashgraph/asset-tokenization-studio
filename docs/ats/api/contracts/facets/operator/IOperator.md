# IOperator

> IOperator

Interface for operator management: query, authorize and revoke operators for all partitions.

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

### OperatorInitialized

```solidity
event OperatorInitialized()
```

Emitted once when the operator capability is initialised on a token.

_Fires exclusively from `initializeOperator`._
