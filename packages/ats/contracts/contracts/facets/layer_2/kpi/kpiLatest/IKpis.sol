// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Kpis
bytes32 constant RESOLVER_KEY_KPIS = 0xc0b75e6f4facfa630926f9653b857eeb3547c604941b210701f53f3b17521743;

interface IKpis {
    /**
     * @notice Emitted once when the KPI capability is initialised on a token.
     * @dev Fires exclusively from `initializeKpis`.
     */
    event KpisInitialized();

    event KpiDataAdded(address indexed project, uint256 date, uint256 value);

    error InvalidDate(uint256 providedDate, uint256 minDate, uint256 maxDate);

    error KpiDataAlreadyExists(uint256 date);

    error InvalidDateRange(uint256 fromDate, uint256 toDate);

    /**
     * @notice Initialises the KPI capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeKpis() external;

    function addKpiData(uint256 _date, uint256 _value, address _project) external;

    function getLatestKpiData(
        uint256 _from,
        uint256 _to,
        address _project
    ) external view returns (uint256 value_, bool exists_);

    function getMinDate() external view returns (uint256 minDate_);

    function isCheckPointDate(uint256 _date, address _project) external view returns (bool exists_);
}
