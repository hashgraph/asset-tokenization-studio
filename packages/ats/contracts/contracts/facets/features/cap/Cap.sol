// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICap } from "../interfaces/ICap.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibCap } from "../../../lib/core/LibCap.sol";
import { LibABAF } from "../../../lib/domain/LibABAF.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";
import { _CAP_ROLE } from "../../../constants/roles.sol";
import { MAX_UINT256 } from "../../../constants/values.sol";

abstract contract Cap is ICap, TimestampProvider {
    error AlreadyInitialized();

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    // solhint-disable-next-line func-name-mixedcase
    function initialize_Cap(uint256 maxSupply, PartitionCap[] calldata partitionCap) external override {
        if (LibCap.isCapInitialized()) {
            revert AlreadyInitialized();
        }
        // At initialization, totalSupply is 0, so validation always passes the totalSupply check
        LibCap.requireValidNewMaxSupply(maxSupply, 0);

        bytes32[] memory partitions = new bytes32[](partitionCap.length);
        uint256[] memory partitionMaxSupplies = new uint256[](partitionCap.length);

        for (uint256 i = 0; i < partitionCap.length; ++i) {
            partitions[i] = partitionCap[i].partition;
            partitionMaxSupplies[i] = partitionCap[i].maxSupply;
        }

        LibCap.initializeCap(maxSupply, partitions, partitionMaxSupplies);
    }

    function setMaxSupply(uint256 _maxSupply) external override returns (bool success_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_CAP_ROLE, msg.sender);

        uint256 adjustedTotalSupply = _getAdjustedTotalSupply();
        LibCap.requireValidNewMaxSupply(_maxSupply, adjustedTotalSupply);
        LibCap.setMaxSupply(_maxSupply);
        success_ = true;
    }

    function setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply) external override returns (bool success_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_CAP_ROLE, msg.sender);

        uint256 adjustedTotalSupplyByPartition = _getAdjustedTotalSupplyByPartition(_partition);
        uint256 adjustedGlobalMaxSupply = _getAdjustedMaxSupply();
        LibCap.requireValidNewMaxSupplyByPartition(
            _partition,
            _maxSupply,
            adjustedTotalSupplyByPartition,
            adjustedGlobalMaxSupply
        );
        LibCap.setMaxSupplyByPartition(_partition, _maxSupply);
        success_ = true;
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function getMaxSupply() external view override returns (uint256 maxSupply_) {
        uint256 rawMaxSupply = LibCap.getMaxSupply();
        (uint256 pendingAbaf, ) = LibABAF.getPendingAbafAt(_getBlockTimestamp());

        uint256 limit = type(uint256).max / pendingAbaf;
        if (rawMaxSupply > limit) {
            return type(uint256).max;
        }

        return rawMaxSupply * pendingAbaf;
    }

    function getMaxSupplyByPartition(bytes32 _partition) external view override returns (uint256 maxSupply_) {
        uint256 rawMaxSupply = LibCap.getMaxSupplyByPartition(_partition);
        uint256 factor = LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_getBlockTimestamp()),
            LibABAF.getLabafByPartition(_partition)
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
        uint256 rawTotalSupply = LibERC1410.totalSupply();
        (uint256 pendingAbaf, ) = LibABAF.getPendingAbafAt(_getBlockTimestamp());
        return rawTotalSupply * pendingAbaf;
    }

    /// @dev Get ABAF-adjusted total supply by partition (uses abafAdjustedAt / labafByPartition)
    function _getAdjustedTotalSupplyByPartition(bytes32 _partition) internal view returns (uint256) {
        uint256 rawTotalSupply = LibERC1410.totalSupplyByPartition(_partition);
        uint256 factor = LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_getBlockTimestamp()),
            LibABAF.getLabafByPartition(_partition)
        );
        return rawTotalSupply * factor;
    }

    /// @dev Get pending-ABAF-adjusted global max supply
    function _getAdjustedMaxSupply() private view returns (uint256) {
        uint256 rawMaxSupply = LibCap.getMaxSupply();
        (uint256 pendingAbaf, ) = LibABAF.getPendingAbafAt(_getBlockTimestamp());

        uint256 limit = MAX_UINT256 / pendingAbaf;
        if (rawMaxSupply > limit) {
            return MAX_UINT256;
        }

        return rawMaxSupply * pendingAbaf;
    }
}
