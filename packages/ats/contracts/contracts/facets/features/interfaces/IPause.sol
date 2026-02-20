// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IPause {
    /**
     * @dev Emitted when the token is paused
     * @param operator The caller of the function that emitted the event
     */
    event TokenPaused(address indexed operator);

    /**
     * @dev Emitted when the token is unpaused
     * @param operator The caller of the function that emitted the event
     */
    event TokenUnpaused(address indexed operator);

    /**
     * @dev Emitted when the token is paused and it should not
     */
    error TokenIsPaused();

    /**
     * @dev Emitted when the token is unpaused and it should not
     */
    error TokenIsUnpaused();

    /**
     * @dev Pauses the token
     * @return success_ true or false
     */
    function pause() external returns (bool success_);

    /**
     * @dev Unpauses the token
     * @return success_ true or false
     */
    function unpause() external returns (bool success_);

    /**
     * @dev Checks if the token is paused
     * @return bool true or false
     */
    function isPaused() external view returns (bool);
}
