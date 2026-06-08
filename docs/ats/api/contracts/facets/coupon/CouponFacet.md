# CouponFacet

_Asset Tokenization Studio Team_

> CouponFacet

Diamond facet exposing the standard (non-rate-variant) coupon writer surface (`setCoupon`, `cancelCoupon`) alongside the per-record reads under `RESOLVER_KEY_COUPON`.

_Inherits the writer logic from `Coupon` and satisfies `IStaticFunctionSelectors` for Diamond proxy selector registration. Read-only sibling facets `CouponSecurityHoldersFacet` and `CouponListingFacet` register under their own resolver keys and operate on the same underlying storage._

## Methods

### cancelCoupon

```solidity
function cancelCoupon(uint256 _couponID) external nonpayable returns (bool success_)
```

Cancels a previously scheduled coupon before its execution date is reached.

_Restricted to `ROLE_CORPORATE_ACTION`; gated by `onlyUnpaused` and `onlyMatchingActionType(CORPORATE_ACTION_TYPE_COUPON, _couponID - 1)`._

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

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL`; gated by `onlyUnpaused` and `onlyMatchingActionType(CORPORATE_ACTION_TYPE_COUPON, _couponID - 1)`._

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

_Reverts via `onlyMatchingActionType` if `_couponID` does not match the coupon corporate-action type at index `_couponID - 1`._

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

_Reverts via `onlyMatchingActionType` if `_couponID` does not match the coupon corporate-action type at index `_couponID - 1`._

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

_Reverts via `onlyMatchingActionType` if `_couponID` does not match the coupon corporate-action type at index `_couponID - 1`._

#### Parameters

| Name       | Type    | Description                    |
| ---------- | ------- | ------------------------------ |
| \_couponID | uint256 | One-indexed coupon identifier. |
| \_account  | address | Holder address to query.       |

#### Returns

| Name        | Type                   | Description                |
| ----------- | ---------------------- | -------------------------- |
| couponFor\_ | ICouponTypes.CouponFor | Holder-scoped coupon view. |

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[])
```

Gets all function selectors of a facet

_Selectors are written in reverse via `--selectorIndex` inside an `unchecked` block; the resulting array reads in declaration order (`setCoupon`, `cancelCoupon`, `getCoupon`, `getCouponFor`, `getCouponAmountFor`, `getCouponCount`)._

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

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

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

### ExponentOverflow

```solidity
error ExponentOverflow(uint256 exponent)
```

Reverts when an exponent would cause `10 ** exponent` to overflow `uint256`.

_Thrown by `DecimalsLib.checkExponentOverflow` when `exponent &gt;= 78`._

#### Parameters

| Name     | Type    | Description                                  |
| -------- | ------- | -------------------------------------------- |
| exponent | uint256 | The exponent that would produce an overflow. |

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

### InterestRateIsFixed

```solidity
error InterestRateIsFixed()
```

Thrown when `setRate` is called on a token whose rate has been locked.

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

### WrongDates

```solidity
error WrongDates(uint256 firstDate, uint256 secondDate)
```

Reverts when two date values fail their required ordering constraint.

_The expected relationship between both dates is defined by the caller&#39;s validation context._

#### Parameters

| Name       | Type    | Description                                         |
| ---------- | ------- | --------------------------------------------------- |
| firstDate  | uint256 | First date participating in the failed comparison.  |
| secondDate | uint256 | Second date participating in the failed comparison. |

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
