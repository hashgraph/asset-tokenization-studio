# IComplianceFacet

## Methods

### canTransfer

```solidity
function canTransfer(address _to, uint256 _value, bytes _data) external view returns (bool, bytes1, bytes32)
```

Checks if a transfer can be executed

#### Parameters

| Name    | Type    | Description                            |
| ------- | ------- | -------------------------------------- |
| \_to    | address | The recipient address                  |
| \_value | uint256 | The amount of tokens to transfer       |
| \_data  | bytes   | Additional data for the transfer check |

#### Returns

| Name | Type    | Description                                      |
| ---- | ------- | ------------------------------------------------ |
| \_0  | bool    | bool True if the transfer can be executed        |
| \_1  | bytes1  | bytes1 EIP1066 status code indicating the result |
| \_2  | bytes32 | bytes32 Additional reason data for the result    |

### canTransferFrom

```solidity
function canTransferFrom(address _from, address _to, uint256 _value, bytes _data) external view returns (bool, bytes1, bytes32)
```

Checks if a transferFrom can be executed

#### Parameters

| Name    | Type    | Description                            |
| ------- | ------- | -------------------------------------- |
| \_from  | address | The sender address                     |
| \_to    | address | The recipient address                  |
| \_value | uint256 | The amount of tokens to transfer       |
| \_data  | bytes   | Additional data for the transfer check |

#### Returns

| Name | Type    | Description                                      |
| ---- | ------- | ------------------------------------------------ |
| \_0  | bool    | bool True if the transfer can be executed        |
| \_1  | bytes1  | bytes1 EIP1066 status code indicating the result |
| \_2  | bytes32 | bytes32 Additional reason data for the result    |

### compliance

```solidity
function compliance() external view returns (contract ICompliance)
```

Returns the address of the compliance contract

#### Returns

| Name | Type                 | Description                         |
| ---- | -------------------- | ----------------------------------- |
| \_0  | contract ICompliance | ICompliance The compliance contract |

### initializeCompliance

```solidity
function initializeCompliance(address _compliance) external nonpayable
```

Initialises the compliance capability on the token and wires the compliance contract.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

#### Parameters

| Name         | Type    | Description                                                   |
| ------------ | ------- | ------------------------------------------------------------- |
| \_compliance | address | Address of the compliance contract that authorises transfers. |

### setCompliance

```solidity
function setCompliance(address _compliance) external nonpayable
```

Sets the compliance contract address

#### Parameters

| Name         | Type    | Description                                |
| ------------ | ------- | ------------------------------------------ |
| \_compliance | address | The address of the new compliance contract |

## Events

### ComplianceInitialized

```solidity
event ComplianceInitialized(address compliance)
```

Emitted once when the compliance capability is initialised on a token.

_Fires exclusively from `initializeCompliance`._

#### Parameters

| Name       | Type    | Description                                              |
| ---------- | ------- | -------------------------------------------------------- |
| compliance | address | The compliance contract address wired at initialisation. |
