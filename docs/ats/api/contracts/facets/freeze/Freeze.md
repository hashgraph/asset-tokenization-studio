# Freeze

_Asset Tokenization Studio Team_

> Freeze

Abstract contract implementing address and partial token freeze logic for a security token. Supports both address-level freezing (blocking all operations) and amount-level freezing (locking a specific token balance).

_Implements `IFreeze`. Freeze state is delegated to `ERC3643StorageWrapper`. Partial freeze/unfreeze operations are restricted to single-partition tokens via the `onlyWithoutMultiPartition` modifier. All mutating functions require `ROLE_FREEZE_MANAGER` or `ROLE_AGENT` via `onlyFreezeRoles`. `getFrozenTokens` delegates timestamp resolution to `EvmAccessors` so the same code path is exercisable in test environments. Intended to be inherited exclusively by `FreezeFacet`._

## Methods

### freezePartialTokens

```solidity
function freezePartialTokens(address _userAddress, uint256 _amount) external nonpayable
```

Freezes a specific amount of tokens for a wallet, reducing its liquid balance.

_Requires `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`, the token to be unpaused, a non-zero non-recovered address, and a single-partition token (`onlyWithoutMultiPartition`). Updates balance snapshots before mutating frozen state. Emits `TokensFrozen` with the default partition._

#### Parameters

| Name          | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| \_userAddress | address | The address whose tokens are to be frozen. |
| \_amount      | uint256 | The amount of tokens to freeze.            |

### getFrozenTokens

```solidity
function getFrozenTokens(address _userAddress) external view returns (uint256)
```

Returns the total amount of tokens currently frozen for a wallet.

#### Parameters

| Name          | Type    | Description           |
| ------------- | ------- | --------------------- |
| \_userAddress | address | The address to query. |

#### Returns

| Name | Type    | Description                                                             |
| ---- | ------- | ----------------------------------------------------------------------- |
| \_0  | uint256 | The total frozen token amount for `_userAddress` across all partitions. |

### initializeFreeze

```solidity
function initializeFreeze() external nonpayable
```

Initialises the freeze capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### isFrozen

```solidity
function isFrozen(address _userAddress) external view returns (bool)
```

Returns the freezing status of a wallet.

_returning true mean that some token or all of them are frozen_

#### Parameters

| Name          | Type    | Description                                            |
| ------------- | ------- | ------------------------------------------------------ |
| \_userAddress | address | The address of the wallet on which isFrozen is called. |

#### Returns

| Name | Type | Description                      |
| ---- | ---- | -------------------------------- |
| \_0  | bool | The freezing status of a wallet. |

### setAddressFrozen

```solidity
function setAddressFrozen(address _userAddress, bool _freezStatus) external nonpayable
```

Sets the address-level frozen status for a wallet, blocking or restoring all token operations for that address.

_Requires `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`, the token to be unpaused, and a non-zero non-recovered address. Not restricted to single-partition tokens. Emits `AddressFrozen`._

#### Parameters

| Name          | Type    | Description                                       |
| ------------- | ------- | ------------------------------------------------- |
| \_userAddress | address | The address whose frozen status is to be updated. |
| \_freezStatus | bool    | undefined                                         |

### unfreezePartialTokens

```solidity
function unfreezePartialTokens(address _userAddress, uint256 _amount) external nonpayable
```

Unfreezes a specific amount of previously frozen tokens for a wallet, restoring them to the liquid balance.

_Requires `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`, the token to be unpaused, a non-zero non-recovered address, and a single-partition token (`onlyWithoutMultiPartition`). Validates that `_amount` does not exceed the currently frozen balance. Updates balance snapshots before mutating frozen state. Emits `TokensUnfrozen` with the default partition._

#### Parameters

| Name          | Type    | Description                                  |
| ------------- | ------- | -------------------------------------------- |
| \_userAddress | address | The address whose tokens are to be unfrozen. |
| \_amount      | uint256 | The amount of tokens to unfreeze.            |

## Events

### AddressFrozen

```solidity
event AddressFrozen(address indexed userAddress, bool indexed isFrozen, address indexed owner)
```

Emitted when a wallet&#39;s address-level frozen status changes.

#### Parameters

| Name                  | Type    | Description                                                         |
| --------------------- | ------- | ------------------------------------------------------------------- |
| userAddress `indexed` | address | The wallet address whose freeze status was updated.                 |
| isFrozen `indexed`    | bool    | The new freeze status; `true` means frozen, `false` means unfrozen. |
| owner `indexed`       | address | Address of the agent who triggered the status change.               |

### DelegateVotesChanged

```solidity
event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)
```

Emitted when delegate votes change due to balance changes

#### Parameters

