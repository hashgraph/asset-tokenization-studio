// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IPause {
    /**
     * @dev Pauses the token
     *
     * @return success_ true or false
     */
    function pause() external returns (bool success_);

    /**
     * @dev Unpauses the token
     *
     * @return success_ true or false
     */
    function unpause() external returns (bool success_);

    /**
     * @dev Checks if the token is paused
     *
     * @return bool true or false
     */
    function isPaused() external view returns (bool);
}
