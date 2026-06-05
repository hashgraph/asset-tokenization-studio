# MintByPartition

_Asset Tokenization Studio Team_

> MintByPartition

Abstract implementation of the partition-aware token issuance operation.

_Implements `issueByPartition` on top of `TokenCoreOps`. The entry point enforces the issuer-or-agent access-control matrix, unpaused state, address recovery check, partition validity, per-partition and global supply ceilings, and identity and compliance checks before delegating to the orchestrator library._

## Methods

### initializeMintByPartition

```solidity
function initializeMintByPartition() external nonpayable
```

Initialises the mint-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### issueByPartition

```solidity
function issueByPartition(IERC1410Types.IssueData _issueData) external nonpayable
```

#### Parameters

| Name        | Type                    | Description |
| ----------- | ----------------------- | ----------- |
| \_issueData | IERC1410Types.IssueData | undefined   |

## Events

### MintByPartitionInitialized

```solidity
event MintByPartitionInitialized()
```

Emitted once when the mint-by-partition capability is initialised on a token.

_Fires exclusively from `initializeMintByPartition`._

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

### AccountHasNoRoles

```solidity
error AccountHasNoRoles(address account, bytes32[] roles)
```

Thrown when an account does not hold any of the specified roles.

#### Parameters

| Name    | Type      | Description                       |
| ------- | --------- | --------------------------------- |
| account | address   | The account that lacks the roles. |
| roles   | bytes32[] | The roles that are not held.      |

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

### MaxSupplyReached

```solidity
error MaxSupplyReached(uint256 maxSupply)
```

Thrown when a mint would cause the total supply to exceed the global maximum.

#### Parameters

| Name      | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| maxSupply | uint256 | The current global maximum supply. |

### MaxSupplyReachedForPartition

```solidity
error MaxSupplyReachedForPartition(bytes32 partition, uint256 maxSupply)
```

Thrown when a mint would cause a partition&#39;s total supply to exceed its cap.

#### Parameters

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| partition | bytes32 | The partition whose cap would be exceeded.    |
| maxSupply | uint256 | The current maximum supply for the partition. |

### PartitionNotAllowedInSinglePartitionMode

```solidity
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition)
```

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| partition | bytes32 | undefined   |

### WalletRecovered

```solidity
error WalletRecovered()
```
