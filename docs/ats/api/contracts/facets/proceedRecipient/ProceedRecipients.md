# ProceedRecipients

_Hashgraph_

> Proceed Recipients

Manages the addresses entitled to receive proceeds and their associated data.

_Intended for use as a facet. Initialisation is single-use per resolver key, while mutating operations require an operational, activated and unpaused asset state._

## Methods

### addProceedRecipient

```solidity
function addProceedRecipient(address _proceedRecipient, bytes _data) external nonpayable
```

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| \_proceedRecipient | address | undefined   |
| \_data             | bytes   | undefined   |

### getProceedRecipientData

```solidity
function getProceedRecipientData(address _proceedRecipient) external view returns (bytes)
```

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| \_proceedRecipient | address | undefined   |

#### Returns

| Name | Type  | Description |
| ---- | ----- | ----------- |
| \_0  | bytes | undefined   |

### getProceedRecipients

```solidity
function getProceedRecipients(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] proceedRecipients_)
```

#### Parameters

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| \_pageIndex  | uint256 | undefined   |
| \_pageLength | uint256 | undefined   |

#### Returns

| Name                | Type      | Description |
| ------------------- | --------- | ----------- |
| proceedRecipients\_ | address[] | undefined   |

### getProceedRecipientsCount

```solidity
function getProceedRecipientsCount() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### initializeProceedRecipients

```solidity
function initializeProceedRecipients(address[] _proceedRecipients, bytes[] _data) external nonpayable
```

Initializes the proceedRecipients contract with a list of initial proceedRecipients.

#### Parameters

| Name                | Type      | Description                                                       |
| ------------------- | --------- | ----------------------------------------------------------------- |
| \_proceedRecipients | address[] | An array of addresses representing the initial proceedRecipients. |
| \_data              | bytes[]   | undefined                                                         |

### isProceedRecipient

```solidity
function isProceedRecipient(address _proceedRecipient) external view returns (bool)
```

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| \_proceedRecipient | address | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### removeProceedRecipient

```solidity
function removeProceedRecipient(address _proceedRecipient) external nonpayable
```

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| \_proceedRecipient | address | undefined   |

### updateProceedRecipientData

```solidity
function updateProceedRecipientData(address _proceedRecipient, bytes _data) external nonpayable
```

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| \_proceedRecipient | address | undefined   |
| \_data             | bytes   | undefined   |

## Events

### ProceedRecipientAdded

```solidity
event ProceedRecipientAdded(address indexed operator, address indexed proceedRecipient, bytes data)
```

#### Parameters

| Name                       | Type    | Description |
| -------------------------- | ------- | ----------- |
| operator `indexed`         | address | undefined   |
| proceedRecipient `indexed` | address | undefined   |
| data                       | bytes   | undefined   |

### ProceedRecipientDataUpdated

```solidity
event ProceedRecipientDataUpdated(address indexed operator, address indexed proceedRecipient, bytes newData)
```

#### Parameters

| Name                       | Type    | Description |
| -------------------------- | ------- | ----------- |
| operator `indexed`         | address | undefined   |
| proceedRecipient `indexed` | address | undefined   |
| newData                    | bytes   | undefined   |

### ProceedRecipientRemoved

```solidity
event ProceedRecipientRemoved(address indexed operator, address indexed proceedRecipient)
```

#### Parameters

| Name                       | Type    | Description |
| -------------------------- | ------- | ----------- |
| operator `indexed`         | address | undefined   |
| proceedRecipient `indexed` | address | undefined   |

### ProceedRecipientsInitialized

```solidity
event ProceedRecipientsInitialized(address[] proceedRecipients, bytes[] data)
```

Emitted once when the ProceedRecipients capability is initialised on a token.

_Fires exclusively from `initializeProceedRecipients` after the storage write succeeds._

#### Parameters

| Name              | Type      | Description |
| ----------------- | --------- | ----------- |
| proceedRecipients | address[] | undefined   |
| data              | bytes[]   | undefined   |

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

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### MaxExternalListSizeReached

```solidity
error MaxExternalListSizeReached(uint256 max)
```

Reverts when adding an entry would grow an external list beyond its maximum size.

_Enforced by `ExternalListManagementStorageWrapper.addExternalList` for the external pause, control and KYC lists. The bound exists because each list is iterated in full on the hot path of token operations, so an unbounded list could exceed the gas limit and brick the token._

#### Parameters

| Name | Type    | Description                                               |
| ---- | ------- | --------------------------------------------------------- |
| max  | uint256 | Maximum number of entries permitted in the external list. |

### ProceedRecipientAlreadyExists

```solidity
error ProceedRecipientAlreadyExists(address proceedRecipient)
```

#### Parameters

| Name             | Type    | Description |
| ---------------- | ------- | ----------- |
| proceedRecipient | address | undefined   |

### ProceedRecipientNotFound

```solidity
error ProceedRecipientNotFound(address proceedRecipient)
```

#### Parameters

| Name             | Type    | Description |
| ---------------- | ------- | ----------- |
| proceedRecipient | address | undefined   |

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
