# ScheduledTasksDispatchOps

_Asset Tokenization Studio Team_

> ScheduledTasksDispatchOps - External library for isolated scheduled task dispatch

Deployed once as a separate contract. Called via DELEGATECALL. Handles only leaf-task business logic (snapshot, coupon, balance). A revert propagates to the caller, blocking the queue until an authorised caller force-cancels the task. Cross-ordered sub-task routing and all queue storage access live in ScheduledTasksStorageWrapper to avoid circular imports.

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

### SnapshotTriggered

```solidity
event SnapshotTriggered(uint256 snapshotId, bytes metadata)
```

Emitted when a scheduled snapshot is executed.

#### Parameters

| Name       | Type    | Description                                                 |
| ---------- | ------- | ----------------------------------------------------------- |
| snapshotId | uint256 | Identifier assigned to the triggered snapshot.              |
| metadata   | bytes   | Arbitrary metadata associated with the scheduled execution. |

## Errors

### CouponNotFound

```solidity
error CouponNotFound(uint256 couponID)
```

Reverts when a coupon identifier does not resolve to an existing corporate action.

#### Parameters

| Name     | Type    | Description                               |
| -------- | ------- | ----------------------------------------- |
| couponID | uint256 | The coupon identifier that was not found. |

### DecimalsTooLarge

```solidity
error DecimalsTooLarge(uint8 currentDecimals, uint8 newDecimals)
```

Reverts when the difference between current decimals and new decimals exceeds the maximum value.

_Protects decimals amount difference between current and new not te be greater than maximum._

#### Parameters

| Name            | Type  | Description                  |
| --------------- | ----- | ---------------------------- |
| currentDecimals | uint8 | the current decimals amount. |
| newDecimals     | uint8 | the new decimals amount.     |

### GreaterThanMaxUint256

```solidity
error GreaterThanMaxUint256(uint256 amount, uint8 decimals)
```

Reverts when multiplying `amount` by `10 ** decimals` would exceed `uint256` max.

_Thrown by `DecimalsLib.calculateDecimalsAdjustment` when `amount &gt; MAX_UINT256 / 10 ** decimals`._

#### Parameters

| Name     | Type    | Description                                |
| -------- | ------- | ------------------------------------------ |
| amount   | uint256 | The token amount that cannot be scaled up. |
| decimals | uint8   | The exponent that causes the overflow.     |

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
