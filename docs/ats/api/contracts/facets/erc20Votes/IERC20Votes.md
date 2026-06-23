# IERC20Votes

_Asset Tokenization Studio Team_

> IERC20Votes

Interface for the ERC-20 Votes extension that enables on-chain governance delegation and checkpoint-based vote tracking.

## Methods

### CLOCK_MODE

```solidity
function CLOCK_MODE() external view returns (string)
```

_Description of the clock_

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | string | undefined   |

### checkpoints

```solidity
function checkpoints(address _account, uint256 _pos) external view returns (struct Checkpoints.Checkpoint)
```

Returns the checkpoint at a given position for an account&#39;s vote history.

#### Parameters

| Name      | Type    | Description                                               |
| --------- | ------- | --------------------------------------------------------- |
| \_account | address | Address whose checkpoint history is queried.              |
| \_pos     | uint256 | Zero-based index into the account&#39;s checkpoint array. |

#### Returns

| Name | Type                   | Description |
| ---- | ---------------------- | ----------- |
| \_0  | Checkpoints.Checkpoint | undefined   |

### clock

```solidity
function clock() external view returns (uint48)
```

_Clock used for flagging checkpoints. Can be overridden to implement timestamp based checkpoints (and voting)._

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | uint48 | undefined   |

### delegate

```solidity
function delegate(address _delegatee) external nonpayable
```

Delegates the caller&#39;s voting power to `delegatee`.

_Delegates votes from the sender to `delegatee`._

#### Parameters

| Name        | Type    | Description                                              |
| ----------- | ------- | -------------------------------------------------------- |
| \_delegatee | address | Address that will receive the caller&#39;s voting power. |

### delegates

```solidity
function delegates(address _account) external view returns (address)
```

Returns the delegate address that `account` has chosen.

_Returns the delegate that `account` has chosen._

#### Parameters

| Name      | Type    | Description                               |
| --------- | ------- | ----------------------------------------- |
| \_account | address | Address whose chosen delegate is queried. |

#### Returns

| Name | Type    | Description                                  |
| ---- | ------- | -------------------------------------------- |
| \_0  | address | Address of the delegate chosen by `account`. |

### getPastTotalSupply

```solidity
function getPastTotalSupply(uint256 _timepoint) external view returns (uint256)
```

Returns the total vote supply available at a past `timepoint`.

_Returns the total supply of votes available at a specific moment in the past. If the `clock()` is configured to use block numbers, this will return the value at the end of the corresponding block. NOTE: This value is the sum of all available votes, which is not necessarily the sum of all delegated votes. Votes that have not been delegated are still part of total supply, even though they would not participate in a vote._

#### Parameters

| Name        | Type    | Description                                                      |
| ----------- | ------- | ---------------------------------------------------------------- |
| \_timepoint | uint256 | Block number or timestamp at which the total supply is resolved. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Total vote supply at `timepoint`. |

### getPastVotes

```solidity
function getPastVotes(address _account, uint256 _timepoint) external view returns (uint256)
```

Returns the vote weight of `account` at a past `timepoint`.

_Returns the amount of votes that `account` had at a specific moment in the past. If the `clock()` is configured to use block numbers, this will return the value at the end of the corresponding block._

#### Parameters

| Name        | Type    | Description                                                |
| ----------- | ------- | ---------------------------------------------------------- |
| \_account   | address | Address whose historical vote weight is queried.           |
| \_timepoint | uint256 | Block number or timestamp at which the weight is resolved. |

#### Returns

| Name | Type    | Description                              |
| ---- | ------- | ---------------------------------------- |
| \_0  | uint256 | Vote weight of `account` at `timepoint`. |

### getVotes

```solidity
function getVotes(address _account) external view returns (uint256)
```

Returns the current vote weight of `account`.

_Returns the current amount of votes that `account` has._

#### Parameters

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| \_account | address | Address whose current vote weight is queried. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Current vote weight of `account`. |

### initializeERC20Votes

```solidity
function initializeERC20Votes(bool _activated) external nonpayable
```

Initialises the ERC-20Votes capability on the token.

#### Parameters

| Name        | Type | Description                                                       |
| ----------- | ---- | ----------------------------------------------------------------- |
| \_activated | bool | Whether the voting feature should be active after initialisation. |

### isActivated

```solidity
function isActivated() external view returns (bool)
```

Returns whether the ERC-20Votes voting feature is currently active.

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### numCheckpoints

```solidity
function numCheckpoints(address _account) external view returns (uint256)
```

Returns the total number of vote checkpoints recorded for an account.

#### Parameters

| Name      | Type    | Description                                |
| --------- | ------- | ------------------------------------------ |
| \_account | address | Address whose checkpoint count is queried. |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

## Events

### DelegateChanged

```solidity
event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)
```

Emitted when an account changes their delegate

#### Parameters

| Name                   | Type    | Description                               |
| ---------------------- | ------- | ----------------------------------------- |
| delegator `indexed`    | address | The account that changed their delegation |
| fromDelegate `indexed` | address | The previous delegate address             |
| toDelegate `indexed`   | address | The new delegate address                  |

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

### ERC20VotesInitialized

```solidity
event ERC20VotesInitialized(bool activated)
```

Emitted once when the ERC-20Votes capability is initialised on a token.

_Fires exclusively from `initializeERC20Votes` after the storage write succeeds._

#### Parameters

| Name      | Type | Description                                                     |
| --------- | ---- | --------------------------------------------------------------- |
| activated | bool | Whether the ERC-20Votes feature is active after initialisation. |

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

### BrokenClockMode

```solidity
error BrokenClockMode()
```

Raised when the clock mode is broken

### FutureLookup

```solidity
error FutureLookup(uint256 timepoint, uint256 currentClock)
```

Raised when querying past votes or supply with a future timepoint

#### Parameters

| Name         | Type    | Description                    |
| ------------ | ------- | ------------------------------ |
| timepoint    | uint256 | The requested future timepoint |
| currentClock | uint256 | The current clock value        |
