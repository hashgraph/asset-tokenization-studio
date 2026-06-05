# SnapshotsFacet

_Asset Tokenization Studio Team_

> SnapshotsFacet

Diamond facet that exposes snapshot creation, scheduling, and historical balance, supply, and partition queries through the `ISnapshots` interface.

_Inherits behaviour from `Snapshots` and satisfies `IStaticFunctionSelectors` for registration in the Diamond proxy under `RESOLVER_KEY_SNAPSHOTS`. Selectors are written into a fixed-size array using pre-decrement indexing inside an `unchecked` block; the declared `selectorIndex` initial value must match the array length._

## Methods

### getScheduledSnapshots

```solidity
function getScheduledSnapshots(uint256 _pageIndex, uint256 _pageLength, bool _includeDisabled) external view returns (struct ScheduledTask[] scheduledSnapshot_)
```

Returns a paginated list of scheduled snapshots.

_Does not mutate state. Pagination bounds are interpreted by the implementation and should be selected to avoid excessive gas in on-chain callers._

#### Parameters

| Name              | Type    | Description                                                                                                                           |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| \_pageIndex       | uint256 | Zero-based page number.                                                                                                               |
| \_pageLength      | uint256 | Maximum number of tasks to return per page.                                                                                           |
| \_includeDisabled | bool    | When true, snapshots belonging to cancelled corporate actions are included; when false, only active scheduled snapshots are returned. |

#### Returns

| Name                | Type            | Description                                              |
| ------------------- | --------------- | -------------------------------------------------------- |
| scheduledSnapshot\_ | ScheduledTask[] | Array of `ScheduledTask` structs for the requested page. |

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

### initializeSnapshots

```solidity
function initializeSnapshots() external nonpayable
```

Initialises the snapshots capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment. Emits `SnapshotsInitialized` after successful registration._

### scheduledSnapshotCount

```solidity
function scheduledSnapshotCount(bool _includeDisabled) external view returns (uint256)
```

Returns the number of snapshots scheduled to run on this asset.

_Does not mutate state and reflects the current scheduled-task registry state._

#### Parameters

| Name              | Type | Description                                                                                                                         |
| ----------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| \_includeDisabled | bool | When true, snapshots belonging to cancelled corporate actions are counted; when false, only active scheduled snapshots are counted. |

#### Returns

| Name | Type    | Description                        |
| ---- | ------- | ---------------------------------- |
| \_0  | uint256 | Count of scheduled snapshot tasks. |

### takeSnapshot

```solidity
function takeSnapshot() external nonpayable returns (uint256 snapshotID_)
```

Creates a snapshot of current balances and total supplies.

_Records a new snapshot identifier and defers per-account and supply writes until the next relevant balance mutation. Implementations may revert if the caller is not authorised. Emits `SnapshotTaken` on success._

#### Returns

| Name         | Type    | Description                                  |
| ------------ | ------- | -------------------------------------------- |
| snapshotID\_ | uint256 | Identifier assigned to the created snapshot. |

## Events

### SnapshotTaken

```solidity
event SnapshotTaken(address indexed operator, uint256 indexed snapshotID)
```

Emitted when an operator creates a new snapshot.

#### Parameters

| Name                 | Type    | Description                                   |
| -------------------- | ------- | --------------------------------------------- |
| operator `indexed`   | address | Account that initiated the snapshot creation. |
| snapshotID `indexed` | uint256 | Identifier assigned to the created snapshot.  |

### SnapshotTriggered

```solidity
event SnapshotTriggered(uint256 snapshotId, bytes metadata)
```

Emitted when a scheduled snapshot is executed.

#### Parameters

| Name       | Type    | Description                                                 |
| ---------- | ------- | ----------------------------------------------------------- |
| snapshotId | uint256 | Identifier assigned to the triggered snapshot.              |
| metadata   | bytes   | Arbitrary metadata associated with the scheduled execution. |

### SnapshotsInitialized

```solidity
event SnapshotsInitialized()
```

Emitted once when the snapshots capability is initialised on a token.

_Fires exclusively from `initializeSnapshots`._

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
