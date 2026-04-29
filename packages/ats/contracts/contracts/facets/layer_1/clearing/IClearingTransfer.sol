// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "./IClearingTypes.sol";

interface IClearingTransfer is IClearingTypes {
    /**
     * @notice Creates a transfer clearing operation for a partition from a third party
     * @dev Caller needs to be a token holder operator
     *
     * @param _clearingOperationFrom The clearing operation details
     * @param _amount The amount to transfer
     * @param _to The address to transfer the tokens to
     */
    function operatorClearingTransferByPartition(
        IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a transfer clearing operation for a partition from a third party
     * @dev Caller needs to have the protected partitions role
     *
     * @param _protectedClearingOperation The clearing operation details
     * @param _amount The amount to transfer
     * @param _to The address to transfer the tokens to
     */
    function protectedClearingTransferByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_);
}
