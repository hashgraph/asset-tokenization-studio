// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// Domain Libraries
import { LibABAF } from "../domain/LibABAF.sol";
import { LibClearing } from "../domain/LibClearing.sol";
import { LibSnapshots } from "../domain/LibSnapshots.sol";

// Interfaces
import { IClearing } from "../../facets/features/interfaces/clearing/IClearing.sol";
import { IClearingTransfer } from "../../facets/features/interfaces/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../../facets/features/interfaces/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../../facets/features/interfaces/clearing/IClearingHoldCreation.sol";

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
        LibSnapshots.updateAccountSnapshot(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition
        );
        LibSnapshots.updateAccountSnapshot(_to, _clearingOperationIdentifier.partition);
        LibSnapshots.updateAccountClearedBalancesSnapshot(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition
        );
    }

    /// @notice Update total cleared amount ABAF
    function updateTotalCleared(bytes32 _partition, address _tokenHolder) public returns (uint256 abaf_) {
        abaf_ = LibABAF.getAbaf();
        uint256 labaf = LibABAF.getTotalClearedLabaf(_tokenHolder);
        uint256 labafByPartition = LibABAF.getTotalClearedLabafByPartition(_partition, _tokenHolder);
        if (abaf_ != labaf) {
            LibClearing.updateTotalClearedAmountByAccount(_tokenHolder, LibABAF.calculateFactor(abaf_, labaf));
            LibABAF.setTotalClearedLabaf(_tokenHolder, abaf_);
        }
        if (abaf_ != labafByPartition) {
            LibClearing.updateTotalClearedAmountByAccountAndPartition(
                _tokenHolder,
                _partition,
                LibABAF.calculateFactor(abaf_, labafByPartition)
            );
            LibABAF.setTotalClearedLabafByPartition(_partition, _tokenHolder, abaf_);
        }
    }

    // ==========================================================================
    // CLEARING READ OPERATIONS
    // ==========================================================================

    /// @notice Get cleared amount for token holder adjusted at timestamp
    function getClearedAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) public view returns (uint256) {
        return
            LibClearing.getClearedAmount(_tokenHolder) *
            LibABAF.calculateFactorForClearedAmountAdjustedAt(_tokenHolder, _timestamp);
    }

    /// @notice Get cleared amount by partition for token holder adjusted at timestamp
    function getClearedAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) public view returns (uint256) {
        uint256 factor = LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getTotalClearedLabafByPartition(_partition, _tokenHolder)
        );
        return LibClearing.getClearedAmountByPartition(_partition, _tokenHolder) * factor;
    }

    /// @notice Get clearing transfer data by partition adjusted at timestamp
    function getClearingTransferForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        clearingTransferData_ = LibClearing.getClearingTransferData(_partition, _tokenHolder, _clearingId);
        clearingTransferData_.amount *= LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getClearingLabafById(
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
        clearingRedeemData_ = LibClearing.getClearingRedeemData(_partition, _tokenHolder, _clearingId);
        clearingRedeemData_.amount *= LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getClearingLabafById(
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
        clearingHoldCreationData_ = LibClearing.getClearingHoldCreationData(_partition, _tokenHolder, _clearingId);
        clearingHoldCreationData_.amount *= LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getClearingLabafById(
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
        (uint256 expirationTimestamp, , ) = LibClearing.getClearingBasicInfo(_clearingOperationIdentifier);
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
        LibABAF.triggerAndSyncAll(
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
        uint256 clearingLabaf = LibABAF.getClearingLabafById(_clearingOperationIdentifier);
        if (_abaf == clearingLabaf) return;
        LibClearing.updateClearingAmount(_clearingOperationIdentifier, LibABAF.calculateFactor(_abaf, clearingLabaf));
        LibABAF.setClearedLabafById(_clearingOperationIdentifier, _abaf);
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
