// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Time Travel Controller interface
 * @notice Interface for the TimeTravel contract
 */
interface ITimeTravel {
    // * Events

    /// @notice Emitted when the system timestamp is changed
    /// @param legacySystemTime The legacy system timestamp (0 if not changed)
    /// @param newSystemTime The new system timestamp
    event SystemTimestampChanged(uint256 legacySystemTime, uint256 newSystemTime);

    /// @notice Emitted when the system timestamp is reset
    event SystemTimestampReset();

    event SystemBlocknumberChanged(uint256 legacySystemNumber, uint256 newSystemNumber);

    event SystemBlocknumberReset();

    // * Errors

    /// @notice Error thrown when attempting to set an invalid new system timestamp
    /// @param newSystemTime The new system timestamp that caused the error
    error InvalidTimestamp(uint256 newSystemTime);

    /// @notice Emitted when using time travel out of test environment
    error WrongChainId();

    /// @notice Error thrown when attempting to set an invalid new system block number
    /// @param newSystemNumber The new system timestamp that caused the error
    error InvalidBlocknumber(uint256 newSystemNumber);

    // * Functions

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
