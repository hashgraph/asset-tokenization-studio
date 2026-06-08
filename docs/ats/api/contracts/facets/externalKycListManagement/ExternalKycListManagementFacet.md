# ExternalKycListManagementFacet

_Asset Tokenization Studio Team_

> ExternalKycListManagementFacet

Diamond facet that exposes external KYC list management operations — initialisation, batch updates, individual add/remove, membership checks, KYC grant evaluation, and pagination — as selectable proxy functions.

_Inherits `ExternalKycListManagement` for the business logic and implements `IStaticFunctionSelectors` for the Diamond resolver pattern. The resolver key `RESOLVER_KEY_EXTERNAL_KYC_LIST` identifies this facet within the diamond proxy._

## Methods

### addExternalKycList

```solidity
function addExternalKycList(address _kycLists) external nonpayable returns (bool success_)
```

Adds an external KYC list contract to the list.

_Requires `ROLE_KYC_MANAGER`, the token to be unpaused, and a non-zero address. Reverts with `ListedKycList` if the address is already listed. Emits `AddedToExternalKycLists`._

#### Parameters

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| \_kycLists | address | undefined   |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the contract was added successfully. |

### getExternalKycListsCount

```solidity
function getExternalKycListsCount() external view returns (uint256 externalKycListsCount_)
```

Returns the total number of external KYC list contracts in the list.

#### Returns

| Name                    | Type    | Description                                               |
| ----------------------- | ------- | --------------------------------------------------------- |
| externalKycListsCount\_ | uint256 | The current number of listed external KYC list contracts. |

### getExternalKycListsMembers

