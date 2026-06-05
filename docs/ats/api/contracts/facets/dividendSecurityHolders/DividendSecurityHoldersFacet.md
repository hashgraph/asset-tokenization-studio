# DividendSecurityHoldersFacet

_Asset Tokenization Studio Team_

> DividendSecurityHoldersFacet

Diamond facet exposing the read-only dividend holder queries (`getDividendHolders`, `getTotalDividendHolders`) under `RESOLVER_KEY_DIVIDEND_SECURITY_HOLDERS`.

_Inherits the implementation from `DividendSecurityHolders` and satisfies `IStaticFunctionSelectors` so the Diamond resolver can register the two selectors. Carries no initializer — the facet has no storage of its own; dividend state is maintained by `DividendStorageWrapper` and bootstrapped through the writer facet._

## Methods

### getDividendHolders

```solidity
function getDividendHolders(uint256 dividendId, uint256 pageIndex, uint256 pageLength) external view returns (address[] holders_)
```

Returns the page of holder addresses eligible for a given dividend.

_Reverts through `onlyMatchingActionType` if `dividendId` does not match the dividend corporate action type at index `dividendId - 1`._

#### Parameters

| Name       | Type    | Description                                                                |
| ---------- | ------- | -------------------------------------------------------------------------- |
| dividendId | uint256 | One-indexed dividend identifier within the dividend corporate action type. |
| pageIndex  | uint256 | Zero-based index of the page to retrieve.                                  |
| pageLength | uint256 | Maximum number of holders returned in the page.                            |

#### Returns

| Name      | Type      | Description                                               |
| --------- | --------- | --------------------------------------------------------- |
| holders\_ | address[] | Holder addresses on the requested page, in storage order. |

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

### getTotalDividendHolders

```solidity
function getTotalDividendHolders(uint256 dividendId) external view returns (uint256)
```

Returns the total number of holders eligible for a given dividend.

_Reverts through `onlyMatchingActionType` if `dividendId` does not match the dividend corporate action type at index `dividendId - 1`._

#### Parameters

| Name       | Type    | Description                                                                |
| ---------- | ------- | -------------------------------------------------------------------------- |
| dividendId | uint256 | One-indexed dividend identifier within the dividend corporate action type. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Total number of eligible holders. |

### initializeDividendSecurityHolders

```solidity
function initializeDividendSecurityHolders() external nonpayable
```

Initialises the dividend security holders capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### DividendSecurityHoldersInitialized

```solidity
event DividendSecurityHoldersInitialized()
```

Emitted once when the dividend security holders capability is initialised on a token.

_Fires exclusively from `initializeDividendSecurityHolders`._

## Errors

### AccessControlRequired

```solidity
error AccessControlRequired(bytes32 role, address sender)
```

_Emitted when a role check fails_

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| role   | bytes32 | undefined   |
| sender | address | undefined   |

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

### SnapshotIdDoesNotExists

```solidity
error SnapshotIdDoesNotExists(uint256 snapshotId)
```

Thrown when the requested snapshot identifier has never been taken on this token.

#### Parameters

| Name       | Type    | Description                                             |
| ---------- | ------- | ------------------------------------------------------- |
| snapshotId | uint256 | The unrecognised snapshot identifier that was supplied. |

### SnapshotIdNull

```solidity
error SnapshotIdNull()
```

Thrown when a snapshot identifier of zero is supplied; zero is reserved and never assigned to a valid snapshot.

### WrongIndexForAction

```solidity
error WrongIndexForAction(uint256 index, bytes32 actionType)
```

Thrown when a type-scoped index does not correspond to an existing action.

#### Parameters

| Name       | Type    | Description                                            |
| ---------- | ------- | ------------------------------------------------------ |
| index      | uint256 | The out-of-range index that was provided.              |
| actionType | bytes32 | The action type against which the index was validated. |
