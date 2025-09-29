// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IPauseStorageWrapper {
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
}
