# BurnByPartition

_Asset Tokenization Studio Team_

> BurnByPartition

Abstract implementation of the partition-aware token redemption operation.

_Implements `redeemByPartition` on top of `TokenCoreOps`. Enforces unpaused state, partition validity (single-partition mode), protected-partition and wildcard-role checks, and redemption authorization before delegating to the orchestrator library. Intended to be inherited by `BurnByPartitionFacet`._

## Methods

### initializeBurnByPartition

```solidity
function initializeBurnByPartition() external nonpayable
```

Initialises the burn by partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### redeemByPartition

```solidity
function redeemByPartition(bytes32 _partition, uint256 _value, bytes _data) external nonpayable
```

Decreases totalSupply and the corresponding amount of the specified partition of msg.sender

_Only callable when not paused. In single-partition mode only the default partition is accepted. The caller must pass redemption authorization checks for the given partition and amount._

#### Parameters

| Name        | Type    | Description                                |
| ----------- | ------- | ------------------------------------------ |
| \_partition | bytes32 | The partition from which to redeem tokens  |
| \_value     | uint256 | The amount of tokens to redeem             |
| \_data      | bytes   | Additional data attached to the redemption |

## Events

### BurnByPartitionInitialized

```solidity
event BurnByPartitionInitialized()
```

Emitted once when the burn by partition capability is initialised on a token.

_Fires exclusively from `initializeBurnByPartition`._

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

### PartitionNotAllowedInSinglePartitionMode

```solidity
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition)
```

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| partition | bytes32 | undefined   |

### PartitionsAreProtectedAndNoRole

```solidity
error PartitionsAreProtectedAndNoRole(address account, bytes32 role)
```

Reverts when a transfer is attempted while partitions are protected and the caller does not hold the required partition role.

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| account | address | The caller lacking the required role.            |
| role    | bytes32 | The role that would have been needed to proceed. |
