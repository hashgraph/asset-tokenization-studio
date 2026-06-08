# IAdjustBalances

_Asset Tokenization Studio Team_

> IAdjustBalances

Interface for immediate balance adjustment corporate actions on tokenised assets.

_Balance adjustments multiply every token holder&#39;s balance by `factor / 10^decimals`. Immediate adjustments execute synchronously. Scheduled adjustments are handled by the `IScheduledBalanceAdjustment` interface and facet._

## Methods

### adjustBalances

```solidity
function adjustBalances(uint256 factor, uint8 decimals) external nonpayable returns (bool success_)
```

Applies a balance adjustment to all token holders immediately.

_Caller must hold `ROLE_ADJUSTMENT_BALANCE`. The token must not be paused and `factor` must be non-zero. Pending scheduled tasks at index 0 are triggered before the adjustment is applied, ensuring consistent ordering._

#### Parameters

| Name     | Type    | Description                                                          |
| -------- | ------- | -------------------------------------------------------------------- |
| factor   | uint256 | Numerator of the multiplier; effective ratio = factor / 10^decimals. |
| decimals | uint8   | Denominator exponent.                                                |

#### Returns

| Name      | Type | Description                                           |
| --------- | ---- | ----------------------------------------------------- |
| success\_ | bool | True if the adjustment was applied without reverting. |

### initializeBalanceAdjustments

```solidity
function initializeBalanceAdjustments() external nonpayable
```

Initialises the balance adjustment capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### triggerAndSyncAll

```solidity
function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external nonpayable
```

Triggers pending scheduled tasks and synchronises the balance snapshot for a transfer pair.

_Delegates to `TokenCoreOps.triggerAndSyncAll`. Must be called before any token transfer that should reflect the latest adjustment state. The token must not be paused._

#### Parameters

| Name        | Type    | Description                                       |
| ----------- | ------- | ------------------------------------------------- |
| \_partition | bytes32 | Partition identifier of the transfer.             |
| \_from      | address | Sender address whose snapshot is synchronised.    |
| \_to        | address | Recipient address whose snapshot is synchronised. |

## Events

### AdjustmentBalanceSet

```solidity
event AdjustmentBalanceSet(address indexed operator, uint256 factor, uint8 decimals)
```

Emitted when an immediate balance adjustment is applied.

#### Parameters

| Name               | Type    | Description                                                   |
| ------------------ | ------- | ------------------------------------------------------------- |
| operator `indexed` | address | Address that triggered the adjustment.                        |
| factor             | uint256 | Numerator of the adjustment ratio.                            |
| decimals           | uint8   | Denominator exponent; effective ratio = factor / 10^decimals. |

### BalanceAdjustmentsInitialized

```solidity
event BalanceAdjustmentsInitialized()
```

Emitted once when the balance adjustment capability is initialised on a token.

_Fires exclusively from `initializeBalanceAdjustments` after the storage write succeeds._

## Errors

### DecimalsOverflow

```solidity
error DecimalsOverflow()
```

Reverts when the cumulative decimals shift would overflow `uint8`.

### FactorIsZero

```solidity
error FactorIsZero()
```

Reverts when `factor` is zero, which would zero-out all holder balances.

### FactorOverflow

```solidity
error FactorOverflow()
```

Reverts when the proposed factor would overflow the cumulative ABAF.

### TotalSupplyOverflow

```solidity
error TotalSupplyOverflow()
```

Reverts when the proposed factor would overflow the projected total supply.
