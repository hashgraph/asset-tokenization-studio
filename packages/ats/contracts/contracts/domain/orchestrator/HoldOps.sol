// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldStorageWrapper } from "../asset/HoldStorageWrapper.sol";
import { Hold, ProtectedHold, HoldIdentifier } from "../../facets/layer_1/hold/IHold.sol";
import { ThirdPartyType } from "../asset/types/ThirdPartyType.sol";

/// @title HoldOps - Orchestrator for hold operations
/// @notice Deployed once as a separate contract. Facets call via DELEGATECALL, keeping
/// facet bytecode thin. HoldStorageWrapper `internal` functions are inlined here, not in facets.
library HoldOps {
    // ============================================================================
    // Public functions — Hold Creation (deployed, called via DELEGATECALL)
    // ============================================================================

    /// @notice Create a hold by partition — orchestrates ABAF sync, snapshots, and balance
    function createHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 holdId_) {
        return HoldStorageWrapper.createHoldByPartition(_partition, _from, _hold, _operatorData, _thirdPartyType);
    }

    /// @notice Create a protected hold with EIP-712 signature verification
    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) public returns (bool success_, uint256 holdId_) {
        return HoldStorageWrapper.protectedCreateHoldByPartition(_partition, _from, _protectedHold, _signature);
    }

    // ============================================================================
    // Public functions — Hold Execution
    // ============================================================================

    /// @notice Execute a hold — transfer held amount to recipient
    function executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) public returns (bool success_, bytes32 partition_) {
        return HoldStorageWrapper.executeHoldByPartition(_holdIdentifier, _to, _amount);
    }

    /// @notice Release a hold — return held amount to token holder
    function releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) public returns (bool success_) {
        return HoldStorageWrapper.releaseHoldByPartition(_holdIdentifier, _amount);
    }

    /// @notice Reclaim an expired hold — return full held amount to token holder
    function reclaimHoldByPartition(
        HoldIdentifier calldata _holdIdentifier
    ) public returns (bool success_, uint256 amount_) {
        return HoldStorageWrapper.reclaimHoldByPartition(_holdIdentifier);
    }

    // ============================================================================
    // Public functions — Hold Allowance
    // ============================================================================

    /// @notice Decrease allowed balance for an authorized third-party hold
    function decreaseAllowedBalanceForHold(bytes32 _partition, address _from, uint256 _amount, uint256 _holdId) public {
        HoldStorageWrapper.decreaseAllowedBalanceForHold(_partition, _from, _amount, _holdId);
    }
}
