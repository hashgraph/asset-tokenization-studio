// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "../hold/IHoldTypes.sol";
import { IClearingTypes } from "./IClearingTypes.sol";

interface IClearingHoldCreation is IClearingTypes {
    /**
     * @notice Creates a hold for a clearing operation by partition from a third party
     * @dev Can only be called by the protected partitions role
     *
     * @param _protectedClearingOperation The clearing operation details
     * @param _hold The hold details
     * @param _signature The signature of the token holder authorizing the operation
     */
    function protectedClearingCreateHoldByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_);
}
