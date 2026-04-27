// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "../../hold/IHoldTypes.sol";
import { IClearingTypes } from "../IClearingTypes.sol";

interface IOperatorClearingHoldByPartition is IClearingTypes {
    /**
     * @notice Creates a hold for a clearing operation by partition from a third party
     * @dev Caller needs to be a token holder operator
     *
     * @param _clearingOperationFrom The clearing operation details
     * @param _hold The hold details
     */
    function operatorClearingCreateHoldByPartition(
        IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
        IHoldTypes.Hold calldata _hold
    ) external returns (bool success_, uint256 clearingId_);
}
