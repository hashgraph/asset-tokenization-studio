# Kpis

_Asset Tokenization Studio Team_

> KPI Management Facet

Manages KPI data points used by KPI-linked rate logic for asset instruments.

_This facet stores and queries KPI checkpoints through `KpisStorageWrapper`. It must be initialised once by an account with the default admin role before dependent resolver-based functionality is considered ready. Mutating operations require the token to be operational, activated, unpaused, and the caller to hold the KPI manager role._

## Methods

### addKpiData

```solidity
function addKpiData(uint256 _date, uint256 _value, address _project) external nonpayable
```

Records a KPI data point for `_project` at `_date`.

_Persists a KPI checkpoint for `_project`; reverts unless `_date` is valid. Emits {KpiDataAdded}._

#### Parameters

| Name      | Type    | Description                                       |
| --------- | ------- | ------------------------------------------------- |
| \_date    | uint256 | Unix timestamp for the data point.                |
| \_value   | uint256 | KPI value to record.                              |
| \_project | address | Address of the project the data point belongs to. |

### getLatestKpiData

```solidity
function getLatestKpiData(uint256 _from, uint256 _to, address _project) external view returns (uint256 value_, bool exists_)
```

Returns the most recent KPI value for `_project` within [`_from`, `_to`].

_Reverts with `InvalidDateRange` if `_from &gt; _to`._

#### Parameters

| Name      | Type    | Description                                             |
| --------- | ------- | ------------------------------------------------------- |
| \_from    | uint256 | Start of the search window (Unix timestamp, inclusive). |
| \_to      | uint256 | End of the search window (Unix timestamp, inclusive).   |
| \_project | address | Address of the project to query.                        |

#### Returns

| Name     | Type    | Description                                                |
| -------- | ------- | ---------------------------------------------------------- |
| value\_  | uint256 | The latest KPI value found in the range, or `0` if none.   |
| exists\_ | bool    | `true` if at least one data point exists within the range. |

### getMinDate

```solidity
function getMinDate() external view returns (uint256 minDate_)
```

Returns the earliest valid date for KPI data points on this token.

#### Returns

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| minDate\_ | uint256 | The configured minimum date (Unix timestamp). |

### initializeKpis

```solidity
function initializeKpis() external nonpayable
```

Initialises the KPI capability on the token.

_Marks the KPI latest KPI-linked rate resolver as ready and emits `KpisInitialized`._

### isCheckPointDate

```solidity
function isCheckPointDate(uint256 _date, address _project) external view returns (bool exists_)
```

Checks whether a KPI data point exists for `_project` at exactly `_date`.

#### Parameters

| Name      | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| \_date    | uint256 | Unix timestamp to look up.       |
| \_project | address | Address of the project to query. |

#### Returns

| Name     | Type | Description                                               |
| -------- | ---- | --------------------------------------------------------- |
| exists\_ | bool | `true` if a data point is registered for (project, date). |

## Events

### KpiDataAdded

```solidity
event KpiDataAdded(address indexed project, uint256 date, uint256 value)
```

Emitted when a new KPI data point is recorded.

#### Parameters

| Name              | Type    | Description                                       |
| ----------------- | ------- | ------------------------------------------------- |
| project `indexed` | address | Address of the project the data point belongs to. |
| date              | uint256 | Unix timestamp identifying the data point.        |
| value             | uint256 | KPI value recorded at `date`.                     |

### KpisInitialized

```solidity
event KpisInitialized()
```

Emitted once when the KPI capability is initialised on a token.

_Fires exclusively from `initializeKpis`._

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

### InvalidDate

```solidity
error InvalidDate(uint256 providedDate, uint256 minDate, uint256 maxDate)
```

Thrown when `_date` falls outside the token&#39;s allowed [minDate, maxDate] window.

#### Parameters

| Name         | Type    | Description                          |
| ------------ | ------- | ------------------------------------ |
| providedDate | uint256 | The date supplied by the caller.     |
| minDate      | uint256 | Lower bound of the valid date range. |
| maxDate      | uint256 | Upper bound of the valid date range. |

### InvalidDateRange

```solidity
error InvalidDateRange(uint256 fromDate, uint256 toDate)
```

Thrown when the supplied date range is invalid (e.g. `fromDate &gt; toDate`).

#### Parameters

| Name     | Type    | Description                   |
| -------- | ------- | ----------------------------- |
| fromDate | uint256 | Start of the requested range. |
| toDate   | uint256 | End of the requested range.   |

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### KpiDataAlreadyExists

```solidity
error KpiDataAlreadyExists(uint256 date)
```

Thrown when a KPI data point already exists for the given date and project.

#### Parameters

| Name | Type    | Description                                |
| ---- | ------- | ------------------------------------------ |
| date | uint256 | The duplicate date supplied by the caller. |

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
