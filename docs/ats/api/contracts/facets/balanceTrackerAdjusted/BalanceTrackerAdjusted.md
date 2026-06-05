# BalanceTrackerAdjusted

> BalanceTrackerAdjusted

Abstract implementation of `IBalanceTrackerAdjusted` providing historical, timestamp-parameterised balance queries with non-triggered adjustment simulation.

_Delegates storage reads to `ERC1410StorageWrapper.balanceOfAdjustedAt`. Intended to be inherited by `BalanceTrackerAdjustedFacet`._

## Methods

### balanceOfAt

```solidity
function balanceOfAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256)
```

Returns the total token balance of a token holder at a given timestamp, simulating non-triggered balance adjustments up to that point in time.

#### Parameters

| Name          | Type    | Description                                           |
| ------------- | ------- | ----------------------------------------------------- |
| \_tokenHolder | address | The address of the token holder.                      |
| \_timestamp   | uint256 | The Unix timestamp at which the balance is evaluated. |

#### Returns

| Name | Type    | Description                                                     |
| ---- | ------- | --------------------------------------------------------------- |
| \_0  | uint256 | The adjusted total balance of the token holder at `_timestamp`. |

### initializeBalanceTrackerAdjusted

```solidity
function initializeBalanceTrackerAdjusted() external nonpayable
```

Initialises the adjusted balance tracker capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### BalanceTrackerAdjustedInitialized

```solidity
event BalanceTrackerAdjustedInitialized()
```

Emitted once when the adjusted balance tracker capability is initialised on a token.

_Fires exclusively from `initializeBalanceTrackerAdjusted` after the storage write succeeds._

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
