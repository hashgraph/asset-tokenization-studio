# ERC20VotesFacet

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
function delegate(address _delegatee) external nonpayable
```

_Requires the system to be operational, activated, and not paused._

#### Parameters

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| \_delegatee | address | undefined   |

### delegates

```solidity
function delegates(address _account) external view returns (address)
```

_Returns the delegate that `account` has chosen._

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| \_account | address | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### getPastTotalSupply

```solidity
function getPastTotalSupply(uint256 _timepoint) external view returns (uint256)
```

_Returns the total supply of votes available at a specific moment in the past. If the `clock()` is configured to use block numbers, this will return the value at the end of the corresponding block. NOTE: This value is the sum of all available votes, which is not necessarily the sum of all delegated votes. Votes that have not been delegated are still part of total supply, even though they would not participate in a vote._

#### Parameters

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| \_timepoint | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### getPastVotes

```solidity
function getPastVotes(address _account, uint256 _timepoint) external view returns (uint256)
```

_Returns the amount of votes that `account` had at a specific moment in the past. If the `clock()` is configured to use block numbers, this will return the value at the end of the corresponding block._

#### Parameters

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| \_account   | address | undefined   |
| \_timepoint | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

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

### getVotes

```solidity
function getVotes(address _account) external view returns (uint256)
```

_Returns the current amount of votes that `account` has._

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| \_account | address | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### initializeERC20Votes

```solidity
function initializeERC20Votes(bool _activated) external nonpayable
```

_Requires DEFAULT_ADMIN_ROLE and rejects repeated facet registration._

#### Parameters

| Name        | Type | Description |
| ----------- | ---- | ----------- |
| \_activated | bool | undefined   |

### isActivated

```solidity
function isActivated() external view returns (bool)
```

Returns whether vote delegation functionality is active.

_Reads the activation flag from ERC20VotesStorageWrapper without mutating state._

#### Returns

| Name | Type | Description                                                     |
| ---- | ---- | --------------------------------------------------------------- |
| \_0  | bool | True if ERC20Votes functionality is activated, false otherwise. |

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

### BrokenClockMode

```solidity
error BrokenClockMode()
```

Raised when the clock mode is broken

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

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

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
