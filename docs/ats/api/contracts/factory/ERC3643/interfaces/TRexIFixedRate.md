# TRexIFixedRate

_Asset Tokenization Studio Team_

> IFixedRate

Interface for managing a token&#39;s fixed interest rate — its value and decimal precision.

_Once set, the rate may be updated by an authorised operator at any time; `setRate` reverts with `InterestRateIsFixed` when the token&#39;s rate is locked. The rate is stored as a scaled integer: the effective rate is `rate / 10 ** rateDecimals`._

## Methods

### getRate

```solidity
function getRate() external view returns (uint256 rate_, uint8 decimals_)
```

Returns the current fixed interest rate and its decimal precision.

#### Returns

| Name       | Type    | Description                                                                    |
| ---------- | ------- | ------------------------------------------------------------------------------ |
| rate\_     | uint256 | Scaled rate value.                                                             |
| decimals\_ | uint8   | Decimal precision; divide `rate_` by `10 ** decimals_` for the effective rate. |

### initializeFixedRate

```solidity
function initializeFixedRate(TRexIFixedRate.FixedRateData _initData) external nonpayable
```

#### Parameters

| Name       | Type                         | Description |
| ---------- | ---------------------------- | ----------- |
| \_initData | TRexIFixedRate.FixedRateData | undefined   |

### setRate

```solidity
function setRate(uint256 _newRate, uint8 _newRateDecimals) external nonpayable
```

Updates the fixed interest rate.

_Reverts with `InterestRateIsFixed` if the rate has been locked. Requires an authorised operator role._

#### Parameters

| Name              | Type    | Description                       |
| ----------------- | ------- | --------------------------------- |
| \_newRate         | uint256 | New scaled rate value.            |
| \_newRateDecimals | uint8   | Decimal precision for `_newRate`. |

## Events

### FixedRateInitialized

```solidity
event FixedRateInitialized(TRexIFixedRate.FixedRateData initData)
```

Emitted once when the FixedRate capability is initialised on a token.

_Fires exclusively from `initializeFixedRate` after the storage write succeeds._

#### Parameters

| Name     | Type                         | Description                                                   |
| -------- | ---------------------------- | ------------------------------------------------------------- |
| initData | TRexIFixedRate.FixedRateData | The rate and decimal precision written during initialisation. |

### RateUpdated

```solidity
event RateUpdated(address indexed operator, uint256 newRate, uint8 newRateDecimals)
```

Emitted when the fixed rate is updated by an authorised operator.

#### Parameters

| Name               | Type    | Description                         |
| ------------------ | ------- | ----------------------------------- |
| operator `indexed` | address | Address that performed the update.  |
| newRate            | uint256 | New scaled rate value.              |
| newRateDecimals    | uint8   | New decimal precision for the rate. |

## Errors

### InterestRateIsFixed

```solidity
error InterestRateIsFixed()
```

Thrown when `setRate` is called on a token whose rate has been locked.
