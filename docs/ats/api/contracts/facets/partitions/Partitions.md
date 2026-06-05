# Partitions

_Asset Tokenization Studio Team_

> Partitions

Abstract implementation of `IPartitions`, exposing the one-shot `initializePartitions` initialiser and the partition-discovery accessors (`partitionsOf`, `isMultiPartition`) backed by ERC-1410 storage.

_Delegates the initialiser write and the reads to {ERC1410StorageWrapper}. Intended to be inherited by `PartitionsFacet`._

## Methods

### initializePartitions

```solidity
function initializePartitions(bool _multiPartition) external nonpayable
```

Initialises the partitions capability on the token and sets multi-partition mode.

_Writes the multi-partition flag to ERC-1410 storage, marks the facet ready, and emits `PartitionsInitialized`. One-shot is enforced by `onlyFacetNotRegistered`._

#### Parameters

| Name             | Type | Description                                                       |
| ---------------- | ---- | ----------------------------------------------------------------- |
| \_multiPartition | bool | When `true`, the token accepts partitions other than the default. |

### isMultiPartition

```solidity
function isMultiPartition() external view returns (bool)
```

Indicates whether the token operates in multi-partition mode.

#### Returns

| Name | Type | Description                                                                                                                        |
| ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| \_0  | bool | true : the token allows multiple partitions to be set and managed. false : the token contains only one partition, the default one. |

### partitionsOf

```solidity
function partitionsOf(address _tokenHolder) external view returns (bytes32[])
```

Use to get the list of partitions `_tokenHolder` is associated with.

#### Parameters

| Name          | Type    | Description                                            |
| ------------- | ------- | ------------------------------------------------------ |
| \_tokenHolder | address | An address corresponds whom partition list is queried. |

#### Returns

| Name | Type      | Description         |
| ---- | --------- | ------------------- |
| \_0  | bytes32[] | List of partitions. |

## Events

### PartitionsInitialized

```solidity
event PartitionsInitialized(bool multiPartition)
```

Emitted once when the partitions capability is initialised on a token.

_Fires exclusively from `initializePartitions`._

#### Parameters

| Name           | Type | Description                                         |
| -------------- | ---- | --------------------------------------------------- |
| multiPartition | bool | Whether the token operates in multi-partition mode. |

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
