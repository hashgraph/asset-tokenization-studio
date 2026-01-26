// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.22;

/**
 * @title Time Travel Controller Storage Wrapper Interface
 * @notice Interface for the TimeTravelStorageWrapper contract
 */
interface ITimeTravel {
    /**
     * @notice Emitted when the system timestamp is changed
     * @param legacySystemTime The legacy system timestamp (0 if not changed)
     * @param newSystemTime The new system timestamp
     */
    event SystemTimestampChanged(uint256 legacySystemTime, uint256 newSystemTime);

    /**
     * @notice Emitted when the system timestamp is reset
     */
    event SystemTimestampReset();

    /**
     * @notice Error thrown when attempting to set an invalid new system timestamp
     * @param newSystemTime The new system timestamp that caused the error
     */
    error InvalidTimestamp(uint256 newSystemTime);

    /**
     * @notice Emitted when using time travel out of test environment
     */
    error WrongChainId();

    /*
     * @dev Change the system timestamp
     *
     * @param newSystemTime The new system timestamp
     */
    function changeSystemTimestamp(uint256 _newSystemTime) external;

    /*
     * @dev Reset the system timestamp
     */
    function resetSystemTimestamp() external;
}
