# IBalanceTrackerAdjusted

> IBalanceTrackerAdjusted

Interface for querying historical token balances at a specific timestamp, simulating non-triggered balance adjustments up to that point in time.

_Reads are delegated to `ERC1410StorageWrapper.balanceOfAdjustedAt`. The timestamp is caller-supplied, enabling point-in-time balance reconstruction._

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
