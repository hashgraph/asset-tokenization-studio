// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "../layer_1/clearing/IClearingTypes.sol";

interface IClearingByPartition is IClearingTypes {
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
     * @notice Creates a redeem clearing operation for a partition
     *
     * @param _clearingOperation The clearing operation details
     * @param _amount The amount to redeem
     */
    function clearingRedeemByPartition(
        IClearingTypes.ClearingOperation calldata _clearingOperation,
        uint256 _amount
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a redeem clearing operation for a partition from a third party
     * @dev Caller needs to have approval to transfer the tokens from the token holder
     *
     * @param _clearingOperationFrom The clearing operation details
     * @param _amount The amount to redeem
     */
    function clearingRedeemFromByPartition(
        IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a transfer clearing operation for a partition
     *
     * @param _clearingOperation The clearing operation details
     * @param _amount The amount to transfer
     * @param _to The address to transfer the tokens to
     */
    function clearingTransferByPartition(
        IClearingTypes.ClearingOperation calldata _clearingOperation,
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
        IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Gets the clearing redeem data for a given partition, token holder and clearing ID
     *
     * @param _partition The partition of the token
     * @param _tokenHolder The address of the token holder
     * @param _clearingId The ID of the clearing operation
     *
     * @return clearingRedeemData_ The clearing redeem data
     */
    function getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view returns (IClearingTypes.ClearingRedeemData memory clearingRedeemData_);

    /**
     * @notice Gets the clearing transfer data for a given partition, token holder and clearing ID
     *
     * @param _partition The partition of the token
     * @param _tokenHolder The address of the token holder
     * @param _clearingId The ID of the clearing operation
     *
     * @return clearingTransferData_ The clearing transfer data
     */
    function getClearingTransferForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view returns (IClearingTypes.ClearingTransferData memory clearingTransferData_);

    /**
     * @notice Gets the total cleared amount for a token holder by partition
     */
    function getClearedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 amount_);

    /**
     * @notice Gets the total clearing count for a token holder by partition and clearing operation type
     */
    function getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearingTypes.ClearingOperationType _clearingOperationType
    ) external view returns (uint256 clearingCount_);

    /**
     * @notice Gets the ids of the clearings for a token holder by partition and clearing operation type
     */
    function getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearingTypes.ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory clearingsId_);
}
