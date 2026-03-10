// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICap } from "../cap/ICap.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { CapStorageWrapper } from "../../../domain/core/CapStorageWrapper.sol";
import { ABAFStorageWrapper } from "../../../domain/asset/ABAFStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { _CAP_ROLE } from "../../../constants/roles.sol";
import { MAX_UINT256 } from "../../../constants/values.sol";

abstract contract Cap is ICap, TimestampProvider {
    error AlreadyInitialized();

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    // solhint-disable-next-line func-name-mixedcase
    function initialize_Cap(uint256 maxSupply, PartitionCap[] calldata partitionCap) external override {
        if (CapStorageWrapper.isCapInitialized()) {
            revert AlreadyInitialized();
        }
        // At initialization, totalSupply is 0, so validation always passes the totalSupply check
        CapStorageWrapper.requireValidNewMaxSupply(maxSupply, 0);

        bytes32[] memory partitions = new bytes32[](partitionCap.length);
        uint256[] memory partitionMaxSupplies = new uint256[](partitionCap.length);

        for (uint256 i = 0; i < partitionCap.length; ++i) {
            partitions[i] = partitionCap[i].partition;
            partitionMaxSupplies[i] = partitionCap[i].maxSupply;
        }

        CapStorageWrapper.initializeCap(maxSupply, partitions, partitionMaxSupplies);
    }

    function setMaxSupply(uint256 _maxSupply) external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_CAP_ROLE, msg.sender);

        uint256 adjustedTotalSupply = _getAdjustedTotalSupply();
        CapStorageWrapper.requireValidNewMaxSupply(_maxSupply, adjustedTotalSupply);
        CapStorageWrapper.setMaxSupply(_maxSupply);
        success_ = true;
    }

    function setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply) external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_CAP_ROLE, msg.sender);

        uint256 adjustedTotalSupplyByPartition = _getAdjustedTotalSupplyByPartition(_partition);
        uint256 adjustedGlobalMaxSupply = _getAdjustedMaxSupply();
        CapStorageWrapper.requireValidNewMaxSupplyByPartition(
            _partition,
            _maxSupply,
            adjustedTotalSupplyByPartition,
            adjustedGlobalMaxSupply
        );
        CapStorageWrapper.setMaxSupplyByPartition(_partition, _maxSupply);
        success_ = true;
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function getMaxSupply() external view override returns (uint256 maxSupply_) {
        uint256 rawMaxSupply = CapStorageWrapper.getMaxSupply();
        (uint256 pendingAbaf, ) = ABAFStorageWrapper.getPendingAbafAt(_getBlockTimestamp());

        uint256 limit = type(uint256).max / pendingAbaf;
        if (rawMaxSupply > limit) {
            return type(uint256).max;
        }

        return rawMaxSupply * pendingAbaf;
    }

    function getMaxSupplyByPartition(bytes32 _partition) external view override returns (uint256 maxSupply_) {
        uint256 rawMaxSupply = CapStorageWrapper.getMaxSupplyByPartition(_partition);
        uint256 factor = ABAFStorageWrapper.calculateFactor(
            ABAFStorageWrapper.getAbafAdjustedAt(_getBlockTimestamp()),
            ABAFStorageWrapper.getLabafByPartition(_partition)
        );

        uint256 limit = type(uint256).max / factor;
        if (rawMaxSupply > limit) {
            return type(uint256).max;
        }

        return rawMaxSupply * factor;
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    /// @dev Get pending-ABAF-adjusted total supply (global uses pendingAbaf only)
    function _getAdjustedTotalSupply() internal view returns (uint256) {
        uint256 rawTotalSupply = ERC1410StorageWrapper.totalSupply();
        (uint256 pendingAbaf, ) = ABAFStorageWrapper.getPendingAbafAt(_getBlockTimestamp());
        return rawTotalSupply * pendingAbaf;
    }

    /// @dev Get ABAF-adjusted total supply by partition (uses abafAdjustedAt / labafByPartition)
    function _getAdjustedTotalSupplyByPartition(bytes32 _partition) internal view returns (uint256) {
        uint256 rawTotalSupply = ERC1410StorageWrapper.totalSupplyByPartition(_partition);
        uint256 factor = ABAFStorageWrapper.calculateFactor(
            ABAFStorageWrapper.getAbafAdjustedAt(_getBlockTimestamp()),
            ABAFStorageWrapper.getLabafByPartition(_partition)
        );
        return rawTotalSupply * factor;
    }

    /// @dev Get pending-ABAF-adjusted global max supply
    function _getAdjustedMaxSupply() private view returns (uint256) {
        uint256 rawMaxSupply = CapStorageWrapper.getMaxSupply();
        (uint256 pendingAbaf, ) = ABAFStorageWrapper.getPendingAbafAt(_getBlockTimestamp());

        uint256 limit = MAX_UINT256 / pendingAbaf;
        if (rawMaxSupply > limit) {
            return MAX_UINT256;
        }

        return rawMaxSupply * pendingAbaf;
    }
}
