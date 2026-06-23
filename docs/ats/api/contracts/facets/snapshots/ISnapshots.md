# ISnapshots

_Asset Tokenization Studio Team_

> Snapshots Interface

Defines the external API for token balance and supply snapshot management.

_Extends `ISnapshotsTypes` and exposes initialisation, immediate snapshot creation, and scheduled snapshot inspection. Implementations are expected to preserve snapshot identifiers as stable historical references for downstream features._

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
