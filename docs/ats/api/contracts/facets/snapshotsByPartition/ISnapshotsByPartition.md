# ISnapshotsByPartition

_Asset Tokenization Studio Team_

> ISnapshotsByPartition

Interface for the SnapshotsByPartition facet, exposing partition-level snapshot reads.

## Methods

### initializeSnapshotsByPartition

```solidity
function initializeSnapshotsByPartition() external nonpayable
```

Initialises the snapshots-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### partitionsOfAtSnapshot

```solidity
function partitionsOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (bytes32[])
```

Returns the list of partitions held by an account at the time of a given snapshot.

_Reverts with {SnapshotIdNull} when `_snapshotID` is zero, and with {SnapshotIdDoesNotExists} when the snapshot identifier does not correspond to a previously taken snapshot._

#### Parameters

| Name          | Type    | Description                                                   |
| ------------- | ------- | ------------------------------------------------------------- |
| \_snapshotID  | uint256 | Identifier of the snapshot to query.                          |
| \_tokenHolder | address | Address of the account whose partition list is being queried. |

#### Returns

| Name | Type      | Description                                                                    |
| ---- | --------- | ------------------------------------------------------------------------------ |
| \_0  | bytes32[] | Ordered list of partition identifiers held by `_tokenHolder` at snapshot time. |

## Events

### SnapshotsByPartitionInitialized

```solidity
event SnapshotsByPartitionInitialized()
```

Emitted once when the snapshots-by-partition capability is initialised on a token.

_Fires exclusively from `initializeSnapshotsByPartition`._

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
