# IProceedRecipients

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
