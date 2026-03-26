// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Time Travel Controller interface
 * @notice Interface for the TimeTravel contract
 */
interface ITimeTravel {
    /**
     * @notice Changes the system timestamp
     *         emits SystemTimestampChanged event
     * @param _newSystemTime The new system timestamp
     */
    function changeSystemTimestamp(uint256 _newSystemTime) external;

    /**
     * @notice Resets the system timestamp
     *         emits SystemTimestampReset event
     */
    function resetSystemTimestamp() external;

    function changeSystemBlocknumber(uint256 _newSystemBlocknumber) external;

    function resetSystemBlocknumber() external;

    /**
     * @notice Retrieves the current system timestamp
     */
    function blockTimestamp() external view returns (uint256);
}
