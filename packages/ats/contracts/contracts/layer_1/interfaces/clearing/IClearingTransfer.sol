// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearing } from "./IClearing.sol";

interface IClearingTransfer is IClearing {
    /**
     * @notice Creates a transfer clearing operation for a partition
     *
     * @param _clearingOperation The clearing operation details
     * @param _amount The amount to redeem
     * @param _to The address to transfer the tokens to
     */
    function clearingTransferByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount,
        address _to
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a transfer clearing operation for a partition from a third party
     * @dev Caller needs to have approval to transfer the tokens from the token holder
     *
     * @param _clearingOperationFrom The clearing operation details
     * @param _amount The amount to transfer
     * @param _to The address to transfer the tokens to
     */
    function clearingTransferFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a transfer clearing operation for a partition from a third party
     * @dev Caller needs to be a token holder operator
     *
     * @param _clearingOperationFrom The clearing operation details
     * @param _amount The amount to transfer
     * @param _to The address to transfer the tokens to
     */
    function operatorClearingTransferByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
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
        ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Gets the clearing transfer data for a given partition, token holder and clearing ID
     *
     * @param _partition The partition of the token
     * @param _tokenHolder The address of the token holder
     * @param _clearingId The ID of the clearing operation
     *
     * @return clearingTransferData_ The clearing reedeem data
     */
    function getClearingTransferForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view returns (ClearingTransferData memory clearingTransferData_);
}
