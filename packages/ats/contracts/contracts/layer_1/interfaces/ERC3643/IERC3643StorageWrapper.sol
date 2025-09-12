// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IERC3643StorageWrapper {
    /**
     *  @notice This event is emitted when the Compliance has been set for the token
     */
    event ComplianceAdded(address indexed compliance);

    /*
     *   @notice Thrown when unfreezing more than what is frozen
     */
    error InsufficientFrozenBalance(
        address user,
        uint256 requestedUnfreeze,
        uint256 availableFrozen,
        bytes32 partition
    );
}
