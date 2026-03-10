// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// Domain Libraries
import { ABAFStorageWrapper } from "../asset/ABAFStorageWrapper.sol";
import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";

// Interfaces
import { IClearing } from "../../facets/core/clearing/IClearing.sol";
import { IClearingTransfer } from "../../facets/core/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../../facets/core/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../../facets/core/clearing/IClearingHoldCreation.sol";

/// @title ClearingReadOps
/// @notice Clearing read operations library - deployed once and called via DELEGATECALL
/// @dev Contains read-only clearing operations, clearing preparation, and timestamp validation
library ClearingReadOps {
    // ==========================================================================
    // ERRORS
    // ==========================================================================

    error WrongExpirationTimestamp();

    // ==========================================================================
    // CLEARING PREPARATION OPERATIONS
    // ==========================================================================

    /// @notice Prepare clearing operation (ABAF sync + snapshots)
    function beforeClearingOperation(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _to
    ) public {
        _adjustClearingBalances(_clearingOperationIdentifier, _to);
        SnapshotsStorageWrapper.updateAccountSnapshot(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition
        );
        SnapshotsStorageWrapper.updateAccountSnapshot(_to, _clearingOperationIdentifier.partition);
        SnapshotsStorageWrapper.updateAccountClearedBalancesSnapshot(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition
        );
    }

    /// @notice Update total cleared amount ABAF
    function updateTotalCleared(bytes32 _partition, address _tokenHolder) public returns (uint256 abaf_) {
        abaf_ = ABAFStorageWrapper.getAbaf();
        uint256 labaf = ABAFStorageWrapper.getTotalClearedLabaf(_tokenHolder);
        uint256 labafByPartition = ABAFStorageWrapper.getTotalClearedLabafByPartition(_partition, _tokenHolder);
        if (abaf_ != labaf) {
            ClearingStorageWrapper.updateTotalClearedAmountByAccount(
                _tokenHolder,
                ABAFStorageWrapper.calculateFactor(abaf_, labaf)
            );
            ABAFStorageWrapper.setTotalClearedLabaf(_tokenHolder, abaf_);
        }
        if (abaf_ != labafByPartition) {
            ClearingStorageWrapper.updateTotalClearedAmountByAccountAndPartition(
                _tokenHolder,
                _partition,
                ABAFStorageWrapper.calculateFactor(abaf_, labafByPartition)
            );
            ABAFStorageWrapper.setTotalClearedLabafByPartition(_partition, _tokenHolder, abaf_);
        }
    }

    // ==========================================================================
    // CLEARING READ OPERATIONS
    // ==========================================================================

    /// @notice Get cleared amount for token holder adjusted at timestamp
    function getClearedAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) public view returns (uint256) {
        return
            ClearingStorageWrapper.getClearedAmount(_tokenHolder) *
            ABAFStorageWrapper.calculateFactorForClearedAmountAdjustedAt(_tokenHolder, _timestamp);
    }

    /// @notice Get cleared amount by partition for token holder adjusted at timestamp
    function getClearedAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) public view returns (uint256) {
        uint256 factor = ABAFStorageWrapper.calculateFactor(
            ABAFStorageWrapper.getAbafAdjustedAt(_timestamp),
            ABAFStorageWrapper.getTotalClearedLabafByPartition(_partition, _tokenHolder)
        );
        return ClearingStorageWrapper.getClearedAmountByPartition(_partition, _tokenHolder) * factor;
    }

    /// @notice Get clearing transfer data by partition adjusted at timestamp
    function getClearingTransferForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        clearingTransferData_ = ClearingStorageWrapper.getClearingTransferData(_partition, _tokenHolder, _clearingId);
        clearingTransferData_.amount *= ABAFStorageWrapper.calculateFactor(
            ABAFStorageWrapper.getAbafAdjustedAt(_timestamp),
            ABAFStorageWrapper.getClearingLabafById(
                _buildClearingOperationIdentifier(
                    _tokenHolder,
                    _partition,
                    _clearingId,
                    IClearing.ClearingOperationType.Transfer
                )
            )
        );
    }

    /// @notice Get clearing redeem data by partition adjusted at timestamp
    function getClearingRedeemForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_) {
        clearingRedeemData_ = ClearingStorageWrapper.getClearingRedeemData(_partition, _tokenHolder, _clearingId);
        clearingRedeemData_.amount *= ABAFStorageWrapper.calculateFactor(
            ABAFStorageWrapper.getAbafAdjustedAt(_timestamp),
            ABAFStorageWrapper.getClearingLabafById(
                _buildClearingOperationIdentifier(
                    _tokenHolder,
                    _partition,
                    _clearingId,
                    IClearing.ClearingOperationType.Redeem
                )
            )
        );
    }

    /// @notice Get clearing hold creation data by partition adjusted at timestamp
    function getClearingHoldCreationForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_) {
        clearingHoldCreationData_ = ClearingStorageWrapper.getClearingHoldCreationData(
            _partition,
            _tokenHolder,
            _clearingId
        );
        clearingHoldCreationData_.amount *= ABAFStorageWrapper.calculateFactor(
            ABAFStorageWrapper.getAbafAdjustedAt(_timestamp),
            ABAFStorageWrapper.getClearingLabafById(
                _buildClearingOperationIdentifier(
                    _tokenHolder,
                    _partition,
                    _clearingId,
                    IClearing.ClearingOperationType.HoldCreation
                )
            )
        );
    }

    // ==========================================================================
    // TIMESTAMP VALIDATION
    // ==========================================================================

    /// @notice Check clearing operation expiration timestamp
    function checkClearingExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired,
        uint256 _blockTimestamp
    ) public view {
        (uint256 expirationTimestamp, , ) = ClearingStorageWrapper.getClearingBasicInfo(_clearingOperationIdentifier);
        if ((_blockTimestamp > expirationTimestamp) != _mustBeExpired) {
            if (_mustBeExpired) revert IClearing.ExpirationDateNotReached();
            revert IClearing.ExpirationDateReached();
        }
    }

    /// @notice Validate that a clearing expiration timestamp is in the future
    function checkClearingValidExpirationTimestamp(uint256 _expirationTimestamp, uint256 _blockTimestamp) public pure {
        if (_expirationTimestamp < _blockTimestamp) revert WrongExpirationTimestamp();
    }

    // ==========================================================================
    // PRIVATE HELPERS
    // ==========================================================================

    /// @notice Adjust clearing balances and update ABAF
    function _adjustClearingBalances(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _to
    ) private {
        ABAFStorageWrapper.triggerAndSyncAll(
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.tokenHolder,
            _to
        );
        uint256 abaf = updateTotalCleared(
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.tokenHolder
        );
        _updateClearing(_clearingOperationIdentifier, abaf);
    }

    /// @notice Update clearing amount based on ABAF change
    function _updateClearing(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _abaf
    ) private {
        uint256 clearingLabaf = ABAFStorageWrapper.getClearingLabafById(_clearingOperationIdentifier);
        if (_abaf == clearingLabaf) return;
        ClearingStorageWrapper.updateClearingAmount(
            _clearingOperationIdentifier,
            ABAFStorageWrapper.calculateFactor(_abaf, clearingLabaf)
        );
        ABAFStorageWrapper.setClearedLabafById(_clearingOperationIdentifier, _abaf);
    }

    /// @notice Build clearing operation identifier
    function _buildClearingOperationIdentifier(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _operationType
    ) private pure returns (IClearing.ClearingOperationIdentifier memory) {
        return
            IClearing.ClearingOperationIdentifier({
                tokenHolder: _from,
                partition: _partition,
                clearingId: _clearingId,
                clearingOperationType: _operationType
            });
    }
}
