// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";

/**
 * @title IControllerHoldByPartition
 * @notice Interface for the controller-initiated hold creation operation on a specific partition.
 * @dev Exposes a single write method that allows an authorised controller to place a hold on
 *      any token holder's balance. The `ControllerHeldByPartition` event is inherited from
 *      `IHoldTypes`.
 */
interface IControllerHoldByPartition is IHoldTypes {
    /**
     * @notice Creates a hold on the tokens of a token holder, by a controller, on a specific partition.
     * @dev Can only be called by a user with the controller role. The contract must be controllable
     *      and not paused. Only valid in single-partition mode with the default partition.
     * @param _partition The partition on which the hold is created.
     * @param _from The address from which the tokens will be held.
     * @param _hold The hold details (amount, expiration, escrow, destination, data).
     * @param _operatorData Additional data attached to the hold creation by the controller.
     * @return success_ True if the hold was created successfully.
     * @return holdId_ The identifier of the created hold.
     */
    function controllerCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _operatorData
    ) external returns (bool success_, uint256 holdId_);
}
