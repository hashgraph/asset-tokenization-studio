# FixedRateFacet

_Asset Tokenization Studio Team_

> FixedRateFacet

Diamond facet that exposes fixed-rate management to the proxy.

_Selectors exposed: - `initializeFixedRate` - `setRate` - `getRate`_

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

### initializeFixedRate

```solidity
function initializeFixedRate(IFixedRate.FixedRateData _initData) external nonpayable
```

#### Parameters

| Name       | Type                     | Description |
| ---------- | ------------------------ | ----------- |
| \_initData | IFixedRate.FixedRateData | undefined   |

### setRate

```solidity
function setRate(uint256 _newRate, uint8 _newRateDecimals) external nonpayable
```

Updates the fixed interest rate.

_Requires an operational, activated, unpaused asset and the interest rate manager role._

#### Parameters

| Name              | Type    | Description                       |
| ----------------- | ------- | --------------------------------- |
| \_newRate         | uint256 | New scaled rate value.            |
| \_newRateDecimals | uint8   | Decimal precision for `_newRate`. |

## Events

### FixedRateInitialized

```solidity
event FixedRateInitialized(IFixedRate.FixedRateData initData)
```

Emitted once when the FixedRate capability is initialised on a token.

_Fires exclusively from `initializeFixedRate` after the storage write succeeds._

#### Parameters

| Name     | Type                     | Description                                                   |
| -------- | ------------------------ | ------------------------------------------------------------- |
| initData | IFixedRate.FixedRateData | The rate and decimal precision written during initialisation. |

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

### InterestRateIsFixed

```solidity
error InterestRateIsFixed()
```

Thrown when `setRate` is called on a token whose rate has been locked.

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### UnrecognizedResolverProxyVersion

```solidity
error UnrecognizedResolverProxyVersion(bytes8 _resolverProxyVersion)
```

Thrown when the provided proxy version does not match any BLR compatible standard.

#### Parameters

| Name                   | Type   | Description                                        |
| ---------------------- | ------ | -------------------------------------------------- |
| \_resolverProxyVersion | bytes8 | proxy version that is not compatible with the BLR. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
