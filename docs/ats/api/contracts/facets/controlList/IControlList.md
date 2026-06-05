# IControlList

_Asset Tokenization Studio Team_

> IControlList

Interface for managing the on-chain control list of a security token. The control list operates in one of two modes set at initialisation: whitelist (only listed addresses may transfer) or blacklist (listed addresses are blocked from transferring).

_Part of the Diamond facet system. Control list state is stored at `STORAGE_LOCATION_CONTROL_LIST` via `ControlListStorageWrapper`. `ROLE_CONTROL_LIST` is required for all state-mutating functions after initialisation. Note that `isInControlList` reflects raw set membership only; effective access is determined by `ControlListStorageWrapper.isAbleToAccess`, which combines the membership result with the `isWhiteList` flag and external control list authorisation._

## Methods

### addToControlList

```solidity
function addToControlList(address _account) external nonpayable returns (bool success_)
```

Adds an address to the control list.

_Requires `ROLE_CONTROL_LIST` and the token to be unpaused. Reverts with `ListedAccount` if the address is already present. Emits `AddedToControlList`._

#### Parameters

| Name      | Type    | Description         |
| --------- | ------- | ------------------- |
| \_account | address | The address to add. |

#### Returns

| Name      | Type | Description                                 |
| --------- | ---- | ------------------------------------------- |
| success\_ | bool | True if the address was successfully added. |

### getControlListCount

```solidity
function getControlListCount() external view returns (uint256 controlListCount_)
```

Returns the total number of addresses currently in the control list.

#### Returns

| Name               | Type    | Description                                |
| ------------------ | ------- | ------------------------------------------ |
| controlListCount\_ | uint256 | The number of entries in the control list. |

### getControlListMembers

```solidity
function getControlListMembers(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

Returns a paginated slice of the addresses in the control list.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the list length.\*

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name      | Type      | Description                                                    |
| --------- | --------- | -------------------------------------------------------------- |
| members\_ | address[] | Array of control list member addresses for the requested page. |

### getControlListType

```solidity
function getControlListType() external view returns (bool)
```

Returns the operating mode of the control list.

#### Returns

| Name | Type | Description                                                          |
| ---- | ---- | -------------------------------------------------------------------- |
| \_0  | bool | True if the control list is a whitelist, false if it is a blacklist. |

### initializeControlList

```solidity
function initializeControlList(bool _isWhiteList) external nonpayable
```

One-time initialiser that sets the control list operating mode.

_Can only be called once; subsequent calls revert via `onlyFacetNotRegistered`. The leading-underscore naming convention signals this is an initialiser function._

#### Parameters

| Name          | Type | Description                                                                                                                     |
| ------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| \_isWhiteList | bool | `true` to operate as a whitelist (only listed addresses allowed), `false` to operate as a blacklist (listed addresses blocked). |

### isInControlList

```solidity
function isInControlList(address _account) external view returns (bool)
```

Checks whether an address is present in the control list set.

_Returns raw set membership regardless of the whitelist/blacklist mode. An address in the set is allowed in whitelist mode and blocked in blacklist mode._

#### Parameters

| Name      | Type    | Description           |
| --------- | ------- | --------------------- |
| \_account | address | The address to query. |

#### Returns

| Name | Type | Description                                                     |
| ---- | ---- | --------------------------------------------------------------- |
| \_0  | bool | True if `_account` is in the control list set, false otherwise. |

### removeFromControlList

```solidity
function removeFromControlList(address _account) external nonpayable returns (bool success_)
```

Removes an address from the control list.

_Requires `ROLE_CONTROL_LIST` and the token to be unpaused. Reverts with `UnlistedAccount` if the address is not present. Emits `RemovedFromControlList`._

#### Parameters

| Name      | Type    | Description            |
| --------- | ------- | ---------------------- |
| \_account | address | The address to remove. |

#### Returns

| Name      | Type | Description                                   |
| --------- | ---- | --------------------------------------------- |
| success\_ | bool | True if the address was successfully removed. |

## Events

### AddedToControlList

```solidity
event AddedToControlList(address indexed operator, address indexed account)
```

Emitted when an account is added to the control list.

#### Parameters

| Name               | Type    | Description                                       |
| ------------------ | ------- | ------------------------------------------------- |
| operator `indexed` | address | Address of the caller who performed the addition. |
| account `indexed`  | address | Address of the account that was added.            |

### ControlListInitialized

```solidity
event ControlListInitialized(bool isWhiteList)
```

Emitted once when the control list capability is initialised on a token.

_Fires exclusively from `initializeControlList` after the storage write succeeds._

#### Parameters

| Name        | Type | Description                                          |
| ----------- | ---- | ---------------------------------------------------- |
| isWhiteList | bool | Whether the control list operates in whitelist mode. |

### RemovedFromControlList

```solidity
event RemovedFromControlList(address indexed operator, address indexed account)
```

Emitted when an account is removed from the control list.

#### Parameters

| Name               | Type    | Description                                      |
| ------------------ | ------- | ------------------------------------------------ |
| operator `indexed` | address | Address of the caller who performed the removal. |
| account `indexed`  | address | Address of the account that was removed.         |

## Errors

### ListedAccount

```solidity
error ListedAccount(address account)
```

Thrown when attempting to add an address that is already present in the control list.

#### Parameters

| Name    | Type    | Description            |
| ------- | ------- | ---------------------- |
| account | address | The duplicate address. |

### UnlistedAccount

```solidity
error UnlistedAccount(address account)
```

Thrown when attempting to remove an address that is not present in the control list.

#### Parameters

| Name    | Type    | Description                     |
| ------- | ------- | ------------------------------- |
| account | address | The address that was not found. |
