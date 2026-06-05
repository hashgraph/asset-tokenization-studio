# VotingFacet

> VotingFacet

Concrete implementation of voting rights management facet

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

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL`; gated by `onlyOperational`, `onlyUnpaused`, and `onlyMatchingActionType(CORPORATE_ACTION_TYPE_VOTING_RIGHTS, _voteId - 1)`._

#### Parameters

| Name     | Type    | Description                          |
| -------- | ------- | ------------------------------------ |
| \_voteId | uint256 | The ID of the voting to force-cancel |

#### Returns

| Name      | Type | Description                                   |
| --------- | ---- | --------------------------------------------- |
| success\_ | bool | Whether the force-cancellation was successful |

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

### InvalidTimestamp

```solidity
error InvalidTimestamp()
```

Reverts when a timestamp value is invalid.

_Used for shared timestamp validation that is not tied to expiration._

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

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

### WrongIndexForAction

```solidity
error WrongIndexForAction(uint256 index, bytes32 actionType)
```

Thrown when a type-scoped index does not correspond to an existing action.

#### Parameters

| Name       | Type    | Description                                            |
| ---------- | ------- | ------------------------------------------------------ |
| index      | uint256 | The out-of-range index that was provided.              |
| actionType | bytes32 | The action type against which the index was validated. |