```solidity
function getExternalKycListsMembers(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

Returns a paginated slice of the external KYC list contract list.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the list length.\*

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name      | Type      | Description                                                           |
| --------- | --------- | --------------------------------------------------------------------- |
| members\_ | address[] | Array of external KYC list contract addresses for the requested page. |

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

### initializeExternalKycLists

```solidity
function initializeExternalKycLists(address[] _kycLists) external nonpayable
```

One-time initialiser that populates the external KYC list at token deployment.

_Can only be called once; subsequent calls revert via `onlyFacetNotRegistered`. The leading-underscore naming convention signals this is an initialiser function._

#### Parameters

| Name       | Type      | Description                                                        |
| ---------- | --------- | ------------------------------------------------------------------ |
| \_kycLists | address[] | Initial array of external KYC list contract addresses to register. |

### isExternalKycList

```solidity
function isExternalKycList(address _kycList) external view returns (bool)
```

Checks whether an address is present in the external KYC list.

#### Parameters

| Name      | Type    | Description       |
| --------- | ------- | ----------------- |
| \_kycList | address | Address to check. |

#### Returns

| Name | Type | Description                                                                  |
| ---- | ---- | ---------------------------------------------------------------------------- |
| \_0  | bool | True if the address is a listed external KYC list contract, false otherwise. |

### isExternallyGranted

```solidity
function isExternallyGranted(address _account, enum IKyc.KycStatus _kycStatus) external view returns (bool)
```

Checks whether an account holds the requested KYC status across all listed external KYC list contracts.

_Iterates every listed external KYC provider and calls `getKycStatus`. Returns `true` only when all providers confirm the exact `_kycStatus` for `_account` (AND semantics across providers). Returns `true` when no providers are listed._

#### Parameters

| Name        | Type                | Description                                                  |
| ----------- | ------------------- | ------------------------------------------------------------ |
| \_account   | address             | Address of the account whose KYC status is being evaluated.  |
| \_kycStatus | enum IKyc.KycStatus | The `IKyc.KycStatus` value that every provider must confirm. |

#### Returns

| Name | Type | Description                                                                        |
| ---- | ---- | ---------------------------------------------------------------------------------- |
| \_0  | bool | True if all listed providers confirm `_kycStatus` for `_account`, false otherwise. |

### removeExternalKycList

```solidity
function removeExternalKycList(address _kycLists) external nonpayable returns (bool success_)
```

Removes an external KYC list contract from the list.

_Requires `ROLE_KYC_MANAGER` and the token to be unpaused. Reverts with `UnlistedKycList` if the address is not listed. Emits `RemovedFromExternalKycLists`._

#### Parameters

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| \_kycLists | address | undefined   |

#### Returns

| Name      | Type | Description                                    |
| --------- | ---- | ---------------------------------------------- |
| success\_ | bool | True if the contract was removed successfully. |

### updateExternalKycLists

```solidity
function updateExternalKycLists(address[] _kycLists, bool[] _actives) external nonpayable returns (bool success_)
```

Adds or removes multiple external KYC list contracts in a single transaction.

_Requires `ROLE_KYC_MANAGER` and the token to be unpaused. Both arrays must have the same length and contain no duplicate addresses, validated by `ArrayValidation.checkUniqueValues`. Reverts with `ExternalKycListsNotUpdated` on failure. Emits `ExternalKycListsUpdated`._

#### Parameters

| Name       | Type      | Description                                                                   |
| ---------- | --------- | ----------------------------------------------------------------------------- |
| \_kycLists | address[] | Array of external KYC list contract addresses to process.                     |
| \_actives  | bool[]    | Corresponding flags; `true` adds the address to the list, `false` removes it. |

#### Returns

| Name      | Type | Description                                      |
| --------- | ---- | ------------------------------------------------ |
| success\_ | bool | True if the batch update completed successfully. |

## Events

### AddedToExternalKycLists

```solidity
event AddedToExternalKycLists(address indexed operator, address kycList)
```

Emitted when an external KYC list contract is added to the list.

#### Parameters

| Name               | Type    | Description                                               |
| ------------------ | ------- | --------------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the addition.         |
| kycList            | address | Address of the external KYC list contract that was added. |

### ExternalKycListInitialized

```solidity
event ExternalKycListInitialized(address[] kycLists)
```

Emitted once when the external KYC list capability is initialised on a token.

_Fires exclusively from `initializeExternalKycLists` after the storage write succeeds._

#### Parameters

| Name     | Type      | Description |
| -------- | --------- | ----------- |
| kycLists | address[] | undefined   |

### ExternalKycListsUpdated

```solidity
event ExternalKycListsUpdated(address indexed operator, address[] kycLists, bool[] actives)
```

Emitted when multiple external KYC list addresses are added or removed in a single batch.

#### Parameters

| Name               | Type      | Description                                                                |
| ------------------ | --------- | -------------------------------------------------------------------------- |
| operator `indexed` | address   | Address of the caller who performed the update.                            |
| kycLists           | address[] | Array of external KYC list contract addresses that were processed.         |
| actives            | bool[]    | Corresponding activation flags; `true` means added, `false` means removed. |

### RemovedFromExternalKycLists

```solidity
event RemovedFromExternalKycLists(address indexed operator, address kycList)
```

Emitted when an external KYC list contract is removed from the list.

#### Parameters

| Name               | Type    | Description                                                 |
| ------------------ | ------- | ----------------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the removal.            |
| kycList            | address | Address of the external KYC list contract that was removed. |

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

### ExternalKycListsNotUpdated

```solidity
error ExternalKycListsNotUpdated(address[] kycList, bool[] actives)
```

Thrown when a batch update of external KYC lists fails to complete.

#### Parameters

| Name    | Type      | Description                                                        |
| ------- | --------- | ------------------------------------------------------------------ |
| kycList | address[] | Array of external KYC list contract addresses that were submitted. |
| actives | bool[]    | Corresponding activation flags that were submitted.                |

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

### ListedKycList

```solidity
error ListedKycList(address kycList)
```

Thrown when attempting to add an address already present in the external KYC list.

#### Parameters

| Name    | Type    | Description                                       |
| ------- | ------- | ------------------------------------------------- |
| kycList | address | The duplicate external KYC list contract address. |

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

### UnlistedKycList

```solidity
error UnlistedKycList(address kycList)
```

Thrown when attempting to remove an address not present in the external KYC list.

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| kycList | address | The unlisted external KYC list contract address. |

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
