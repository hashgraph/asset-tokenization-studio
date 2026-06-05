# TransferAndLockByPartitionFacet

_Asset Tokenization Studio Team_

> TransferAndLockByPartitionFacet

Diamond facet that exposes the partition-aware transfer-and-lock operation via `ITransferAndLockByPartition`, registered under `RESOLVER_KEY_TRANSFER_AND_LOCK_BY_PARTITION`.

_Exposes 1 selector: `transferAndLockByPartition`. Inherits the implementation from `TransferAndLockByPartition` and satisfies `IStaticFunctionSelectors` for Diamond proxy selector registration._

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

### initializeTransferAndLockByPartition

```solidity
function initializeTransferAndLockByPartition() external nonpayable
```

Initialises the transfer-and-lock-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### transferAndLockByPartition

```solidity
function transferAndLockByPartition(bytes32 _partition, address _to, uint256 _amount, bytes _data, uint256 _expirationTimestamp) external nonpayable returns (uint256 lockId_)
```

Transfers `_amount` tokens from the caller&#39;s `_partition` balance to `_to` and locks them until `_expirationTimestamp`.

_Callers must hold `ROLE_LOCKER`. The token must be unpaused and `_expirationTimestamp` must be in the future. In single-partition mode only the default partition is permitted; protected partitions require the wildcard role. Emits `PartitionTransferredAndLocked`, `TransferByPartition` (via `ERC1410StorageWrapper`), and `Transfer` (via `ERC1410StorageWrapper`)._

#### Parameters

| Name                  | Type    | Description                                                   |
| --------------------- | ------- | ------------------------------------------------------------- |
| \_partition           | bytes32 | The partition from which tokens are transferred and locked.   |
| \_to                  | address | The recipient of the transferred and locked tokens.           |
| \_amount              | uint256 | The amount of tokens to transfer and lock.                    |
| \_data                | bytes   | Additional data forwarded to the recipient.                   |
| \_expirationTimestamp | uint256 | Unix timestamp until which the transferred tokens are locked. |

#### Returns

| Name     | Type    | Description                                                        |
| -------- | ------- | ------------------------------------------------------------------ |
| lockId\_ | uint256 | Identifier assigned to the resulting lock for `(_partition, _to)`. |

## Events

### PartitionTransferredAndLocked

```solidity
event PartitionTransferredAndLocked(bytes32 indexed partition, address indexed from, address to, uint256 value, bytes data, uint256 expirationTimestamp, uint256 lockId)
```

Emitted when tokens are transferred to a recipient on a partition and locked until a future timestamp.

#### Parameters

| Name                | Type    | Description                                              |
| ------------------- | ------- | -------------------------------------------------------- |
| partition `indexed` | bytes32 | The partition on which the transfer and lock occurred.   |
| from `indexed`      | address | The address from which tokens were transferred.          |
| to                  | address | The address to which tokens were transferred and locked. |
| value               | uint256 | The amount of tokens transferred and locked.             |
| data                | bytes   | Additional data provided by the caller.                  |
| expirationTimestamp | uint256 | Unix timestamp at which the lock expires.                |
| lockId              | uint256 | Identifier assigned to the resulting lock.               |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
```

Emitted whenever tokens move between accounts, are minted, or are burned.

#### Parameters

| Name           | Type    | Description                                 |
| -------------- | ------- | ------------------------------------------- |
| from `indexed` | address | Source account (zero address on mint).      |
| to `indexed`   | address | Destination account (zero address on burn). |
| value          | uint256 | Amount of tokens transferred.               |

### TransferAndLockByPartitionInitialized

```solidity
event TransferAndLockByPartitionInitialized()
```

Emitted once when the transfer-and-lock-by-partition capability is initialised on a token.

_Fires exclusively from `initializeTransferAndLockByPartition`._

### TransferByPartition

```solidity
event TransferByPartition(bytes32 indexed _fromPartition, address _operator, address indexed _from, address indexed _to, uint256 _value, bytes _data, bytes _operatorData)
```

#### Parameters

| Name                      | Type    | Description |
| ------------------------- | ------- | ----------- |
| \_fromPartition `indexed` | bytes32 | undefined   |
| \_operator                | address | undefined   |
| \_from `indexed`          | address | undefined   |
| \_to `indexed`            | address | undefined   |
| \_value                   | uint256 | undefined   |
| \_data                    | bytes   | undefined   |
| \_operatorData            | bytes   | undefined   |

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

### InsufficientBalance

```solidity
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition)
```

Thrown when a transfer or redemption is attempted with insufficient partition balance.

#### Parameters

| Name      | Type    | Description                            |
| --------- | ------- | -------------------------------------- |
| account   | address | The account whose balance was checked. |
| balance   | uint256 | The actual balance available.          |
| value     | uint256 | The amount that was requested.         |
| partition | bytes32 | The partition that was checked.        |

### InvalidLockAmount

```solidity
error InvalidLockAmount()
```

Reverts when a lock creation is attempted with a zero amount.

_Checked at the start of `LockStorageWrapper.lockByPartition`, which is the single entry point shared by both `Lock.lock` and `LockByPartition.lockByPartition`._

### InvalidPartition

```solidity
error InvalidPartition(address account, bytes32 partition)
```

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| account   | address | undefined   |
| partition | bytes32 | undefined   |

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

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

### WrongExpirationTimestamp

```solidity
error WrongExpirationTimestamp()
```

Reverts when an expiration timestamp is invalid.

_Used for expired, past, or otherwise unacceptable expiration values._
