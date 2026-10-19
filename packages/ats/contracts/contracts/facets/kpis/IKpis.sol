// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Kpis
bytes32 constant RESOLVER_KEY_KPIS = 0xc0b75e6f4facfa630926f9653b857eeb3547c604941b210701f53f3b17521743;

/**
 * @title  IKpis
 * @author Asset Tokenization Studio Team
 * @notice Interface for recording and querying time-series KPI data associated with a
 *         project address.
 * @dev    Each data point is keyed by (project, date). Dates must fall within the token's
 *         configured min/max date window. Adding a data point for an already-registered
 *         date reverts with `KpiDataAlreadyExists`.
 */
interface IKpis {
    /**
     * @notice Emitted once when the KPI capability is initialised on a token.
     * @dev Fires exclusively from `initializeKpis`.
     */
    event KpisInitialized();

    /**
     * @notice Emitted when a new KPI data point is recorded.
     * @param project Address of the project the data point belongs to.
     * @param date    Unix timestamp identifying the data point.
     * @param value   KPI value recorded at `date`.
     */
    event KpiDataAdded(address indexed project, uint256 date, uint256 value);

    /**
     * @notice Thrown when `_date` falls outside the token's allowed [minDate, maxDate] window.
     * @param providedDate The date supplied by the caller.
     * @param minDate      Lower bound of the valid date range.
     * @param maxDate      Upper bound of the valid date range.
     */
    error InvalidDate(uint256 providedDate, uint256 minDate, uint256 maxDate);

    /**
     * @notice Thrown when a KPI data point already exists for the given date and project.
     * @param date The duplicate date supplied by the caller.
     */
    error KpiDataAlreadyExists(uint256 date);

    /**
     * @notice Thrown when the supplied date range is invalid (e.g. `fromDate > toDate`).
     * @param fromDate Start of the requested range.
     * @param toDate   End of the requested range.
     */
    error InvalidDateRange(uint256 fromDate, uint256 toDate);

    /**
     * @notice Initialises the KPI capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeKpis() external;

    /**
     * @notice Records a KPI data point for `_project` at `_date`.
     * @dev Reverts with `InvalidDate` if `_date` is outside the allowed window, or with
     *      `KpiDataAlreadyExists` if a value has already been recorded for this
     *      (project, date) pair.
     * @param _date    Unix timestamp for the data point.
     * @param _value   KPI value to record.
     * @param _project Address of the project the data point belongs to.
     */
    function addKpiData(uint256 _date, uint256 _value, address _project) external;

    /**
     * @notice Returns the most recent KPI value for `_project` within [`_from`, `_to`].
     * @dev Reverts with `InvalidDateRange` if `_from > _to`.
     * @param _from    Start of the search window (Unix timestamp, inclusive).
     * @param _to      End of the search window (Unix timestamp, inclusive).
     * @param _project Address of the project to query.
     * @return value_  The latest KPI value found in the range, or `0` if none.
     * @return exists_ `true` if at least one data point exists within the range.
     */
    function getLatestKpiData(
        uint256 _from,
        uint256 _to,
        address _project
    ) external view returns (uint256 value_, bool exists_);

    /**
     * @notice Returns the earliest valid date for KPI data points on this token.
     * @return minDate_ The configured minimum date (Unix timestamp).
     */
    function getMinDate() external view returns (uint256 minDate_);

    /**
     * @notice Checks whether a KPI data point exists for `_project` at exactly `_date`.
     * @param _date    Unix timestamp to look up.
     * @param _project Address of the project to query.
     * @return exists_ `true` if a data point is registered for (project, date).
     */
    function isCheckPointDate(uint256 _date, address _project) external view returns (bool exists_);
}
