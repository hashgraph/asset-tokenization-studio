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
     * @notice Approves a clearing operation previously requested by a token holder
     * @dev Can only be called before expiration date
     *
     * @param _clearingOperationIdentifier Struct containing the parameters that identify the clearing operation
     */
    function approveClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) external returns (bool success_, bytes32 partition_);

    /**
     * @notice Cancels a clearing operation returning funds back to the token holder
     * @dev Can only be called before expiration date
     *
     * @param _clearingOperationIdentifier Struct containing the parameters that identify the clearing operation
     */
    function cancelClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) external returns (bool success_);

    /**
     * @notice Reclaims a clearing operation returning funds back to the token holder
     */
    function reclaimClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) external returns (bool success_);

    /**
     * @notice Returns whether the clearing functionality is activated or not
     *
     * @return bool true if activated, false otherwise
     */
    function isClearingActivated() external view returns (bool);
}
