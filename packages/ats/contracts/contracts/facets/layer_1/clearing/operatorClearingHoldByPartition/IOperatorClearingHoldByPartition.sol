// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "../../hold/IHoldTypes.sol";
import { IClearingTypes } from "../IClearingTypes.sol";

/**
 * @title IOperatorClearingHoldByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for creating holds during clearing operations by a partition operator.
 * @dev Part of the Layer 1 clearing system, allowing authorised operators to initiate holds.
 */
interface IOperatorClearingHoldByPartition is IClearingTypes {
    /**
     * @notice Emitted when an authorised operator schedules a hold creation through the clearing flow.
     * @param operator Account that invoked the clearing hold creation (the operator).
     * @param tokenHolder Address whose balance is being committed to the hold.
     * @param partition Partition under which the hold is scheduled.
     * @param clearingId Identifier assigned to the queued clearing operation.
     * @param hold Hold parameters that will be created on approval.
     * @param expirationDate Expiration of the clearing operation itself.
     * @param data Arbitrary payload attached to the clearing operation.
     * @param operatorData Operator-supplied payload accompanying the request.
     */
    event ClearedOperatorHoldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        IHoldTypes.Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Creates a hold for a clearing operation by partition from a third party.
     * @dev Caller must be an authorised token holder operator.
     * @param _clearingOperationFrom Details of the clearing operation.
     * @param _hold Hold details.
     * @return success_ True if the hold was created successfully.
     * @return clearingId_ Unique identifier for the created clearing operation.
     */
    function operatorClearingCreateHoldByPartition(
        IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
        IHoldTypes.Hold calldata _hold
    ) external returns (bool success_, uint256 clearingId_);
}
