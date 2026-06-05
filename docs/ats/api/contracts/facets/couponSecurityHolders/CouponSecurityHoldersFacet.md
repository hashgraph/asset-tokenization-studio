# CouponSecurityHoldersFacet

_Asset Tokenization Studio Team_

> CouponSecurityHoldersFacet

Diamond facet that exposes coupon security-holder queries via `ICouponSecurityHolders`, registered under `RESOLVER_KEY_COUPON_SECURITY_HOLDERS`.

*Consolidates holder-enumeration methods previously part of `CouponFacet`: `getCouponHolders`, `getCouponsFor`, `getTotalCouponHolders`. Must be registered alongside any `Coupon*Facet`variant in all token      configurations that include coupon functionality.      Exposes 3 selectors and declares`ICouponSecurityHolders` as its interface ID.\*

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

_Internally resolves the holder page then retrieves per-holder coupon details. The two returned arrays share the same index: `couponFor_[i]` corresponds to `holders_[i]`._

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

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[])
```

Gets all function selectors of a facet

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
