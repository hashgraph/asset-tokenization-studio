# IVoting

_Asset Tokenization Studio Team_

> IVoting

Interface for voting rights management functionality

## Methods

### cancelVoting

```solidity
function cancelVoting(uint256 _voteId) external nonpayable returns (bool success_)
```

Cancels an existing voting

#### Parameters

| Name     | Type    | Description                          |
| -------- | ------- | ------------------------------------ |
| \_voteId | uint256 | The ID of the voting to be cancelled |

#### Returns

| Name      | Type | Description                             |
| --------- | ---- | --------------------------------------- |
| success\_ | bool | Whether the cancellation was successful |

### forceCancelVoting

```solidity
function forceCancelVoting(uint256 _voteId) external nonpayable returns (bool success_)
```

Force-cancels a voting regardless of its record date

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL` and gated by the operational, unpaused state and `onlyMatchingActionType`. Marks the corporate action disabled unconditionally — bypasses `VotingAlreadyRecorded` — and emits `VotingForceCancelled`._

#### Parameters

| Name     | Type    | Description                          |
| -------- | ------- | ------------------------------------ |
| \_voteId | uint256 | The ID of the voting to force-cancel |

#### Returns

| Name      | Type | Description                                   |
| --------- | ---- | --------------------------------------------- |
| success\_ | bool | Whether the force-cancellation was successful |

### getVoting

```solidity
function getVoting(uint256 _voteID) external view returns (struct IVotingTypes.RegisteredVoting registeredVoting_, bool isDisabled_)
```

Retrieves a registered voting by its ID

#### Parameters

| Name     | Type    | Description                      |
| -------- | ------- | -------------------------------- |
| \_voteID | uint256 | The ID of the voting to retrieve |

#### Returns

| Name               | Type                          | Description                    |
| ------------------ | ----------------------------- | ------------------------------ |
| registeredVoting\_ | IVotingTypes.RegisteredVoting | The registered voting data     |
| isDisabled\_       | bool                          | Whether the voting is disabled |

### getVotingCount

```solidity
function getVotingCount() external view returns (uint256 votingCount_)
```

Retrieves the total number of votings

#### Returns

| Name          | Type    | Description                |
| ------------- | ------- | -------------------------- |
| votingCount\_ | uint256 | The total count of votings |

### getVotingFor

```solidity
function getVotingFor(uint256 _voteID, address _account) external view returns (struct IVotingTypes.VotingFor votingFor_)
```

Retrieves voting information for a specific account and voting ID

_Return value includes user balance at voting record date_

#### Parameters

| Name      | Type    | Description          |
| --------- | ------- | -------------------- |
| \_voteID  | uint256 | The ID of the voting |
| \_account | address | The account address  |

#### Returns

| Name        | Type                   | Description                                  |
| ----------- | ---------------------- | -------------------------------------------- |
| votingFor\_ | IVotingTypes.VotingFor | Voting information for the specified account |

### initializeVoting

```solidity
function initializeVoting() external nonpayable
```

Initialises the voting capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### setVoting

```solidity
function setVoting(IVotingTypes.Voting _newVoting) external nonpayable returns (uint256 voteID_)
```

#### Parameters

| Name        | Type                | Description |
| ----------- | ------------------- | ----------- |
| \_newVoting | IVotingTypes.Voting | undefined   |

#### Returns

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| voteID\_ | uint256 | undefined   |

## Events

### VotingCancelled

```solidity
event VotingCancelled(uint256 voteId, address indexed operator)
```

Emitted when a voting is cancelled

#### Parameters

| Name               | Type    | Description                                          |
| ------------------ | ------- | ---------------------------------------------------- |
| voteId             | uint256 | The ID of the cancelled voting                       |
| operator `indexed` | address | The address of the operator who cancelled the voting |

### VotingForceCancelled

```solidity
event VotingForceCancelled(uint256 voteId, address indexed operator)
```

Emitted when an admin force-cancels a voting, bypassing date guards

#### Parameters

| Name               | Type    | Description                                                |
| ------------------ | ------- | ---------------------------------------------------------- |
| voteId             | uint256 | The ID of the force-cancelled voting                       |
| operator `indexed` | address | The address of the operator who force-cancelled the voting |

### VotingInitialized

```solidity
event VotingInitialized()
```

Emitted once when the voting capability is initialised on a token.

_Fires exclusively from `initializeVoting`._

### VotingSet

```solidity
event VotingSet(bytes32 corporateActionId, uint256 voteId, address indexed operator, uint256 indexed recordDate, bytes data)
```

Emitted when a voting is set

#### Parameters

| Name                 | Type    | Description                                    |
| -------------------- | ------- | ---------------------------------------------- |
| corporateActionId    | bytes32 | The ID of the corporate action                 |
| voteId               | uint256 | The ID of the voting                           |
| operator `indexed`   | address | The address of the operator who set the voting |
| recordDate `indexed` | uint256 | The voting record date                         |
| data                 | bytes   | The voting payload                             |

## Errors

### VotingAlreadyRecorded

```solidity
error VotingAlreadyRecorded(bytes32 corporateActionId, uint256 voteId)
```

Raised when attempting to cancel a voting that has already been recorded

#### Parameters

| Name              | Type    | Description                    |
| ----------------- | ------- | ------------------------------ |
| corporateActionId | bytes32 | The ID of the corporate action |
| voteId            | uint256 | The ID of the voting           |

### VotingRightsCreationFailed

```solidity
error VotingRightsCreationFailed()
```

Raised when voting rights creation fails
