# IKpis

_Asset Tokenization Studio Team_

> IKpis

Interface for recording and querying time-series KPI data associated with a project address.

_Each data point is keyed by (project, date). Dates must fall within the token&#39;s configured min/max date window. Adding a data point for an already-registered date reverts with `KpiDataAlreadyExists`._

## Methods

### addKpiData

```solidity
function addKpiData(uint256 _date, uint256 _value, address _project) external nonpayable
```

Records a KPI data point for `_project` at `_date`.

_Reverts with `InvalidDate` if `_date` is outside the allowed window, or with `KpiDataAlreadyExists` if a value has already been recorded for this (project, date) pair._

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

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

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

### KpiDataAlreadyExists

```solidity
error KpiDataAlreadyExists(uint256 date)
```

Thrown when a KPI data point already exists for the given date and project.

#### Parameters

| Name | Type    | Description                                |
| ---- | ------- | ------------------------------------------ |
| date | uint256 | The duplicate date supplied by the caller. |
