# ExternalPauseManagement

_Asset Tokenization Studio Team_

> ExternalPauseManagement

Abstract contract implementing external onlyOperational pause management logic for a security token. Maintains a list of trusted third-party pause contracts whose combined pause state contributes to the token&#39;s global pause evaluation.

_Implements `IExternalPauseManagement`. The external onlyOperational pause list is stored in diamond storage at `STORAGE_LOCATION_PAUSE_MANAGEMENT` via `ExternalListManagementStorageWrapper`. All mutating functions after initialisation are gated by `ROLE_PAUSE_MANAGER` and the `onlyUnpaused` modifier inherited from `Modifiers`. Intended to be inherited exclusively by `ExternalPauseManagementFacet`._

## Methods

### addExternalPause

```solidity
function addExternalPause(address _pause) external nonpayable returns (bool success_)
```

Adds an external pause contract to the list.

_Requires `ROLE_PAUSE_MANAGER`, the token to be unpaused, and a non-zero address. Reverts with `ListedPause` if the address is already listed. Emits `AddedToExternalPauses`._

#### Parameters

| Name    | Type    | Description                                    |
| ------- | ------- | ---------------------------------------------- |
| \_pause | address | Address of the external pause contract to add. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the contract was added successfully. |

### getExternalPausesCount

```solidity
function getExternalPausesCount() external view returns (uint256 externalPausesCount_)
```

Returns the total number of external pause contracts in the list.

#### Returns

| Name                  | Type    | Description                                            |
| --------------------- | ------- | ------------------------------------------------------ |
| externalPausesCount\_ | uint256 | The current number of listed external pause contracts. |

### getExternalPausesMembers

```solidity
function getExternalPausesMembers(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

Returns a paginated slice of the external pause contract list.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the list length.\*

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name      | Type      | Description                                                        |
| --------- | --------- | ------------------------------------------------------------------ |
| members\_ | address[] | Array of external pause contract addresses for the requested page. |

### initializeExternalPauses

```solidity
function initializeExternalPauses(address[] _pauses) external nonpayable
```

One-time initialiser that populates the external pause list at token deployment.

_Can only be called once; subsequent calls revert via `onlyFacetNotRegistered`. The leading-underscore naming convention signals this is an initialiser function._

#### Parameters

| Name     | Type      | Description                                                     |
| -------- | --------- | --------------------------------------------------------------- |
| \_pauses | address[] | Initial array of external pause contract addresses to register. |

### isExternalPause

```solidity
function isExternalPause(address _pause) external view returns (bool)
```

Checks whether an address is present in the external pause list.

#### Parameters

| Name    | Type    | Description       |
| ------- | ------- | ----------------- |
| \_pause | address | Address to check. |

#### Returns

| Name | Type | Description                                                               |
| ---- | ---- | ------------------------------------------------------------------------- |
| \_0  | bool | True if the address is a listed external pause contract, false otherwise. |

### removeExternalPause

```solidity
function removeExternalPause(address _pause) external nonpayable returns (bool success_)
```

Removes an external pause contract from the list.

_Requires `ROLE_PAUSE_MANAGER` and the token to be unpaused. Reverts with `UnlistedPause` if the address is not listed. Emits `RemovedFromExternalPauses`._

#### Parameters

| Name    | Type    | Description                                       |
| ------- | ------- | ------------------------------------------------- |
| \_pause | address | Address of the external pause contract to remove. |

#### Returns

| Name      | Type | Description                                    |
| --------- | ---- | ---------------------------------------------- |
| success\_ | bool | True if the contract was removed successfully. |

### updateExternalPauses

```solidity
function updateExternalPauses(address[] _pauses, bool[] _actives) external nonpayable returns (bool success_)
```

Adds or removes multiple external pause contracts in a single transaction.

_Requires `ROLE_PAUSE_MANAGER` and the token to be unpaused. Both arrays must have the same length and contain no duplicate addresses, validated by `ArrayValidation.checkUniqueValues`. Emits `ExternalPausesUpdated`._

#### Parameters

| Name      | Type      | Description                                                                   |
| --------- | --------- | ----------------------------------------------------------------------------- |
| \_pauses  | address[] | Array of external pause contract addresses to process.                        |
| \_actives | bool[]    | Corresponding flags; `true` adds the address to the list, `false` removes it. |

#### Returns

| Name      | Type | Description                                      |
| --------- | ---- | ------------------------------------------------ |
| success\_ | bool | True if the batch update completed successfully. |

## Events

### AddedToExternalPauses

```solidity
event AddedToExternalPauses(address indexed operator, address pause)
```

Emitted when an external pause contract is added to the list.

#### Parameters

| Name               | Type    | Description                                            |
| ------------------ | ------- | ------------------------------------------------------ |
| operator `indexed` | address | Address of the caller who performed the addition.      |
| pause              | address | Address of the external pause contract that was added. |

### ExternalPauseInitialized

```solidity
event ExternalPauseInitialized(address[] pauses)
```

Emitted once when the external pause capability is initialised on a token.

_Fires exclusively from `initializeExternalPauses` after the storage write succeeds._

#### Parameters

| Name   | Type      | Description |
| ------ | --------- | ----------- |
| pauses | address[] | undefined   |

### ExternalPausesUpdated

```solidity
event ExternalPausesUpdated(address indexed operator, address[] pauses, bool[] actives)
```

Emitted when multiple external pause addresses are added or removed in a single batch.

#### Parameters

| Name               | Type      | Description                                                                |
| ------------------ | --------- | -------------------------------------------------------------------------- |
| operator `indexed` | address   | Address of the caller who performed the update.                            |
| pauses             | address[] | Array of external pause contract addresses that were processed.            |
| actives            | bool[]    | Corresponding activation flags; `true` means added, `false` means removed. |

### RemovedFromExternalPauses

```solidity
event RemovedFromExternalPauses(address indexed operator, address pause)
```

Emitted when an external pause contract is removed from the list.

#### Parameters

| Name               | Type    | Description                                              |
| ------------------ | ------- | -------------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the removal.         |
| pause              | address | Address of the external pause contract that was removed. |

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

### ExternalPausesNotUpdated

```solidity
error ExternalPausesNotUpdated(address[] pauses, bool[] actives)
```

Thrown when a batch update of external pauses fails to complete.

#### Parameters

| Name    | Type      | Description                                                     |
| ------- | --------- | --------------------------------------------------------------- |
| pauses  | address[] | Array of external pause contract addresses that were submitted. |
| actives | bool[]    | Corresponding activation flags that were submitted.             |

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

### ListedPause

```solidity
error ListedPause(address pause)
```

Thrown when attempting to add an address already present in the external pause list.

#### Parameters

| Name  | Type    | Description                                    |
| ----- | ------- | ---------------------------------------------- |
| pause | address | The duplicate external pause contract address. |

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

### UnlistedPause

```solidity
error UnlistedPause(address pause)
```

Thrown when attempting to remove an address not present in the external pause list.

#### Parameters

| Name  | Type    | Description                                   |
| ----- | ------- | --------------------------------------------- |
| pause | address | The unlisted external pause contract address. |

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
