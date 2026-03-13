// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { IClearing } from "../../facets/layer_1/clearing/IClearing.sol";
import { IClearingTransfer } from "../../facets/layer_1/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../../facets/layer_1/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../../facets/layer_1/clearing/IClearingHoldCreation.sol";

/// @title ClearingReadOps - Orchestrator for clearing read and preparation operations
/// @notice Deployed once as a separate contract. Facets call via DELEGATECALL, keeping
/// facet bytecode thin. ClearingStorageWrapper `internal` functions are inlined here,
/// not in facets.
library ClearingReadOps {
    // ============================================================================
    // Public functions — Clearing Preparation (deployed, called via DELEGATECALL)
    // ============================================================================

    /// @notice Prepare clearing operation — ABAF sync + snapshots before state changes
    function beforeClearingOperation(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _to
    ) public {
        ClearingStorageWrapper._beforeClearingOperation(_clearingOperationIdentifier, _to);
    }

    // ============================================================================
    // Public functions — Adjusted Read Operations
    // ============================================================================

    /// @notice Get cleared amount for token holder adjusted at timestamp
    function getClearedAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) public view returns (uint256) {
        return ClearingStorageWrapper._getClearedAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    /// @notice Get cleared amount by partition adjusted at timestamp
    function getClearedAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) public view returns (uint256) {
        return ClearingStorageWrapper._getClearedAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp);
    }

    /// @notice Get clearing transfer data adjusted at timestamp
    function getClearingTransferForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        return
            ClearingStorageWrapper._getClearingTransferForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                _timestamp
            );
    }

    /// @notice Get clearing redeem data adjusted at timestamp
    function getClearingRedeemForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_) {
        return
            ClearingStorageWrapper._getClearingRedeemForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                _timestamp
            );
    }

    /// @notice Get clearing hold creation data adjusted at timestamp
    function getClearingHoldCreationForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) public view returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_) {
        return
            ClearingStorageWrapper._getClearingHoldCreationForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                _timestamp
            );
    }

    // ============================================================================
    // Public functions — Guard / Validation
    // ============================================================================

    /// @notice Require valid clearing ID
    function requireValidClearingId(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public view {
        ClearingStorageWrapper._requireValidClearingId(_clearingOperationIdentifier);
    }

    /// @notice Require clearing feature is activated
    function requireClearingActivated() public view {
        ClearingStorageWrapper._requireClearingActivated();
    }

    /// @notice Require clearing operation expiration timestamp meets condition
    function requireExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired
    ) public view {
        ClearingStorageWrapper._requireExpirationTimestamp(_clearingOperationIdentifier, _mustBeExpired);
    }
}
