# IERC20Votes

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

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| \_account | address | undefined   |
| \_pos     | uint256 | undefined   |

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
function delegate(address delegatee) external nonpayable
```

_Delegates votes from the sender to `delegatee`._

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| delegatee | address | undefined   |

### delegates

```solidity
function delegates(address account) external view returns (address)
```

_Returns the delegate that `account` has chosen._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| account | address | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### getPastTotalSupply

```solidity
function getPastTotalSupply(uint256 timepoint) external view returns (uint256)
```

_Returns the total supply of votes available at a specific moment in the past. If the `clock()` is configured to use block numbers, this will return the value at the end of the corresponding block. NOTE: This value is the sum of all available votes, which is not necessarily the sum of all delegated votes. Votes that have not been delegated are still part of total supply, even though they would not participate in a vote._

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| timepoint | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### getPastVotes

```solidity
function getPastVotes(address account, uint256 timepoint) external view returns (uint256)
```

_Returns the amount of votes that `account` had at a specific moment in the past. If the `clock()` is configured to use block numbers, this will return the value at the end of the corresponding block._

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| account   | address | undefined   |
| timepoint | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### getVotes

```solidity
function getVotes(address account) external view returns (uint256)
```

_Returns the current amount of votes that `account` has._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| account | address | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### initializeERC20Votes

```solidity
function initializeERC20Votes(bool _activated) external nonpayable
```

#### Parameters

| Name        | Type | Description |
| ----------- | ---- | ----------- |
| \_activated | bool | undefined   |

### isActivated

```solidity
function isActivated() external view returns (bool)
```

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### numCheckpoints

```solidity
function numCheckpoints(address _account) external view returns (uint256)
```

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| \_account | address | undefined   |

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

| Name      | Type | Description |
| --------- | ---- | ----------- |
| activated | bool | undefined   |

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
