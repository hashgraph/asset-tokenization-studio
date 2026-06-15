# Compliance

_Asset Tokenization Studio Team_

> Compliance

Manages ERC-3643 compliance configuration and single-partition transfer checks.

_Provides the compliance facet initialisation hook, compliance contract storage access, and ERC-1594 transfer validation helpers for default-partition assets. Transfer checks short-circuit with the EIP-1066 paused status when the token is paused and otherwise delegate eligibility validation to the ERC-1594 storage wrapper._

## Methods

### canTransfer

```solidity
function canTransfer(address _to, uint256 _value, bytes _data) external view returns (bool, bytes1, bytes32)
```

Checks if a transfer can be executed

_Only available when multi-partition mode is disabled. Uses `msg.sender` as sender._

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

_Only available when multi-partition mode is disabled._

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

_Wires the compliance contract address, marks the compliance facet as ready, and emits `ComplianceInitialized`. One-shot is enforced by `onlyFacetNotRegistered`._

#### Parameters

| Name         | Type    | Description                                                   |
| ------------ | ------- | ------------------------------------------------------------- |
| \_compliance | address | Address of the compliance contract that authorises transfers. |

### setCompliance

```solidity
function setCompliance(address _compliance) external nonpayable
```

Sets the compliance contract address

_Requires an operational, activated, unpaused token and `TREX_OWNER_ROLE`. Emits `ComplianceAdded` so off-chain observers can track which compliance contract was authoritative at any point in time._

#### Parameters

| Name         | Type    | Description                                |
| ------------ | ------- | ------------------------------------------ |
| \_compliance | address | The address of the new compliance contract |

## Events

### ComplianceAdded

```solidity
event ComplianceAdded(address indexed compliance)
```

Emitted when the compliance contract address is updated.

#### Parameters

| Name                 | Type    | Description                                     |
| -------------------- | ------- | ----------------------------------------------- |
| compliance `indexed` | address | Address of the newly wired compliance contract. |

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

### NotAllowedInMultiPartitionMode

```solidity
error NotAllowedInMultiPartitionMode()
```

Thrown when a single-partition operation is attempted on a multi-partition token.

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
