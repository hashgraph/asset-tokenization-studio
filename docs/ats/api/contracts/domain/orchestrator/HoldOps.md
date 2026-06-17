# HoldOps

_Asset Tokenization Studio Team_

> HoldOps

Orchestrator library for hold lifecycle operations on partitioned balances.

_Deployed once and invoked via `delegatecall` from hold facets so facet bytecode stays within EIP-170. Each entry forwards to the corresponding {HoldStorageWrapper} helper, which performs the actual storage mutations, balance accounting, snapshot updates and event emissions._

## Events

### Approval

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value)
```

Emitted when `owner` authorises `spender` to spend up to `value` tokens on their behalf, whether via {IAllowance.approve}, {IAllowance.increaseAllowance} or {IAllowance.decreaseAllowance}.

_Mirrors the ERC-20 `Approval` event. `value` is the resulting, absolute allowance after the update — not the delta applied._

#### Parameters

| Name              | Type    | Description                                                        |
| ----------------- | ------- | ------------------------------------------------------------------ |
| owner `indexed`   | address | Address whose tokens may be spent.                                 |
| spender `indexed` | address | Address authorised to spend on `owner`&#39;s behalf.               |
| value             | uint256 | Allowance of `spender` over `owner`&#39;s tokens after the update. |

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

### AccountIsBlocked

```solidity
error AccountIsBlocked(address account)
```

Reverts when an operation targets or is requested by a blocked account.

_The blocking policy is enforced by the domain that performs the check._

#### Parameters

| Name    | Type    | Description                                  |
| ------- | ------- | -------------------------------------------- |
| account | address | Account rejected by the blocking validation. |

### ExpiredDeadline

```solidity
error ExpiredDeadline(uint256 deadline)
```

Reverts when a signed payload is submitted after its deadline.

_The caller must provide and validate deadlines before accepting the signed operation._

#### Parameters

| Name     | Type    | Description                                     |
| -------- | ------- | ----------------------------------------------- |
| deadline | uint256 | Expired deadline carried by the signed payload. |

### HoldExpirationNotReached

```solidity
error HoldExpirationNotReached()
```

Reverts when a reclaim is attempted before the hold&#39;s expiration timestamp.

### HoldExpirationReached

```solidity
error HoldExpirationReached()
```

Reverts when an operation requires an unexpired hold but the hold has expired.

### InsufficientAllowance

```solidity
error InsufficientAllowance(address spender, address from)
```

Reverts when `spender` attempts to consume more allowance than `from` has granted.

_Raised by `transferFrom`-style flows and by {IAllowance.decreaseAllowance} when the subtracted amount exceeds the current allowance._

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| spender | address | Address attempting to spend on behalf of `from`. |
| from    | address | Address whose allowance is being consumed.       |

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

### InsufficientHoldBalance

```solidity
error InsufficientHoldBalance(uint256 holdAmount, uint256 amount)
```

Reverts when the requested release amount exceeds the hold&#39;s remaining balance.

#### Parameters

| Name       | Type    | Description            |
| ---------- | ------- | ---------------------- |
| holdAmount | uint256 | The amount still held. |
| amount     | uint256 | The amount requested.  |

### InvalidDestinationAddress

```solidity
error InvalidDestinationAddress(address holdDestination, address to)
```

Reverts when the recipient supplied to {executeHoldByPartition} mismatches the hold.

#### Parameters

| Name            | Type    | Description                                 |
| --------------- | ------- | ------------------------------------------- |
| holdDestination | address | The recipient stored on the hold.           |
| to              | address | The recipient supplied to the execute call. |

### InvalidHoldAmount

```solidity
error InvalidHoldAmount()
```

Reverts when a hold is created with a zero or otherwise invalid amount.

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

### IsNotEscrow

```solidity
error IsNotEscrow()
```

Reverts when a caller that is not the recorded escrow attempts to execute the hold.

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

Thrown when an operation targets a token holder address that has no registered balance.

#### Parameters

| Name        | Type    | Description                     |
| ----------- | ------- | ------------------------------- |
| tokenHolder | address | The address that was not found. |

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

### WrongNonce

```solidity
error WrongNonce(uint256 nonce, address account)
```

Reverts when a nonce does not match the expected value for an account.

_Protects signed operations against replay and out-of-order execution._

#### Parameters

| Name    | Type    | Description                                     |
| ------- | ------- | ----------------------------------------------- |
| nonce   | uint256 | Nonce supplied by the caller or signed payload. |
| account | address | Account for which the nonce validation failed.  |

### WrongSignature

```solidity
error WrongSignature()
```

Reverts when a signature fails verification.

_Applies to shared signature validation flows, including EIP-712 payloads and partition-based signatures._

### WrongSignatureLength

```solidity
error WrongSignatureLength()
```

Reverts when a signature payload has an invalid byte length.

_Used before signature recovery or verification to reject malformed input._
