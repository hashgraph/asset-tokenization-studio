# BatchFreezeFacet

_Asset Tokenization Studio Team_

> BatchFreezeFacet

Diamond facet that exposes batch freeze and unfreeze operations through the `IBatchFreeze` interface, registered under `RESOLVER_KEY_BATCH_FREEZE`.

_Inherits batch logic from `BatchFreeze` and satisfies the `IStaticFunctionSelectors` contract required by the Diamond proxy for selector registration. Exposes three selectors: `batchSetAddressFrozen`, `batchFreezePartialTokens`, and `batchUnfreezePartialTokens`._

## Methods

### batchFreezePartialTokens

```solidity
function batchFreezePartialTokens(address[] _userAddresses, uint256[] _amounts) external nonpayable
```

Batch freezes partial tokens for multiple addresses.

_Emits `IFreeze.TokensFrozen` for each address. Token must be unpaused._

#### Parameters

| Name            | Type      | Description                                                                                                              |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| \_userAddresses | address[] | Array of addresses to freeze tokens for.                                                                                 |
| \_amounts       | uint256[] | Corresponding token amounts to freeze. Must be the same length as `_userAddresses`. Only works in single-partition mode. |

### batchSetAddressFrozen

```solidity
function batchSetAddressFrozen(address[] _userAddresses, bool[] _freeze) external nonpayable
```

Batch freezes or unfreezes multiple addresses.

_Emits `IFreeze.AddressFrozen` for each address. Only callable by `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`. Token must be unpaused._

#### Parameters

| Name            | Type      | Description                                                                                              |
| --------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| \_userAddresses | address[] | Array of addresses to freeze/unfreeze.                                                                   |
| \_freeze        | bool[]    | Array of freeze statuses (true = freeze, false = unfreeze). Must be the same length as `_userAddresses`. |

### batchUnfreezePartialTokens

```solidity
function batchUnfreezePartialTokens(address[] _userAddresses, uint256[] _amounts) external nonpayable
```

Batch unfreezes partial tokens for multiple addresses.

_Emits `IFreeze.TokensUnfrozen` for each address. Token must be unpaused._

#### Parameters

| Name            | Type      | Description                                                                                                                |
| --------------- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| \_userAddresses | address[] | Array of addresses to unfreeze tokens for.                                                                                 |
| \_amounts       | uint256[] | Corresponding token amounts to unfreeze. Must be the same length as `_userAddresses`. Only works in single-partition mode. |

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

### initializeBatchFreeze

```solidity
function initializeBatchFreeze() external nonpayable
```

Initialises the batch freeze capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

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

### BatchFreezeInitialized

```solidity
event BatchFreezeInitialized()
```

Emitted once when the batch freeze capability is initialised on a token.

_Fires exclusively from `initializeBatchFreeze` after the storage write succeeds._

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

### InputAmountsArrayLengthMismatch

```solidity
error InputAmountsArrayLengthMismatch()
```

Thrown when the lengths of two input amount arrays do not match.

### InputBoolArrayLengthMismatch

```solidity
error InputBoolArrayLengthMismatch()
```

Thrown when the lengths of two input boolean arrays do not match.

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
