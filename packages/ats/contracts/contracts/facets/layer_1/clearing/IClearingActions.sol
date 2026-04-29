// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "./IClearingTypes.sol";

interface IClearingActions is IClearingTypes {
    function initializeClearing(bool _activateClearing) external;

    /**
     * @notice Activates the clearing functionality
     */
    function activateClearing() external returns (bool success_);

    /**
     * @notice Deactivates the clearing functionality
     */
    function deactivateClearing() external returns (bool success_);

    /**
     * @notice Returns whether the clearing functionality is activated or not
     *
     * @return bool true if activated, false otherwise
     */
    function isClearingActivated() external view returns (bool);
}
