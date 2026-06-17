# IExternalControlListManagement

_Asset Tokenization Studio Team_

> IExternalControlListManagement

Interface for managing external control list contracts on a security token. External control lists are trusted third-party contracts that implement `IExternalControlList` and are consulted during transfer authorisation checks.

_Part of the Diamond facet system. `ROLE_CONTROL_LIST_MANAGER` is required for all state-mutating functions after initialisation. The external control list and its initialisation flag are stored in diamond storage at `STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT` via `ExternalListManagementStorageWrapper`._

## Methods

### addExternalControlList

```solidity
function addExternalControlList(address _controlList) external nonpayable returns (bool success_)
```

Adds an external control list contract to the list.

_Requires `ROLE_CONTROL_LIST_MANAGER`, the token to be unpaused, and a non-zero address. Reverts with `ListedControlList` if the address is already listed. Emits `AddedToExternalControlLists`._

#### Parameters

| Name          | Type    | Description                                           |
| ------------- | ------- | ----------------------------------------------------- |
| \_controlList | address | Address of the external control list contract to add. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the contract was added successfully. |

### getExternalControlListsCount

```solidity
function getExternalControlListsCount() external view returns (uint256 externalControlListsCount_)
```

Returns the total number of external control list contracts in the list.

#### Returns

| Name                        | Type    | Description                                                   |
| --------------------------- | ------- | ------------------------------------------------------------- |
| externalControlListsCount\_ | uint256 | The current number of listed external control list contracts. |

### getExternalControlListsMembers

```solidity
function getExternalControlListsMembers(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

Returns a paginated slice of the external control list contract list.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the list length.\*

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name      | Type      | Description                                                               |
| --------- | --------- | ------------------------------------------------------------------------- |
| members\_ | address[] | Array of external control list contract addresses for the requested page. |

### initializeExternalControlLists

```solidity
function initializeExternalControlLists(address[] _controlLists) external nonpayable
```

One-time initialiser that populates the external control list at token deployment.

_Can only be called once; subsequent calls revert via `onlyFacetNotRegistered`. The leading-underscore naming convention signals this is an initialiser function._

#### Parameters

| Name           | Type      | Description                                                            |
| -------------- | --------- | ---------------------------------------------------------------------- |
| \_controlLists | address[] | Initial array of external control list contract addresses to register. |

### isExternalControlList

```solidity
function isExternalControlList(address _controlList) external view returns (bool)
```

Checks whether an address is present in the external control list.

#### Parameters

| Name          | Type    | Description       |
| ------------- | ------- | ----------------- |
| \_controlList | address | Address to check. |

#### Returns

| Name | Type | Description                                                                      |
| ---- | ---- | -------------------------------------------------------------------------------- |
| \_0  | bool | True if the address is a listed external control list contract, false otherwise. |

### removeExternalControlList

```solidity
function removeExternalControlList(address _controlList) external nonpayable returns (bool success_)
```

Removes an external control list contract from the list.

_Requires `ROLE_CONTROL_LIST_MANAGER` and the token to be unpaused. Reverts with `UnlistedControlList` if the address is not listed. Emits `RemovedFromExternalControlLists`._

#### Parameters

| Name          | Type    | Description                                              |
| ------------- | ------- | -------------------------------------------------------- |
| \_controlList | address | Address of the external control list contract to remove. |

#### Returns

| Name      | Type | Description                                    |
| --------- | ---- | ---------------------------------------------- |
| success\_ | bool | True if the contract was removed successfully. |

### updateExternalControlLists

```solidity
function updateExternalControlLists(address[] _controlLists, bool[] _actives) external nonpayable returns (bool success_)
```

Adds or removes multiple external control list contracts in a single transaction.

_Requires `ROLE_CONTROL_LIST_MANAGER` and the token to be unpaused. Both arrays must have the same length and contain no duplicate addresses, validated by `ArrayValidation.checkUniqueValues`. Reverts with `ExternalControlListsNotUpdated` on failure. Emits `ExternalControlListsUpdated`._

#### Parameters

| Name           | Type      | Description                                                                   |
| -------------- | --------- | ----------------------------------------------------------------------------- |
| \_controlLists | address[] | Array of external control list contract addresses to process.                 |
| \_actives      | bool[]    | Corresponding flags; `true` adds the address to the list, `false` removes it. |

#### Returns

| Name      | Type | Description                                      |
| --------- | ---- | ------------------------------------------------ |
| success\_ | bool | True if the batch update completed successfully. |

## Events

### AddedToExternalControlLists

```solidity
event AddedToExternalControlLists(address indexed operator, address controlList)
```

Emitted when an external control list contract is added to the list.

#### Parameters

| Name               | Type    | Description                                                   |
| ------------------ | ------- | ------------------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the addition.             |
| controlList        | address | Address of the external control list contract that was added. |

### ExternalControlListInitialized

```solidity
event ExternalControlListInitialized(address[] controlLists)
```

Emitted once when the external control list capability is initialised on a token.

_Fires exclusively from `initializeExternalControlLists` after the storage write succeeds._

#### Parameters

| Name         | Type      | Description                                                               |
| ------------ | --------- | ------------------------------------------------------------------------- |
| controlLists | address[] | The initial array of external control list contract addresses registered. |

### ExternalControlListsUpdated

```solidity
event ExternalControlListsUpdated(address indexed operator, address[] controlLists, bool[] actives)
```

Emitted when multiple external control list addresses are added or removed in a single batch.

#### Parameters

| Name               | Type      | Description                                                                |
| ------------------ | --------- | -------------------------------------------------------------------------- |
| operator `indexed` | address   | Address of the caller who performed the update.                            |
| controlLists       | address[] | Array of external control list contract addresses that were processed.     |
| actives            | bool[]    | Corresponding activation flags; `true` means added, `false` means removed. |

### RemovedFromExternalControlLists

```solidity
event RemovedFromExternalControlLists(address indexed operator, address controlList)
```

Emitted when an external control list contract is removed from the list.

#### Parameters

| Name               | Type    | Description                                                     |
| ------------------ | ------- | --------------------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the removal.                |
| controlList        | address | Address of the external control list contract that was removed. |

## Errors

### ExternalControlListsNotUpdated

```solidity
error ExternalControlListsNotUpdated(address[] controlLista, bool[] actives)
```

Thrown when a batch update of external control lists fails to complete.

#### Parameters

| Name         | Type      | Description                                                            |
| ------------ | --------- | ---------------------------------------------------------------------- |
| controlLista | address[] | Array of external control list contract addresses that were submitted. |
| actives      | bool[]    | Corresponding activation flags that were submitted.                    |

### ListedControlList

```solidity
error ListedControlList(address controlList)
```

Thrown when attempting to add an address already present in the external control list.

#### Parameters

| Name        | Type    | Description                                           |
| ----------- | ------- | ----------------------------------------------------- |
| controlList | address | The duplicate external control list contract address. |

### UnlistedControlList

```solidity
error UnlistedControlList(address controlList)
```

Thrown when attempting to remove an address not present in the external control list.

#### Parameters

| Name        | Type    | Description                                          |
| ----------- | ------- | ---------------------------------------------------- |
| controlList | address | The unlisted external control list contract address. |
