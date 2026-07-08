// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { IClearingTypes } from "../../facets/clearing/IClearingTypes.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";

/// @title ClearingReadOps
/// @author Asset Tokenization Studio Team
/// @notice Clearing read operations library - deployed once and called via DELEGATECALL
/// @dev Contains read-only clearing operations with ABAF adjustments
library ClearingReadOps {
    // CLEARING READ OPERATIONS (ABAF-adjusted)

    /// @notice Returns the cleared amount for a token holder, scaled by the ABAF factor at the
    ///         given timestamp.
    /// @dev Uses ABAF factor to adjust the cleared amount for balance adjustments.
    /// @param _tokenHolder Holder whose cleared amount is being queried.
    /// @param _timestamp   Reference timestamp for the adjustment-factor calculation.
    /// @return Adjusted cleared amount at `_timestamp`.
    function getClearedAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256) {
        return
            ClearingStorageWrapper.getClearedAmountFor(_tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactorForClearedAmountByTokenHolderAdjustedAt(
                _tokenHolder,
                _timestamp
            );
    }

    /// @notice Returns the cleared amount for a token holder on a specific partition, scaled by
    ///         the ABAF factor at the given timestamp.
    /// @dev Uses ABAF factor to adjust the cleared amount for balance adjustments.
    /// @param _partition   Partition being queried.
    /// @param _tokenHolder Holder whose partition cleared amount is being queried.
    /// @param _timestamp   Reference timestamp for the adjustment-factor calculation.
    /// @return Adjusted partition cleared amount at `_timestamp`.
    function getClearedAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) external view returns (uint256) {
        return
            ClearingStorageWrapper.getClearedAmountForByPartition(_partition, _tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp),
                AdjustBalancesStorageWrapper.getTotalClearedLabafByPartition(_partition, _tokenHolder)
            );
    }

    /// @notice Returns clearing transfer data for a specific operation, with the stored amount
    ///         scaled by the ABAF factor at the given timestamp.
    /// @dev Returns transfer data with ABAF-adjusted amount.
    /// @param _partition   Partition of the clearing operation.
    /// @param _tokenHolder Holder who initiated the clearing transfer.
    /// @param _clearingId  Identifier of the clearing operation.
    /// @param _timestamp   Reference timestamp for the adjustment-factor calculation.
    /// @return clearingTransferData_ Transfer record with the amount adjusted to `_timestamp`.
    function getClearingTransferForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) external view returns (IClearingTypes.ClearingTransferData memory clearingTransferData_) {
        clearingTransferData_ = ClearingStorageWrapper.getClearingTransferForByPartition(
            _partition,
            _tokenHolder,
            _clearingId
        );

        clearingTransferData_.amount *= AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp),
            AdjustBalancesStorageWrapper.getClearingLabafById(
                IClearingTypes.ClearingOperationIdentifier({
                    tokenHolder: _tokenHolder,
                    partition: _partition,
                    clearingId: _clearingId,
                    clearingOperationType: IClearingTypes.ClearingOperationType.Transfer
                })
            )
        );
    }

    /// @notice Returns clearing redeem data for a specific operation, with the stored amount
    ///         scaled by the ABAF factor at the given timestamp.
    /// @dev Returns redeem data with ABAF-adjusted amount.
    /// @param _partition   Partition of the clearing operation.
    /// @param _tokenHolder Holder who initiated the clearing redeem.
    /// @param _clearingId  Identifier of the clearing operation.
    /// @param _timestamp   Reference timestamp for the adjustment-factor calculation.
    /// @return clearingRedeemData_ Redeem record with the amount adjusted to `_timestamp`.
    function getClearingRedeemForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) external view returns (IClearingTypes.ClearingRedeemData memory clearingRedeemData_) {
        clearingRedeemData_ = ClearingStorageWrapper.getClearingRedeemForByPartition(
            _partition,
            _tokenHolder,
            _clearingId
        );

        clearingRedeemData_.amount *= AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp),
            AdjustBalancesStorageWrapper.getClearingLabafById(
                IClearingTypes.ClearingOperationIdentifier({
                    tokenHolder: _tokenHolder,
                    partition: _partition,
                    clearingId: _clearingId,
                    clearingOperationType: IClearingTypes.ClearingOperationType.Redeem
                })
            )
        );
    }

    /// @notice Returns clearing hold-creation data for a specific operation, with the stored
    ///         amount scaled by the ABAF factor at the given timestamp.
    /// @dev Returns hold creation data with ABAF-adjusted amount.
    /// @param _partition   Partition of the clearing operation.
    /// @param _tokenHolder Holder who initiated the clearing hold creation.
    /// @param _clearingId  Identifier of the clearing operation.
    /// @param _timestamp   Reference timestamp for the adjustment-factor calculation.
    /// @return clearingHoldCreationData_ Hold-creation record with the amount adjusted to `_timestamp`.
    function getClearingHoldCreationForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) external view returns (IClearingTypes.ClearingHoldCreationData memory clearingHoldCreationData_) {
        clearingHoldCreationData_ = ClearingStorageWrapper.getClearingHoldCreationForByPartition(
            _partition,
            _tokenHolder,
            _clearingId
        );

        clearingHoldCreationData_.amount *= AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp),
            AdjustBalancesStorageWrapper.getClearingLabafById(
                IClearingTypes.ClearingOperationIdentifier({
                    tokenHolder: _tokenHolder,
                    partition: _partition,
                    clearingId: _clearingId,
                    clearingOperationType: IClearingTypes.ClearingOperationType.HoldCreation
                })
            )
        );
    }

    // TIMESTAMP VALIDATION

    /// @notice Reverts unless the clearing operation's expiration state matches `_mustBeExpired`.
    /// @dev    Delegates expiration logic to `ClearingStorageWrapper.requireExpirationTimestamp`,
    ///         which reads the current block timestamp internally. `_blockTimestamp` is accepted
    ///         for interface compatibility but is not used by this implementation.
    /// @param _clearingOperationIdentifier Identifier of the clearing operation to check.
    /// @param _mustBeExpired               When `true`, reverts unless the operation has already
    ///                                     expired; when `false`, reverts if it has expired.
    function checkClearingExpirationTimestamp(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired,
        uint256 /* _blockTimestamp */
    ) external view {
        ClearingStorageWrapper.requireExpirationTimestamp(_clearingOperationIdentifier, _mustBeExpired);
    }

    /// @notice Reverts when `_expirationTimestamp` is not strictly in the future relative to
    ///         `_blockTimestamp`.
    /// @param _expirationTimestamp Expiration timestamp supplied by the caller.
    /// @param _blockTimestamp      Current block timestamp used as the reference point.
    function checkClearingValidExpirationTimestamp(
        uint256 _expirationTimestamp,
        uint256 _blockTimestamp
    ) external pure {
        if (_expirationTimestamp < _blockTimestamp) revert ICommonErrors.WrongExpirationTimestamp();
    }
}
