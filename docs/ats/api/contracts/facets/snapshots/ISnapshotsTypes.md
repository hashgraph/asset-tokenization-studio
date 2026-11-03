# ISnapshotsTypes

_Asset Tokenization Studio Team_

> ISnapshotsTypes

Shared error types for snapshot-domain facets.

_Imported by both ISnapshots and ISnapshotsByPartition so the error selectors remain canonical and are never redeclared across interfaces._

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
