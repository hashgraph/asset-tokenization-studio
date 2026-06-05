# IPartitions

_Asset Tokenization Studio Team_

> IPartitions

Interface exposing the partition-discovery accessors required by the ERC-1410 surface.

_Hosts the read-only `partitionsOf` and `isMultiPartition` getters. Implementations are expected to be pure passthroughs onto the underlying ERC-1410 storage and therefore impose no additional access-control or pause guarantees._

## Methods

### initializePartitions

```solidity
function initializePartitions(bool _multiPartition) external nonpayable
```

Initialises the partitions capability on the token and sets multi-partition mode.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

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
