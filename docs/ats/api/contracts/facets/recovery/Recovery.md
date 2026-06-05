# Recovery

_Asset Tokenization Studio Team_

> Recovery

Abstract contract implementing lost-wallet recovery logic.

_Delegates storage reads and writes to {ERC3643StorageWrapper}. Inherits all access-control and partition-validation modifiers from {Modifiers}._

## Methods

### initializeRecovery

```solidity
function initializeRecovery() external nonpayable
```

Initialises the recovery capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### isAddressRecovered

```solidity
function isAddressRecovered(address _wallet) external view returns (bool)
```

Returns whether a wallet address has been marked as recovered.

#### Parameters

| Name     | Type    | Description       |
| -------- | ------- | ----------------- |
| \_wallet | address | Address to query. |

#### Returns

| Name | Type | Description                                                                |
| ---- | ---- | -------------------------------------------------------------------------- |
| \_0  | bool | `true` if the address has previously been recovered via {recoveryAddress}. |

### recoveryAddress

```solidity
function recoveryAddress(address _lostWallet, address _newWallet, address _investorOnchainID) external nonpayable returns (bool success_)
```

Transfers the token balance and frozen amounts of a lost wallet to a new wallet, marking the lost wallet as recovered.

_Caller must hold `ROLE_AGENT`. The lost wallet must not have already been recovered, must carry no pending locks, holds, or clearings, and the token must be single-partition. Emits {RecoverySuccess} on success._

#### Parameters

| Name                | Type    | Description                                                       |
| ------------------- | ------- | ----------------------------------------------------------------- |
| \_lostWallet        | address | Address of the wallet that was lost.                              |
| \_newWallet         | address | Address of the replacement wallet that will receive the balances. |
| \_investorOnchainID | address | On-chain identity address of the investor (may be zero address).  |

#### Returns

| Name      | Type | Description                                      |
| --------- | ---- | ------------------------------------------------ |
| success\_ | bool | `true` when the recovery completes successfully. |

## Events

### AgentAdded

```solidity
event AgentAdded(address indexed _agent)
```

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| \_agent `indexed` | address | undefined   |

### AgentRemoved

```solidity
event AgentRemoved(address indexed _agent)
```

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| \_agent `indexed` | address | undefined   |

### ComplianceAdded

```solidity
event ComplianceAdded(address indexed compliance)
```

#### Parameters

| Name                 | Type    | Description |
| -------------------- | ------- | ----------- |
| compliance `indexed` | address | undefined   |

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

### IdentityRegistryAdded

```solidity
event IdentityRegistryAdded(address indexed identityRegistry)
```

#### Parameters

| Name                       | Type    | Description |
| -------------------------- | ------- | ----------- |
| identityRegistry `indexed` | address | undefined   |

### RecoveryInitialized

```solidity
event RecoveryInitialized()
```

Emitted once when the recovery capability is initialised on a token.

_Fires exclusively from `initializeRecovery`._

### RecoverySuccess

```solidity
event RecoverySuccess(address _lostWallet, address _newWallet, address _investorOnchainID)
```

#### Parameters

| Name                | Type    | Description |
| ------------------- | ------- | ----------- |
| \_lostWallet        | address | undefined   |
| \_newWallet         | address | undefined   |
| \_investorOnchainID | address | undefined   |

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

### UpdatedTokenInformation

```solidity
event UpdatedTokenInformation(string indexed newName, string indexed newSymbol, uint8 newDecimals, string newVersion, address indexed newOnchainID)
```

#### Parameters

| Name                   | Type    | Description |
| ---------------------- | ------- | ----------- |
| newName `indexed`      | string  | undefined   |
| newSymbol `indexed`    | string  | undefined   |
| newDecimals            | uint8   | undefined   |
| newVersion             | string  | undefined   |
| newOnchainID `indexed` | address | undefined   |

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

### AddressNotVerified

```solidity
error AddressNotVerified()
```

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

### CannotRecoverWallet

```solidity
error CannotRecoverWallet()
```

### ComplianceCallFailed

```solidity
error ComplianceCallFailed()
```

### ComplianceNotAllowed

```solidity
error ComplianceNotAllowed()
```

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

### IdentityRegistryCallFailed

```solidity
error IdentityRegistryCallFailed()
```

### InputAmountsArrayLengthMismatch

```solidity
error InputAmountsArrayLengthMismatch()
```

### InputBoolArrayLengthMismatch

```solidity
error InputBoolArrayLengthMismatch()
```

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

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| user              | address | undefined   |
| requestedUnfreeze | uint256 | undefined   |
| availableFrozen   | uint256 | undefined   |
| partition         | bytes32 | undefined   |

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

### NotAllowedInMultiPartitionMode

```solidity
error NotAllowedInMultiPartitionMode()
```

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

### TokenHolderNotFound

```solidity
error TokenHolderNotFound(address tokenHolder)
```

#### Parameters

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| tokenHolder | address | undefined   |

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
