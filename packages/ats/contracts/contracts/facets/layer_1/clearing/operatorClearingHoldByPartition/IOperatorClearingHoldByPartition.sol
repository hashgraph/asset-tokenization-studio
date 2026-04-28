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
