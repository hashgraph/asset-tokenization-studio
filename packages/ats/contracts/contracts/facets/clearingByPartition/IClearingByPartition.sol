// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "../layer_1/clearing/IClearingTypes.sol";

/**
 * @title IClearingByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for partition-scoped clearing operations: approve, cancel, reclaim,
 *         clearing redeems and transfers, and read queries scoped to a single partition.
 * @dev Extends IClearingTypes. Implementations must enforce single-partition mode,
 *      protected-partition access control, and standard clearing lifecycle guards.
 */
interface IClearingByPartition is IClearingTypes {
    /**
     * @notice Approves a clearing operation previously requested by a token holder
     * @dev Can only be called before expiration date
     *
     * @param _clearingOperationIdentifier Struct containing the parameters that identify the clearing operation
     * @return success_ True if the operation was approved successfully
     * @return partition_ Partition of the approved clearing operation
     */
    function approveClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) external returns (bool success_, bytes32 partition_);

    /**
     * @notice Cancels a clearing operation returning funds back to the token holder
     * @dev Can only be called before expiration date
     *
     * @param _clearingOperationIdentifier Struct containing the parameters that identify the clearing operation
     * @return success_ True if the operation was cancelled successfully
     */
    function cancelClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) external returns (bool success_);

    /**
     * @notice Reclaims a clearing operation returning funds back to the token holder
     * @dev Callable by the token holder once the operation has expired.
     * @param _clearingOperationIdentifier Struct containing the parameters that identify the clearing operation
     * @return success_ True if the operation was reclaimed successfully
     */
    function reclaimClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) external returns (bool success_);

    /**
     * @notice Creates a redeem clearing operation for a partition
     *
     * @param _clearingOperation The clearing operation details
     * @param _amount The amount to redeem
     * @return success_ True if the clearing redeem was created successfully
     * @return clearingId_ Identifier assigned to the new clearing operation
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
     * @return success_ True if the clearing redeem was created successfully
     * @return clearingId_ Identifier assigned to the new clearing operation
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
     * @return success_ True if the clearing transfer was created successfully
     * @return clearingId_ Identifier assigned to the new clearing operation
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
     * @return success_ True if the clearing transfer was created successfully
     * @return clearingId_ Identifier assigned to the new clearing operation
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
     * @param _partition The partition of the token
     * @param _tokenHolder The address of the token holder
     * @return amount_ Total amount of tokens currently locked in clearing for the holder
     */
    function getClearedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 amount_);

    /**
     * @notice Gets the total clearing count for a token holder by partition and clearing operation type
     * @param _partition The partition of the token
     * @param _tokenHolder The address of the token holder
     * @param _clearingOperationType Type of clearing operation (Transfer, Redeem, or HoldCreation)
     * @return clearingCount_ Number of active clearing operations of the given type
     */
    function getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearingTypes.ClearingOperationType _clearingOperationType
    ) external view returns (uint256 clearingCount_);

    /**
     * @notice Gets the ids of the clearings for a token holder by partition and clearing operation type
     * @param _partition The partition of the token
     * @param _tokenHolder The address of the token holder
     * @param _clearingOperationType Type of clearing operation (Transfer, Redeem, or HoldCreation)
     * @param _pageIndex Zero-based page index for pagination
     * @param _pageLength Maximum number of IDs to return per page
     * @return clearingsId_ Array of clearing operation IDs for the given page
     */
    function getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        IClearingTypes.ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory clearingsId_);
}
