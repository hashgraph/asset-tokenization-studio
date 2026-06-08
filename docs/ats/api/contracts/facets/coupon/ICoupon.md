# ICoupon

_Asset Tokenization Studio Team_

> ICoupon

Writer-side interface for the Coupon domain — exposes the corporate-action lifecycle (`setCoupon`, `cancelCoupon`) plus the per-record reads that consumers need before executing or auditing a coupon.

_Inherits `ICouponTypes` for the shared struct/enum tier (`Coupon`, `RegisteredCoupon`, `CouponFor`, `CouponAmountFor`, `RateCalculationStatus`). Domain events and errors live on this writer interface (not on the shared types tier) so that read-only sibling facets such as `ICouponSecurityHolders` and `ICouponListing` do not pick up symbols they never emit or revert with — a narrow EIP-165 interfaceId is the goal. Aggregated into the off-chain `IAsset` umbrella alongside the read-only sibling facets._

## Methods

### cancelCoupon

```solidity
function cancelCoupon(uint256 _couponID) external nonpayable returns (bool success_)
```

Cancels a previously scheduled coupon before its execution date is reached.

_Restricted to `ROLE_CORPORATE_ACTION` and gated by the unpaused state. Reverts with `CouponAlreadyExecuted` if the execution date has passed; otherwise marks the corporate action disabled and emits `CouponCancelled`._

#### Parameters

| Name       | Type    | Description                                     |
| ---------- | ------- | ----------------------------------------------- |
| \_couponID | uint256 | One-indexed identifier of the coupon to cancel. |

#### Returns

| Name      | Type | Description                            |
| --------- | ---- | -------------------------------------- |
| success\_ | bool | True if the cancellation was recorded. |

### forceCancelCoupon

```solidity
function forceCancelCoupon(uint256 _couponID) external nonpayable returns (bool success_)
```

