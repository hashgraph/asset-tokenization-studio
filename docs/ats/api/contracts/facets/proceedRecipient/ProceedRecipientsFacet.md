# ProceedRecipientsFacet

_Asset Tokenization Studio Team_

> ProceedRecipientsFacet

Diamond facet that exposes proceed-recipient management operations through the `IProceedRecipients` interface, registered under `RESOLVER_KEY_PROCEED_RECIPIENTS`.

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

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
