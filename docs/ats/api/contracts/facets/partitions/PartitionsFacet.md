# PartitionsFacet

_Asset Tokenization Studio Team_

> PartitionsFacet

Diamond facet exposing partition-discovery accessors via `IPartitions`, registered under `RESOLVER_KEY_PARTITIONS`.

_Exposes 2 selectors: `partitionsOf` and `isMultiPartition`._

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

| Name | Type | Description                                                                         |
| ---- | ---- | ----------------------------------------------------------------------------------- |
| \_0  | bool | True if the token allows multiple partitions to be set and managed; false otherwise |

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

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
