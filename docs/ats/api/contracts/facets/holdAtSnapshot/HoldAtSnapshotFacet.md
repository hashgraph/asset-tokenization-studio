# HoldAtSnapshotFacet

_Asset Tokenization Studio Team_

> HoldAtSnapshotFacet

Diamond facet that exposes the held-balance-at-snapshot query via `IHoldAtSnapshot`, registered under `RESOLVER_KEY_HOLD_AT_SNAPSHOT`.

_Exposes one selector: `heldBalanceOfAtSnapshot`. Inherits read logic from `HoldAtSnapshot` and satisfies `IStaticFunctionSelectors` for Diamond proxy selector registration._

## Methods

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

### heldBalanceOfAtSnapshot

```solidity
function heldBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the held balance of a token holder at the time of a given snapshot.

_Sums all hold escrow amounts active at `_snapshotID`, adjusted for any balance-adjustment factor recorded at that snapshot timestamp._

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                   |
| --------- | ------- | ------------------------------------------------------------- |
| balance\_ | uint256 | The held balance of `_tokenHolder` recorded at `_snapshotID`. |

### initializeHoldAtSnapshot

```solidity
function initializeHoldAtSnapshot() external nonpayable
```

Initialises the hold-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### HoldAtSnapshotInitialized

```solidity
event HoldAtSnapshotInitialized()
```

Emitted once when the hold-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeHoldAtSnapshot`._

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

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
