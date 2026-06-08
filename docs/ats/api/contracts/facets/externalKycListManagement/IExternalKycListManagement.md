# IExternalKycListManagement

_Asset Tokenization Studio Team_

> IExternalKycListManagement

Interface for managing external KYC list contracts on a security token. External KYC lists are trusted third-party contracts consulted during KYC verification: an account&#39;s KYC status is considered externally valid only when every listed provider confirms the requested status.

_Part of the Diamond facet system. `ROLE_KYC_MANAGER` is required for all state-mutating functions after initialisation. The external KYC list and its initialisation flag are stored in diamond storage at `STORAGE_LOCATION_KYC_MANAGEMENT` via `ExternalListManagementStorageWrapper`._

## Methods

### addExternalKycList

```solidity
function addExternalKycList(address _kycList) external nonpayable returns (bool success_)
```

Adds an external KYC list contract to the list.

_Requires `ROLE_KYC_MANAGER`, the token to be unpaused, and a non-zero address. Reverts with `ListedKycList` if the address is already listed. Emits `AddedToExternalKycLists`._

#### Parameters

| Name      | Type    | Description                                       |
| --------- | ------- | ------------------------------------------------- |
| \_kycList | address | Address of the external KYC list contract to add. |

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
function removeExternalKycList(address _kycList) external nonpayable returns (bool success_)
```

Removes an external KYC list contract from the list.

_Requires `ROLE_KYC_MANAGER` and the token to be unpaused. Reverts with `UnlistedKycList` if the address is not listed. Emits `RemovedFromExternalKycLists`._

#### Parameters

| Name      | Type    | Description                                          |
| --------- | ------- | ---------------------------------------------------- |
| \_kycList | address | Address of the external KYC list contract to remove. |

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

### ListedKycList

```solidity
error ListedKycList(address kycList)
```

Thrown when attempting to add an address already present in the external KYC list.

#### Parameters

| Name    | Type    | Description                                       |
| ------- | ------- | ------------------------------------------------- |
| kycList | address | The duplicate external KYC list contract address. |

### UnlistedKycList

```solidity
error UnlistedKycList(address kycList)
```

Thrown when attempting to remove an address not present in the external KYC list.

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| kycList | address | The unlisted external KYC list contract address. |
