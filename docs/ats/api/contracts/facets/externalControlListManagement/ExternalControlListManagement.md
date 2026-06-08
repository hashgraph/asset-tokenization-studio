# ExternalControlListManagement

_Asset Tokenization Studio Team_

> ExternalControlListManagement

Abstract contract implementing external onlyOperational control list management logic for a security token. Maintains a list of trusted third-party control list contracts whose authorisation results are consulted during transfer compliance checks.

_Implements `IExternalControlListManagement`. The external onlyOperational control list is stored in diamond storage at `STORAGE_LOCATION_CONTROL_LIST_MANAGEMENT` via `ExternalListManagementStorageWrapper`. All mutating functions after initialisation are gated by `ROLE_CONTROL_LIST_MANAGER` and the `onlyUnpaused` modifier inherited from `Modifiers`. Intended to be inherited exclusively by `ExternalControlListManagementFacet`._

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

| Name         | Type      | Description |
| ------------ | --------- | ----------- |
| controlLists | address[] | undefined   |

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

### ContradictoryValuesInArray

```solidity
error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex)
```

Reverts when ordered array values contradict expected ordering.

_Indicates that two indexed values cannot both satisfy the required monotonic or range invariant._

#### Parameters

| Name       | Type    | Description                                      |
| ---------- | ------- | ------------------------------------------------ |
| lowerIndex | uint256 | Lower array index involved in the contradiction. |
| upperIndex | uint256 | Upper array index involved in the contradiction. |

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

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

### ListedControlList

```solidity
error ListedControlList(address controlList)
```

Thrown when attempting to add an address already present in the external control list.

#### Parameters

| Name        | Type    | Description                                           |
| ----------- | ------- | ----------------------------------------------------- |
| controlList | address | The duplicate external control list contract address. |

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

### UnlistedControlList

```solidity
error UnlistedControlList(address controlList)
```

Thrown when attempting to remove an address not present in the external control list.

#### Parameters

| Name        | Type    | Description                                          |
| ----------- | ------- | ---------------------------------------------------- |
| controlList | address | The unlisted external control list contract address. |

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
