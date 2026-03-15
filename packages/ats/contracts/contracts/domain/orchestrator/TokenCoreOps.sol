// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { HoldStorageWrapper } from "../asset/HoldStorageWrapper.sol";
import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { LockStorageWrapper } from "../asset/LockStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../asset/ERC20StorageWrapper.sol";
import { BasicTransferInfo, IssueData, OperatorTransferData } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410.sol";
import { IProtectedPartitionsStorageWrapper } from "../core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";

/// @title TokenCoreOps - Orchestrator for core token operations
/// @notice Deployed once as a separate contract. Facets call via DELEGATECALL, keeping
/// facet bytecode thin. StorageWrapper `internal` functions are inlined here, not in facets.
/// Internal balance aggregation functions are inlined into calling StorageWrappers
/// (e.g. ERC3643StorageWrapper). Frozen amounts are NOT included in balance aggregation —
/// they are added by ERC3643StorageWrapper.getTotalBalanceForAdjustedAt.
library TokenCoreOps {
    // ============================================================================
    // Public functions — Transfer Operations (deployed, called via DELEGATECALL)
    // ============================================================================

    /// @notice Transfer tokens by partition with hooks, compliance, and snapshots
    function transferByPartition(
        address _from,
        BasicTransferInfo memory _basicTransferInfo,
        bytes32 _partition,
        bytes memory _data,
        address _operator,
        bytes memory _operatorData
    ) public returns (bytes32) {
        return
            ERC1410StorageWrapper.transferByPartition(
                _from,
                _basicTransferInfo,
                _partition,
                _data,
                _operator,
                _operatorData
            );
    }

    /// @notice Operator transfer by partition
    function operatorTransferByPartition(OperatorTransferData calldata _operatorTransferData) public returns (bytes32) {
        return ERC1410StorageWrapper.operatorTransferByPartition(_operatorTransferData);
    }

    /// @notice Protected transfer with EIP-712 signature verification
    function protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) public returns (bytes32) {
        return ERC1410StorageWrapper.protectedTransferFromByPartition(_partition, _from, _to, _amount, _protectionData);
    }

    // ============================================================================
    // Public functions — Issue / Redeem
    // ============================================================================

    /// @notice Issue tokens by partition with hooks, compliance, and snapshots
    function issueByPartition(IssueData memory _issueData) public {
        ERC1410StorageWrapper.issueByPartition(_issueData);
    }

    /// @notice Redeem tokens by partition with hooks, compliance, and snapshots
    function redeemByPartition(
        bytes32 _partition,
        address _from,
        address _operator,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) public {
        ERC1410StorageWrapper.redeemByPartition(_partition, _from, _operator, _value, _data, _operatorData);
    }

    /// @notice Protected redeem with EIP-712 signature verification
    function protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) public {
        ERC1410StorageWrapper.protectedRedeemFromByPartition(_partition, _from, _amount, _protectionData);
    }

    // ============================================================================
    // Public functions — ERC20 Operations
    // ============================================================================

    /// @notice ERC20-style transfer on default partition
    function transfer(address _from, address _to, uint256 _value) public returns (bool) {
        return ERC20StorageWrapper.transfer(_from, _to, _value);
    }

    /// @notice ERC20-style transferFrom with allowance decrease
    function transferFrom(address _spender, address _from, address _to, uint256 _value) public returns (bool) {
        return ERC20StorageWrapper.transferFrom(_spender, _from, _to, _value);
    }

    /// @notice ERC20-style mint on default partition
    function mint(address _to, uint256 _value) public {
        ERC20StorageWrapper.mint(_to, _value);
    }

    /// @notice ERC20-style burn on default partition
    function burn(address _from, uint256 _value) public {
        ERC20StorageWrapper.burn(_from, _value);
    }

    /// @notice ERC20-style burnFrom with allowance decrease
    function burnFrom(address _account, uint256 _value) public {
        ERC20StorageWrapper.burnFrom(_account, _value);
    }

    // ============================================================================
    // Public functions — Approval Operations
    // ============================================================================

    /// @notice Set approval for spender
    function approve(address _owner, address _spender, uint256 _value) public returns (bool) {
        return ERC20StorageWrapper.approve(_owner, _spender, _value);
    }

    /// @notice Increase allowance with ABAF sync
    function increaseAllowance(address _spender, uint256 _addedValue) public returns (bool) {
        return ERC20StorageWrapper.increaseAllowance(_spender, _addedValue);
    }

    /// @notice Decrease allowance with ABAF sync
    function decreaseAllowance(address _spender, uint256 _subtractedValue) public returns (bool) {
        return ERC20StorageWrapper.decreaseAllowance(_spender, _subtractedValue);
    }

    /// @notice Sync balance adjustments before allowance changes
    function beforeAllowanceUpdate(address _owner, address _spender) public {
        ERC20StorageWrapper.beforeAllowanceUpdate(_owner, _spender);
    }

    // ============================================================================
    // Internal functions (inlined into calling StorageWrappers)
    // ============================================================================

    /// @notice Aggregates: base balance + locked + held + cleared (excludes frozen)
    function getTotalBalanceForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 totalBalance_) {
        totalBalance_ =
            AdjustBalancesStorageWrapper.balanceOfAdjustedAt(_tokenHolder, _timestamp) +
            LockStorageWrapper.getLockedAmountForAdjustedAt(_tokenHolder, _timestamp) +
            HoldStorageWrapper.getHeldAmountForAdjustedAt(_tokenHolder, _timestamp) +
            ClearingStorageWrapper.getClearedAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    /// @notice Aggregates partition: base + locked + held + cleared (excludes frozen)
    function getTotalBalanceForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 totalBalance_) {
        totalBalance_ =
            AdjustBalancesStorageWrapper.balanceOfByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            LockStorageWrapper.getLockedAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            HoldStorageWrapper.getHeldAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            ClearingStorageWrapper.getClearedAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp);
    }
}