| Name               | Type    | Description                      |
| ------------------ | ------- | -------------------------------- |
| delegate `indexed` | address | The delegate whose votes changed |
| previousBalance    | uint256 | The previous vote balance        |
| newBalance         | uint256 | The new vote balance             |

### FreezeInitialized

```solidity
event FreezeInitialized()
```

Emitted once when the freeze capability is initialised on a token.

_Fires exclusively from `initializeFreeze`._

### TokensFrozen

```solidity
event TokensFrozen(address indexed account, uint256 amount, bytes32 partition)
```

Emitted when a specific amount of tokens is frozen for a wallet.

#### Parameters

| Name              | Type    | Description                                  |
| ----------------- | ------- | -------------------------------------------- |
| account `indexed` | address | The wallet address whose tokens were frozen. |
| amount            | uint256 | The amount of tokens frozen.                 |
| partition         | bytes32 | The partition from which tokens were frozen. |

### TokensUnfrozen

```solidity
event TokensUnfrozen(address indexed account, uint256 amount, bytes32 partition)
```

Emitted when a specific amount of previously frozen tokens is unfrozen for a wallet.

#### Parameters

| Name              | Type    | Description                                    |
| ----------------- | ------- | ---------------------------------------------- |
| account `indexed` | address | The wallet address whose tokens were unfrozen. |
| amount            | uint256 | The amount of tokens unfrozen.                 |
| partition         | bytes32 | The partition to which tokens were restored.   |

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

### TransferByPartition

```solidity
event TransferByPartition(bytes32 indexed fromPartition, address operator, address indexed from, address indexed to, uint256 value, bytes data, bytes operatorData)
```

Emitted when tokens are transferred from one partition to another or within the same partition.

#### Parameters

| Name                    | Type    | Description                           |
| ----------------------- | ------- | ------------------------------------- |
| fromPartition `indexed` | bytes32 | Source partition.                     |
| operator                | address | Address that initiated the transfer.  |
| from `indexed`          | address | Token holder whose balance decreased. |
| to `indexed`            | address | Recipient whose balance increased.    |
| value                   | uint256 | Token quantity transferred.           |
| data                    | bytes   | Caller-supplied data.                 |
| operatorData            | bytes   | Operator-supplied data.               |

## Errors

### AbafChangeForBlockForbidden

```solidity
error AbafChangeForBlockForbidden(uint256 blockNumber)
```

Raised when attempting to change ABAF for a block that is forbidden

#### Parameters

| Name        | Type    | Description                        |
| ----------- | ------- | ---------------------------------- |
| blockNumber | uint256 | The block number that is forbidden |

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

### InsufficientFrozenBalance

```solidity
error InsufficientFrozenBalance(address user, uint256 requestedUnfreeze, uint256 availableFrozen, bytes32 partition)
```

Thrown when an unfreeze request exceeds the address&#39;s available frozen balance.

#### Parameters

| Name              | Type    | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| user              | address | Address whose frozen balance was checked.          |
| requestedUnfreeze | uint256 | Amount the caller attempted to unfreeze.           |
| availableFrozen   | uint256 | Actual frozen balance available for unfreezing.    |
| partition         | bytes32 | Partition on which the frozen balance was checked. |

### InvalidFreezeAmount

```solidity
error InvalidFreezeAmount()
```

Reverts when a partial token freeze is attempted with a zero amount.

_Checked at the start of `ERC3643StorageWrapper.freezeTokens`, the entry point for partial token freezes. Freezing zero tokens is semantically invalid and rejected early._

### InvalidPartition

```solidity
error InvalidPartition(address account, bytes32 partition)
```

Thrown when an account does not hold or is not associated with the specified partition.

#### Parameters

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| account   | address | Address that was checked.                     |
| partition | bytes32 | Partition that was not found for the account. |

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### NotAllowedInMultiPartitionMode

```solidity
error NotAllowedInMultiPartitionMode()
```

Thrown when a single-partition operation is attempted on a multi-partition token.

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

### UnexpectedError

```solidity
error UnexpectedError(bytes4 _errorId)
```

Reverts when an unreachable validation state is detected.

_Replaces assertions for defensive handling of logically impossible states._

#### Parameters

| Name      | Type   | Description                                        |
| --------- | ------ | -------------------------------------------------- |
| \_errorId | bytes4 | Identifier of the unexpected validation condition. |

### UnrecognizedResolverProxyVersion

```solidity
error UnrecognizedResolverProxyVersion(bytes8 _resolverProxyVersion)
```

Thrown when the provided proxy version does not match any BLR compatible standard.

#### Parameters

| Name                   | Type   | Description                                        |
| ---------------------- | ------ | -------------------------------------------------- |
| \_resolverProxyVersion | bytes8 | proxy version that is not compatible with the BLR. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
