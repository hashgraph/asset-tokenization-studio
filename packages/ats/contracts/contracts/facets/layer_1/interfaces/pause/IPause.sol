// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPauseStorageWrapper } from "./IPauseStorageWrapper.sol";

interface IPause is IPauseStorageWrapper {
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
