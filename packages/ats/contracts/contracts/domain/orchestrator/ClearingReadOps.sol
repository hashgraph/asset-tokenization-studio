// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { IClearingTransfer } from "../../facets/layer_1/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../../facets/layer_1/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../../facets/layer_1/clearing/IClearingHoldCreation.sol";

/// @title ClearingReadOps
/// @notice Clearing read operations library - deployed once and called via DELEGATECALL
/// @dev Contains read-only clearing operations with ABAF adjustments
library ClearingReadOps {
    // ==========================================================================
    // ERRORS
    // ==========================================================================

    error WrongExpirationTimestamp();

    // ==========================================================================
    // CLEARING READ OPERATIONS (ABAF-adjusted)
    // ==========================================================================

    /// @notice Get cleared amount for token holder adjusted at timestamp
    /// @dev Uses ABAF factor to adjust the cleared amount for balance adjustments
    function getClearedAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) public view returns (uint256) {
        uint256 clearedAmount = ClearingStorageWrapper.getClearedAmountFor(_tokenHolder);
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactorForClearedAmountByTokenHolderAdjustedAt(
            _tokenHolder,
            _timestamp
        );
        return clearedAmount * factor;
    }

    /// @notice Get cleared amount by partition adjusted at timestamp
    /// @dev Uses ABAF factor to adjust the cleared amount for balance adjustments
    function getClearedAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) public view returns (uint256) {
        uint256 clearedAmount = ClearingStorageWrapper.getClearedAmountForByPartition(_partition, _tokenHolder);
        uint256 abaf = AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp);
        uint256 labaf = AdjustBalancesStorageWrapper.getTotalClearedLabafByPartition(_partition, _tokenHolder);
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(abaf, labaf);
        return clearedAmount * factor;
    }

    /// @notice Get clearing transfer data by partition adjusted at timestamp
    /// @dev Returns transfer data with ABAF-adjusted amount
    function getClearingTransferForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        clearingTransferData_ = ClearingStorageWrapper.getClearingTransferForByPartition(
            _partition,
            _tokenHolder,
            _clearingId
        );

        uint256 abaf = AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp);
        IClearingTypes.ClearingOperationIdentifier memory clearingId = IClearingTypes.ClearingOperationIdentifier({
            tokenHolder: _tokenHolder,
            partition: _partition,
            clearingId: _clearingId,
            clearingOperationType: IClearingTypes.ClearingOperationType.Transfer
        });
        uint256 labaf = AdjustBalancesStorageWrapper.getClearingLabafById(clearingId);
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(abaf, labaf);

        clearingTransferData_.amount *= factor;
    }

    /// @notice Get clearing redeem data by partition adjusted at timestamp
    /// @dev Returns redeem data with ABAF-adjusted amount
    function getClearingRedeemForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_) {
        clearingRedeemData_ = ClearingStorageWrapper.getClearingRedeemForByPartition(
            _partition,
            _tokenHolder,
            _clearingId
        );

        uint256 abaf = AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp);
        IClearingTypes.ClearingOperationIdentifier memory clearingId = IClearingTypes.ClearingOperationIdentifier({
            tokenHolder: _tokenHolder,
            partition: _partition,
            clearingId: _clearingId,
            clearingOperationType: IClearingTypes.ClearingOperationType.Redeem
        });
        uint256 labaf = AdjustBalancesStorageWrapper.getClearingLabafById(clearingId);
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(abaf, labaf);

        clearingRedeemData_.amount *= factor;
    }

    /// @notice Get clearing hold creation data by partition adjusted at timestamp
    /// @dev Returns hold creation data with ABAF-adjusted amount
    function getClearingHoldCreationForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_) {
        clearingHoldCreationData_ = ClearingStorageWrapper.getClearingHoldCreationForByPartition(
            _partition,
            _tokenHolder,
            _clearingId
        );

        uint256 abaf = AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp);
        IClearingTypes.ClearingOperationIdentifier memory clearingId = IClearingTypes.ClearingOperationIdentifier({
            tokenHolder: _tokenHolder,
            partition: _partition,
            clearingId: _clearingId,
            clearingOperationType: IClearingTypes.ClearingOperationType.HoldCreation
        });
        uint256 labaf = AdjustBalancesStorageWrapper.getClearingLabafById(clearingId);
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(abaf, labaf);

        clearingHoldCreationData_.amount *= factor;
    }

    // ==========================================================================
    // TIMESTAMP VALIDATION
    // ==========================================================================

    /// @notice Check clearing operation expiration timestamp
    function checkClearingExpirationTimestamp(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired,
        uint256 /* _blockTimestamp */
    ) public view {
        ClearingStorageWrapper.requireExpirationTimestamp(_clearingOperationIdentifier, _mustBeExpired);
    }

    /// @notice Validate that a clearing expiration timestamp is in the future
    function checkClearingValidExpirationTimestamp(uint256 _expirationTimestamp, uint256 _blockTimestamp) public pure {
        if (_expirationTimestamp < _blockTimestamp) revert WrongExpirationTimestamp();
    }
}
