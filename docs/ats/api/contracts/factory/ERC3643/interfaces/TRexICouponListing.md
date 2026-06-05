# TRexICouponListing

_Asset Tokenization Studio Team_

> ICouponListing

Interface for read-only coupon and scheduled-coupon listing queries.

_Consolidates ordered-list methods previously in `ICoupon` and scheduled listing methods from the former `IScheduledCouponListing`._

## Methods

### getCouponFromOrderedListAt

```solidity
function getCouponFromOrderedListAt(uint256 _pos, bool _includeDisabled) external view returns (uint256 couponID_)
```

Retrieves a coupon ID from the ordered list at a specific position.

#### Parameters

| Name              | Type    | Description                                                                                        |
| ----------------- | ------- | -------------------------------------------------------------------------------------------------- |
| \_pos             | uint256 | The position in the ordered coupon list.                                                           |
| \_includeDisabled | bool    | When true, cancelled coupons are counted in the list; when false, only active coupons are visible. |

#### Returns

| Name       | Type    | Description                              |
| ---------- | ------- | ---------------------------------------- |
| couponID\_ | uint256 | The coupon ID at the specified position. |

### getCouponsOrderedList

```solidity
function getCouponsOrderedList(uint256 _pageIndex, uint256 _pageLength, bool _includeDisabled) external view returns (uint256[] couponIDs_)
```

Retrieves a paginated list of coupon IDs in order.

#### Parameters

| Name              | Type    | Description                                                                                          |
| ----------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| \_pageIndex       | uint256 | The page index for pagination.                                                                       |
| \_pageLength      | uint256 | The number of coupons per page.                                                                      |
| \_includeDisabled | bool    | When true, cancelled coupons are included in the page; when false, only active coupons are returned. |

#### Returns

| Name        | Type      | Description                                 |
| ----------- | --------- | ------------------------------------------- |
| couponIDs\_ | uint256[] | Array of coupon IDs for the specified page. |

### getCouponsOrderedListTotal

```solidity
function getCouponsOrderedListTotal(bool _includeDisabled) external view returns (uint256 total_)
```

Retrieves the total number of coupons in the ordered list adjusted to the current timestamp.

#### Parameters

| Name              | Type | Description                                                                            |
| ----------------- | ---- | -------------------------------------------------------------------------------------- |
| \_includeDisabled | bool | When true, cancelled coupons are counted; when false, only active coupons are counted. |

#### Returns

| Name    | Type    | Description                 |
| ------- | ------- | --------------------------- |
| total\_ | uint256 | The total count of coupons. |

### getScheduledCouponListing

```solidity
function getScheduledCouponListing(uint256 _pageIndex, uint256 _pageLength, bool _includeDisabled) external view returns (struct ScheduledTask[] scheduledCouponListing_)
```

Retrieves a paginated list of scheduled coupon listing tasks.

#### Parameters

| Name              | Type    | Description                                                                                                         |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| \_pageIndex       | uint256 | The page index for pagination.                                                                                      |
| \_pageLength      | uint256 | The number of tasks per page.                                                                                       |
| \_includeDisabled | bool    | When true, tasks belonging to cancelled corporate actions are included; when false, only active tasks are returned. |

#### Returns

| Name                     | Type            | Description                              |
| ------------------------ | --------------- | ---------------------------------------- |
| scheduledCouponListing\_ | ScheduledTask[] | Array of scheduled coupon listing tasks. |

### initializeCouponListing

```solidity
function initializeCouponListing() external nonpayable
```

Initialises the coupon listing capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### scheduledCouponListingCount

```solidity
function scheduledCouponListingCount(bool _includeDisabled) external view returns (uint256)
```

Returns the number of scheduled coupon listing tasks.

#### Parameters

| Name              | Type | Description                                                                                                       |
| ----------------- | ---- | ----------------------------------------------------------------------------------------------------------------- |
| \_includeDisabled | bool | When true, tasks belonging to cancelled corporate actions are counted; when false, only active tasks are counted. |

#### Returns

| Name | Type    | Description                                  |
| ---- | ------- | -------------------------------------------- |
| \_0  | uint256 | The count of scheduled coupon listing tasks. |

## Events

### CouponListingInitialized

```solidity
event CouponListingInitialized()
```

Emitted once when the coupon listing capability is initialised on a token.

_Fires exclusively from `initializeCouponListing`._
