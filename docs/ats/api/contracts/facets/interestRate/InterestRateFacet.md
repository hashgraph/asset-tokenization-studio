# InterestRateFacet

_Asset Tokenization Studio Team_

> InterestRateFacet

Diamond facet that exposes the coupon rate type selector — `initialize_InterestRateType`, `setCouponRateType`, and `getCouponRateType` — under `RESOLVER_KEY_INTEREST_RATE`.

_Inherits `InterestRate` for business logic and implements `IStaticFunctionSelectors` for Diamond proxy selector registration._

## Methods

### getCouponRateType

```solidity
function getCouponRateType() external view returns (enum IInterestRate.RateType)
```

Returns the stored coupon rate type.

#### Returns

| Name | Type                        | Description                                                |
| ---- | --------------------------- | ---------------------------------------------------------- |
| \_0  | enum IInterestRate.RateType | The `RateType` value; defaults to `NONE` (0) if never set. |

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
function getStaticInterfaceIds() external pure returns (bytes4[] staticInterfaceIds_)
```

Gets all interfaces ids of a facet.

#### Returns

| Name                 | Type     | Description        |
| -------------------- | -------- | ------------------ |
| staticInterfaceIds\_ | bytes4[] | Face interface ids |

### getStaticResolverKey

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_)
```

Gets the static resolver key

#### Returns

| Name                | Type    | Description         |
| ------------------- | ------- | ------------------- |
| staticResolverKey\_ | bytes32 | Static resolver key |

### initializeInterestRateType

```solidity
function initializeInterestRateType(enum IInterestRate.RateType rateType) external nonpayable
```

Initializes the coupon rate type during asset deployment.

_Intended to be called by the factory immediately after proxy creation. No role required — the factory is trusted at deploy time. Reverts with `InvalidRateType` if `rateType` is `NONE`._

#### Parameters

| Name     | Type                        | Description                                                 |
| -------- | --------------------------- | ----------------------------------------------------------- |
| rateType | enum IInterestRate.RateType | The `RateType` to persist (STANDARD, FIXED, or KPI_LINKED). |

### setCouponRateType

```solidity
function setCouponRateType(enum IInterestRate.RateType rateType) external nonpayable
```

Sets the coupon rate type discriminator for this asset.

_Protected by `onlyRole(ROLE_INTEREST_RATE_MANAGER)` and `onlyValidRateType`._

#### Parameters

| Name     | Type                        | Description                                                 |
| -------- | --------------------------- | ----------------------------------------------------------- |
| rateType | enum IInterestRate.RateType | The `RateType` to persist (STANDARD, FIXED, or KPI_LINKED). |

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

## Errors

### AccessControlRequired

```solidity
error AccessControlRequired(bytes32 role, address sender)
```

_Emitted when a role check fails_

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| role   | bytes32 | undefined   |
| sender | address | undefined   |

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

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

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

### InvalidRateType

```solidity
error InvalidRateType(enum IInterestRate.RateType rateType)
```

Reverts when `NONE` is passed as a rate type.

_`NONE` is reserved as the uninitialized default; it must never be set explicitly._

#### Parameters

| Name     | Type                        | Description                                   |
| -------- | --------------------------- | --------------------------------------------- |
| rateType | enum IInterestRate.RateType | The invalid rate type supplied by the caller. |