Force-cancels a coupon regardless of its execution date.

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL` and gated by the unpaused state and `onlyMatchingActionType`. Marks the corporate action disabled unconditionally — bypasses `CouponAlreadyExecuted` — and emits `CouponForceCancelled`._

#### Parameters

| Name       | Type    | Description                                           |
| ---------- | ------- | ----------------------------------------------------- |
| \_couponID | uint256 | One-indexed identifier of the coupon to force-cancel. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the force-cancellation was recorded. |

### getCoupon

```solidity
function getCoupon(uint256 _couponID) external view returns (struct ICouponTypes.RegisteredCoupon registeredCoupon_, bool isDisabled_)
```

Returns the persisted coupon record together with its cancelled flag.

_Reverts via `onlyMatchingActionType` if `_couponID` does not resolve to a coupon corporate action._

#### Parameters

| Name       | Type    | Description                    |
| ---------- | ------- | ------------------------------ |
| \_couponID | uint256 | One-indexed coupon identifier. |

#### Returns

| Name               | Type                          | Description                                          |
| ------------------ | ----------------------------- | ---------------------------------------------------- |
| registeredCoupon\_ | ICouponTypes.RegisteredCoupon | Stored coupon parameters bound to their snapshot id. |
| isDisabled\_       | bool                          | True if the coupon has been cancelled.               |

### getCouponAmountFor

```solidity
function getCouponAmountFor(uint256 _couponID, address _account) external view returns (struct ICouponTypes.CouponAmountFor couponAmountFor_)
```

Returns the fractional coupon amount payable to a specific holder.

_Reverts via `onlyMatchingActionType` if `_couponID` does not resolve to a coupon corporate action. Numerator and denominator are only meaningful once `recordDateReached` is set on the returned struct._

#### Parameters

| Name       | Type    | Description                    |
| ---------- | ------- | ------------------------------ |
| \_couponID | uint256 | One-indexed coupon identifier. |
| \_account  | address | Holder address to query.       |

#### Returns

| Name              | Type                         | Description                               |
| ----------------- | ---------------------------- | ----------------------------------------- |
| couponAmountFor\_ | ICouponTypes.CouponAmountFor | Fractional payable amount for the holder. |

### getCouponCount

```solidity
function getCouponCount() external view returns (uint256 couponCount_)
```

Returns the total number of coupons scheduled under the coupon corporate-action type — cancelled coupons remain in the count.

#### Returns

| Name          | Type    | Description           |
| ------------- | ------- | --------------------- |
| couponCount\_ | uint256 | Current coupon count. |

### getCouponFor

```solidity
function getCouponFor(uint256 _couponID, address _account) external view returns (struct ICouponTypes.CouponFor couponFor_)
```

Returns the per-account view of a coupon, including the holder balance at the record date and the metadata required to compute the payable amount.

_Reverts via `onlyMatchingActionType` if `_couponID` does not resolve to a coupon corporate action. Balance and `couponAmount` fields are only meaningful once `recordDateReached` is set on the returned struct._

#### Parameters

| Name       | Type    | Description                    |
| ---------- | ------- | ------------------------------ |
| \_couponID | uint256 | One-indexed coupon identifier. |
| \_account  | address | Holder address to query.       |

#### Returns

| Name        | Type                   | Description                |
| ----------- | ---------------------- | -------------------------- |
| couponFor\_ | ICouponTypes.CouponFor | Holder-scoped coupon view. |

### initializeCoupon

```solidity
function initializeCoupon() external nonpayable
```

Initialises the coupon capability on the token.

_Callable once; subsequent calls revert with FacetAlreadyRegistered. Requires DEFAULT_ADMIN_ROLE. Called by the factory during deployment._

### setCoupon

```solidity
function setCoupon(ICouponTypes.Coupon _newCoupon) external nonpayable returns (uint256 couponID_)
```

#### Parameters

| Name        | Type                | Description |
| ----------- | ------------------- | ----------- |
| \_newCoupon | ICouponTypes.Coupon | undefined   |

#### Returns

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| couponID\_ | uint256 | undefined   |

## Events

### CouponCancelled

```solidity
event CouponCancelled(uint256 indexed couponId, address indexed operator)
```

Emitted when an operator cancels a previously scheduled coupon.

_Cancellation is rejected once the execution date has passed; see `CouponAlreadyExecuted`._

#### Parameters

| Name               | Type    | Description                                     |
| ------------------ | ------- | ----------------------------------------------- |
| couponId `indexed` | uint256 | One-indexed identifier of the cancelled coupon. |
| operator `indexed` | address | Address that performed the cancellation.        |

### CouponForceCancelled

```solidity
event CouponForceCancelled(uint256 indexed couponId, address indexed operator)
```

Emitted when an admin force-cancels a coupon, bypassing date guards.

#### Parameters

| Name               | Type    | Description                                           |
| ------------------ | ------- | ----------------------------------------------------- |
| couponId `indexed` | uint256 | One-indexed identifier of the force-cancelled coupon. |
| operator `indexed` | address | Address that performed the force-cancellation.        |

### CouponInitialized

```solidity
event CouponInitialized()
```

Emitted once when the coupon capability is initialised on a token.

_Fires exclusively from `initializeCoupon`._

### CouponSet

```solidity
event CouponSet(bytes32 indexed corporateActionId, uint256 indexed couponId, address indexed operator, ICouponTypes.Coupon coupon)
```

Emitted when an operator schedules a new coupon corporate action.

#### Parameters

| Name                        | Type                | Description                                                            |
| --------------------------- | ------------------- | ---------------------------------------------------------------------- |
| corporateActionId `indexed` | bytes32             | Identifier of the underlying corporate action.                         |
| couponId `indexed`          | uint256             | One-indexed coupon identifier within the coupon corporate action type. |
| operator `indexed`          | address             | Address that scheduled the coupon.                                     |
| coupon                      | ICouponTypes.Coupon | The coupon parameters captured at scheduling time.                     |

## Errors

### CouponAlreadyExecuted

```solidity
error CouponAlreadyExecuted(bytes32 corporateActionId, uint256 couponId)
```

Reverts when an operator attempts to cancel a coupon whose execution date has already passed.

#### Parameters

| Name              | Type    | Description                                                    |
| ----------------- | ------- | -------------------------------------------------------------- |
| corporateActionId | bytes32 | Identifier of the underlying corporate action.                 |
| couponId          | uint256 | One-indexed identifier of the coupon that cannot be cancelled. |

### CouponCreationFailed

```solidity
error CouponCreationFailed()
```

Reverts when the underlying corporate-action creation step returns the zero id, indicating the coupon could not be persisted.

### CouponNotFound

```solidity
error CouponNotFound(uint256 couponID)
```

Reverts when a coupon identifier does not resolve to an existing corporate action.

#### Parameters

| Name     | Type    | Description                               |
| -------- | ------- | ----------------------------------------- |
| couponID | uint256 | The coupon identifier that was not found. |

### InterestRateIsKpiLinked

```solidity
error InterestRateIsKpiLinked()
```

Reverts when a KPI-linked rate variant is supplied with non-pending or non-zero rate parameters, which the variant requires for dynamic computation.

### InterestRateIsStandard

```solidity
error InterestRateIsStandard()
```

Reverts when a standard rate variant is supplied with pending rate parameters.
