# SnapshotsByPartitionFacet

_Asset Tokenization Studio Team_

> SnapshotsByPartitionFacet

Diamond facet exposing the partition-level snapshot query surface.

_Registers one selector: partitionsOfAtSnapshot. All business logic is provided by the {SnapshotsByPartition} abstract contract._

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
