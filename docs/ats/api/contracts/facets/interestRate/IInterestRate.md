# IInterestRate

_Asset Tokenization Studio Team_

> IInterestRate

Interface for the explicit coupon rate type selector facet.

_Pure types tier: function signatures and events only. Does NOT inherit `ICouponTypes` to avoid forcing read-only callers to pick up the full type tree. The `setCouponRateType` / `getCouponRateType` / `isCouponRateTypeSet` trio is the only surface exposed by this facet._

## Methods

### getCouponRateType

```solidity
function getCouponRateType() external view returns (enum IInterestRate.RateType)
```

Returns the stored coupon rate type.

#### Returns

| Name | Type                        | Description                                                    |
| ---- | --------------------------- | -------------------------------------------------------------- |
| \_0  | enum IInterestRate.RateType | The `RateType` value; defaults to `STANDARD` (0) if never set. |

### initializeInterestRateType

```solidity
function initializeInterestRateType(enum IInterestRate.RateType _rateType) external nonpayable
```

Initializes the coupon rate type during asset deployment.

_Intended to be called by the factory immediately after proxy creation. No role required — the factory is trusted at deploy time._

#### Parameters

| Name       | Type                        | Description                                                 |
| ---------- | --------------------------- | ----------------------------------------------------------- |
| \_rateType | enum IInterestRate.RateType | The `RateType` to persist (STANDARD, FIXED, or KPI_LINKED). |

### setCouponRateType

```solidity
function setCouponRateType(enum IInterestRate.RateType _rateType) external nonpayable
```

Sets the coupon rate type discriminator for this asset.

_Requires `ROLE_INTEREST_RATE_MANAGER`._

#### Parameters

| Name       | Type                        | Description                                                 |
| ---------- | --------------------------- | ----------------------------------------------------------- |
| \_rateType | enum IInterestRate.RateType | The `RateType` to persist (STANDARD, FIXED, or KPI_LINKED). |

## Events

### CouponRateTypeSet

```solidity
event CouponRateTypeSet(address indexed operator, enum IInterestRate.RateType rateType)
```

Emitted when the coupon rate type is set (by factory initializer or admin).

#### Parameters

| Name               | Type                        | Description                             |
| ------------------ | --------------------------- | --------------------------------------- |
| operator `indexed` | address                     | The caller who invoked the setter.      |
| rateType           | enum IInterestRate.RateType | The `RateType` value that was selected. |

### InterestRateTypeInitialized

```solidity
event InterestRateTypeInitialized(enum IInterestRate.RateType rateType)
```

Emitted once when the interest rate type is initialised on a token.

_Fires exclusively from `initializeInterestRateType` after the storage write succeeds._

#### Parameters

| Name     | Type                        | Description                 |
| -------- | --------------------------- | --------------------------- |
| rateType | enum IInterestRate.RateType | The rate type that was set. |
