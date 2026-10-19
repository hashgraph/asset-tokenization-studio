# ICouponSecurityHolders

_Asset Tokenization Studio Team_

> ICouponSecurityHolders

Interface for querying the set of security holders associated with a coupon.

_Functions revert with `WrongIndexForAction` (via `onlyMatchingActionType`) when `_couponID` does not resolve to an existing coupon corporate action. Holder data is sourced from the snapshot taken at the coupon record date when available; otherwise the current token-holder enumeration is used._

## Methods

### getCouponHolders

```solidity
function getCouponHolders(uint256 _couponID, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Returns a paginated list of token holders eligible for a coupon.

_Holders are resolved from the snapshot at the coupon record date when one exists; falls back to the live holder list if no snapshot has been taken. Returns an empty array if the record date has not yet been reached._

#### Parameters

| Name         | Type    | Description                                      |
| ------------ | ------- | ------------------------------------------------ |
| \_couponID   | uint256 | Identifier of the target coupon (1-based index). |
| \_pageIndex  | uint256 | Zero-based page number for pagination.           |
| \_pageLength | uint256 | Maximum number of addresses to return per page.  |

#### Returns

| Name      | Type      | Description                                               |
| --------- | --------- | --------------------------------------------------------- |
| holders\_ | address[] | Ordered array of holder addresses for the requested page. |

### getCouponsFor

```solidity
function getCouponsFor(uint256 _couponID, uint256 _pageIndex, uint256 _pageLength) external view returns (struct ICouponTypes.CouponFor[] couponFor_, address[] holders_)
```

Returns coupon information for every holder of a given coupon, paginated.

_Internally resolves the holder page then retrieves per-holder coupon details. The two returned arrays share the same index: `couponFor_[i]`corresponds to`holders*[i]`.*

#### Parameters

| Name         | Type    | Description                                      |
| ------------ | ------- | ------------------------------------------------ |
| \_couponID   | uint256 | Identifier of the target coupon (1-based index). |
| \_pageIndex  | uint256 | Zero-based page number for pagination.           |
| \_pageLength | uint256 | Maximum number of records to return per page.    |

#### Returns

| Name        | Type                     | Description                                                   |
| ----------- | ------------------------ | ------------------------------------------------------------- |
| couponFor\_ | ICouponTypes.CouponFor[] | Per-holder coupon details for the requested page.             |
| holders\_   | address[]                | Holder addresses corresponding to each entry in `couponFor_`. |

### getTotalCouponHolders

```solidity
function getTotalCouponHolders(uint256 _couponID) external view returns (uint256)
```

Returns the total number of security holders eligible for a coupon.

_Count is taken from the snapshot at the coupon record date when one exists; falls back to the live total if no snapshot has been taken. Returns zero if the record date has not yet been reached._

#### Parameters

| Name       | Type    | Description                                      |
| ---------- | ------- | ------------------------------------------------ |
| \_couponID | uint256 | Identifier of the target coupon (1-based index). |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Total number of eligible holders. |

### initializeCouponSecurityHolders

```solidity
function initializeCouponSecurityHolders() external nonpayable
```

Initialises the coupon security holders capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### CouponSecurityHoldersInitialized

```solidity
event CouponSecurityHoldersInitialized()
```

Emitted once when the coupon security holders capability is initialised on a token.

_Fires exclusively from `initializeCouponSecurityHolders`._
