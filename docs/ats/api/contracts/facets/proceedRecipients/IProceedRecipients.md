# IProceedRecipients

_Asset Tokenization Studio Team_

> IProceedRecipients

Interface for managing the set of proceed recipients registered on a token.

_Proceed recipients are addresses entitled to receive token proceeds (e.g. on redemption). Provides one-shot initialisation, CRUD operations, and paginated read queries._

## Methods

### addProceedRecipient

```solidity
function addProceedRecipient(address _proceedRecipient, bytes _data) external nonpayable
```

Registers a new proceed recipient on the token.

#### Parameters

| Name               | Type    | Description                                         |
| ------------------ | ------- | --------------------------------------------------- |
| \_proceedRecipient | address | Address to add as a proceed recipient.              |
| \_data             | bytes   | Arbitrary data to associate with the new recipient. |

### getProceedRecipientData

```solidity
function getProceedRecipientData(address _proceedRecipient) external view returns (bytes)
```

Returns the arbitrary data stored for a registered proceed recipient.

#### Parameters

| Name               | Type    | Description                                |
| ------------------ | ------- | ------------------------------------------ |
| \_proceedRecipient | address | Address of the proceed recipient to query. |

#### Returns

| Name | Type  | Description                                   |
| ---- | ----- | --------------------------------------------- |
| \_0  | bytes | Arbitrary data associated with the recipient. |

### getProceedRecipients

```solidity
function getProceedRecipients(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] proceedRecipients_)
```

Returns a paginated slice of the registered proceed-recipient addresses.

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based index of the page to retrieve.       |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name                | Type      | Description                                                  |
| ------------------- | --------- | ------------------------------------------------------------ |
| proceedRecipients\_ | address[] | Array of proceed-recipient addresses for the requested page. |

### getProceedRecipientsCount

```solidity
function getProceedRecipientsCount() external view returns (uint256)
```

Returns the total number of registered proceed recipients.

#### Returns

| Name | Type    | Description                                                          |
| ---- | ------- | -------------------------------------------------------------------- |
| \_0  | uint256 | Total count of proceed recipients currently registered on the token. |

### initializeProceedRecipients

```solidity
function initializeProceedRecipients(address[] _proceedRecipients, bytes[] _data) external nonpayable
```

Initialises the proceed-recipients capability with a seed list of recipients.

#### Parameters

| Name                | Type      | Description                                                                  |
| ------------------- | --------- | ---------------------------------------------------------------------------- |
| \_proceedRecipients | address[] | Initial array of proceed-recipient addresses to register.                    |
| \_data              | bytes[]   | Per-recipient arbitrary data, one entry per address in `_proceedRecipients`. |

### isProceedRecipient

```solidity
function isProceedRecipient(address _proceedRecipient) external view returns (bool)
```

Returns whether the given address is a registered proceed recipient.

#### Parameters

| Name               | Type    | Description       |
| ------------------ | ------- | ----------------- |
| \_proceedRecipient | address | Address to check. |

#### Returns

| Name | Type | Description                                                             |
| ---- | ---- | ----------------------------------------------------------------------- |
| \_0  | bool | True if the address is a registered proceed recipient; false otherwise. |

### removeProceedRecipient

```solidity
function removeProceedRecipient(address _proceedRecipient) external nonpayable
```

Removes an existing proceed recipient from the token.

#### Parameters

| Name               | Type    | Description                                       |
| ------------------ | ------- | ------------------------------------------------- |
| \_proceedRecipient | address | Address to remove from the proceed-recipient set. |

### updateProceedRecipientData

```solidity
function updateProceedRecipientData(address _proceedRecipient, bytes _data) external nonpayable
```

Updates the arbitrary data stored for an existing proceed recipient.

#### Parameters

| Name               | Type    | Description                                            |
| ------------------ | ------- | ------------------------------------------------------ |
| \_proceedRecipient | address | Address of the recipient whose data should be updated. |
| \_data             | bytes   | New arbitrary data to store for the recipient.         |

## Events

### ProceedRecipientAdded

```solidity
event ProceedRecipientAdded(address indexed operator, address indexed proceedRecipient, bytes data)
```

Emitted when a new proceed recipient is added to the token.

#### Parameters

| Name                       | Type    | Description                                       |
| -------------------------- | ------- | ------------------------------------------------- |
| operator `indexed`         | address | Address that executed the add operation.          |
| proceedRecipient `indexed` | address | Address added as a proceed recipient.             |
| data                       | bytes   | Arbitrary data associated with the new recipient. |

### ProceedRecipientDataUpdated

```solidity
event ProceedRecipientDataUpdated(address indexed operator, address indexed proceedRecipient, bytes newData)
```

Emitted when the data associated with a proceed recipient is updated.

#### Parameters

| Name                       | Type    | Description                                  |
| -------------------------- | ------- | -------------------------------------------- |
| operator `indexed`         | address | Address that executed the update.            |
| proceedRecipient `indexed` | address | Address whose data was updated.              |
| newData                    | bytes   | New arbitrary data stored for the recipient. |

### ProceedRecipientRemoved

```solidity
event ProceedRecipientRemoved(address indexed operator, address indexed proceedRecipient)
```

Emitted when an existing proceed recipient is removed from the token.

#### Parameters

| Name                       | Type    | Description                                     |
| -------------------------- | ------- | ----------------------------------------------- |
| operator `indexed`         | address | Address that executed the remove operation.     |
| proceedRecipient `indexed` | address | Address removed from the proceed-recipient set. |

### ProceedRecipientsInitialized

```solidity
event ProceedRecipientsInitialized(address[] proceedRecipients, bytes[] data)
```

Emitted once when the ProceedRecipients capability is initialised on a token.

_Fires exclusively from `initializeProceedRecipients` after the storage write succeeds._

#### Parameters

| Name              | Type      | Description                                                   |
| ----------------- | --------- | ------------------------------------------------------------- |
| proceedRecipients | address[] | Initial array of registered proceed-recipient addresses.      |
| data              | bytes[]   | Arbitrary per-recipient data supplied at initialisation time. |

## Errors

### ProceedRecipientAlreadyExists

```solidity
error ProceedRecipientAlreadyExists(address proceedRecipient)
```

Thrown when attempting to add an address that is already registered as a proceed recipient.

#### Parameters

| Name             | Type    | Description                                                   |
| ---------------- | ------- | ------------------------------------------------------------- |
| proceedRecipient | address | The address that already exists in the proceed-recipient set. |

### ProceedRecipientNotFound

```solidity
error ProceedRecipientNotFound(address proceedRecipient)
```

Thrown when an operation targets an address that is not a registered proceed recipient.

#### Parameters

| Name             | Type    | Description                                                  |
| ---------------- | ------- | ------------------------------------------------------------ |
| proceedRecipient | address | The address that was not found in the proceed-recipient set. |
