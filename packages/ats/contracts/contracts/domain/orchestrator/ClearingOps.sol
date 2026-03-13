// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { IClearing } from "../../facets/layer_1/clearing/IClearing.sol";
import { Hold } from "../../facets/layer_1/hold/IHold.sol";
import { ThirdPartyType } from "../asset/types/ThirdPartyType.sol";

/// @title ClearingOps - Orchestrator for clearing state-changing operations
/// @notice Deployed once as a separate contract. Facets call via DELEGATECALL, keeping
/// facet bytecode thin. ClearingStorageWrapper `internal` functions are inlined here,
/// not in facets.
library ClearingOps {
    // ============================================================================
    // Public functions — Clearing Creation (deployed, called via DELEGATECALL)
    // ============================================================================

    /// @notice Create a clearing transfer operation
    function clearingTransferCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _to,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        return
            ClearingStorageWrapper._clearingTransferCreation(
                _clearingOperation,
                _amount,
                _to,
                _from,
                _operatorData,
                _thirdPartyType
            );
    }

    /// @notice Create a clearing redeem operation
    function clearingRedeemCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        return
            ClearingStorageWrapper._clearingRedeemCreation(
                _clearingOperation,
                _amount,
                _from,
                _operatorData,
                _thirdPartyType
            );
    }

    /// @notice Create a clearing hold creation operation
    function clearingHoldCreationCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        address _from,
        Hold calldata _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        return
            ClearingStorageWrapper._clearingHoldCreationCreation(
                _clearingOperation,
                _from,
                _hold,
                _operatorData,
                _thirdPartyType
            );
    }

    // ============================================================================
    // Public functions — Clearing Actions (approve / cancel / reclaim)
    // ============================================================================

    /// @notice Approve a clearing operation — executes the clearing transfer/redeem/hold
    function approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        return ClearingStorageWrapper._approveClearingOperationByPartition(_clearingOperationIdentifier);
    }

    /// @notice Cancel a clearing operation — returns tokens to holder
    function cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_) {
        return ClearingStorageWrapper._cancelClearingOperationByPartition(_clearingOperationIdentifier);
    }

    /// @notice Reclaim an expired clearing operation — returns tokens to holder
    function reclaimClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_) {
        return ClearingStorageWrapper._reclaimClearingOperationByPartition(_clearingOperationIdentifier);
    }

    // ============================================================================
    // Public functions — Protected Clearing Operations
    // ============================================================================

    /// @notice Protected clearing transfer with EIP-712 signature verification
    function protectedClearingTransferByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) public returns (bool success_, uint256 clearingId_) {
        return
            ClearingStorageWrapper._protectedClearingTransferByPartition(
                _protectedClearingOperation,
                _amount,
                _to,
                _signature
            );
    }

    /// @notice Protected clearing redeem with EIP-712 signature verification
    function protectedClearingRedeemByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) public returns (bool success_, uint256 clearingId_) {
        return
            ClearingStorageWrapper._protectedClearingRedeemByPartition(
                _protectedClearingOperation,
                _amount,
                _signature
            );
    }

    /// @notice Protected clearing hold creation with EIP-712 signature verification
    function protectedClearingCreateHoldByPartition(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold calldata _hold,
        bytes calldata _signature
    ) public returns (bool success_, uint256 clearingId_) {
        return
            ClearingStorageWrapper._protectedClearingCreateHoldByPartition(
                _protectedClearingOperation,
                _hold,
                _signature
            );
    }

    // ============================================================================
    // Public functions — Clearing Allowance
    // ============================================================================

    /// @notice Decrease allowed balance for an authorized third-party clearing
    function decreaseAllowedBalanceForClearing(
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _clearingOperationType,
        address _from,
        uint256 _amount
    ) public {
        ClearingStorageWrapper._decreaseAllowedBalanceForClearing(
            _partition,
            _clearingId,
            _clearingOperationType,
            _from,
            _amount
        );
    }
}
