// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshots, Snapshots as SnapshotsStruct, PartitionSnapshots } from "../snapshot/ISnapshots.sol";
// solhint-disable-next-line max-line-length
import {
    IScheduledCrossOrderedTasks
} from "../../asset/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol";
import { LibPause } from "../../../domain/core/LibPause.sol";
import { LibAccess } from "../../../domain/core/LibAccess.sol";
import { LibSnapshots } from "../../../domain/asset/LibSnapshots.sol";
import { LibABAF } from "../../../domain/asset/LibABAF.sol";
import { LibERC1410 } from "../../../domain/asset/LibERC1410.sol";
import { LibERC20 } from "../../../domain/asset/LibERC20.sol";
import { LibLock } from "../../../domain/asset/LibLock.sol";
import { LibHold } from "../../../domain/asset/LibHold.sol";
import { LibClearing } from "../../../domain/asset/LibClearing.sol";
import { LibFreeze } from "../../../domain/asset/LibFreeze.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { _SNAPSHOT_ROLE } from "../../../constants/roles.sol";

abstract contract SnapshotsFeature is ISnapshots, TimestampProvider {
    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function takeSnapshot() external override returns (uint256 snapshotID_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_SNAPSHOT_ROLE, msg.sender);
        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
        snapshotID_ = LibSnapshots.takeSnapshot();
        emit SnapshotTaken(msg.sender, snapshotID_);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function decimalsAtSnapshot(uint256 _snapshotID) external view override returns (uint8 decimals_) {
        (bool snapshotted, uint256 value) = LibSnapshots.valueAt(_snapshotID, LibSnapshots.getDecimalsSnapshots());
        decimals_ = snapshotted ? uint8(value) : LibERC20.getDecimals();
    }

    function balanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            LibSnapshots.getAccountBalanceSnapshots(_tokenHolder),
            LibABAF.balanceOfAdjustedAt(_tokenHolder, _getBlockTimestamp())
        );
    }

    function getTokenHoldersAtSnapshot(
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory holders_) {
        uint256 start = _pageIndex * _pageLength;
        uint256 end = start + _pageLength;
        uint256 total = _queryTotalHolders(_snapshotID);
        uint256 size = end > start ? (end > total ? total - start : end - start) : 0;

        holders_ = new address[](size);

        for (uint256 i = 0; i < holders_.length; i++) {
            uint256 index = i + 1;
            (bool snapshotted, address value) = LibSnapshots.addressValueAt(
                _snapshotID,
                LibSnapshots.getTokenHolderSnapshots(index)
            );
            holders_[i] = snapshotted ? value : LibERC1410.getTokenHolder(index);
        }
    }

    function getTotalTokenHoldersAtSnapshot(uint256 _snapshotID) external view override returns (uint256) {
        return _queryTotalHolders(_snapshotID);
    }

    function balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            LibSnapshots.getAccountPartitionBalanceSnapshots(_tokenHolder, _partition),
            LibABAF.balanceOfByPartitionAdjustedAt(_partition, _tokenHolder, _getBlockTimestamp())
        );
    }

    function partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (bytes32[] memory) {
        PartitionSnapshots storage partitionSnapshots = LibSnapshots.getAccountPartitionMetadata(_tokenHolder);
        (bool found, uint256 index) = LibSnapshots.indexFor(_snapshotID, partitionSnapshots.ids);
        if (!found) {
            return LibERC1410.partitionsOf(_tokenHolder);
        }
        return partitionSnapshots.values[index].partitions;
    }

    function totalSupplyAtSnapshot(uint256 _snapshotID) external view override returns (uint256 totalSupply_) {
        (bool snapshotted, uint256 value) = LibSnapshots.valueAt(_snapshotID, LibSnapshots.getTotalSupplySnapshots());
        totalSupply_ = snapshotted ? value : LibERC1410.totalSupply();
    }

    function totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) external view override returns (uint256 totalSupply_) {
        totalSupply_ = _queryAdjustedBalance(
            _snapshotID,
            LibSnapshots.getTotalSupplyByPartitionSnapshots(_partition),
            LibERC1410.totalSupplyByPartition(_partition)
        );
    }

    function lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            LibSnapshots.getAccountLockedBalanceSnapshots(_tokenHolder),
            LibLock.getLockedAmountFor(_tokenHolder)
        );
    }

    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            LibSnapshots.getAccountPartitionLockedBalanceSnapshots(_tokenHolder, _partition),
            LibLock.getLockedAmountForByPartition(_partition, _tokenHolder)
        );
    }

    function heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            LibSnapshots.getAccountHeldBalanceSnapshots(_tokenHolder),
            LibHold.getHeldAmountFor(_tokenHolder)
        );
    }

    function heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            LibSnapshots.getAccountPartitionHeldBalanceSnapshots(_tokenHolder, _partition),
            LibHold.getHeldAmountForByPartition(_partition, _tokenHolder)
        );
    }

    function clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            LibSnapshots.getAccountClearedBalanceSnapshots(_tokenHolder),
            LibClearing.getClearedAmount(_tokenHolder)
        );
    }

    function clearedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            LibSnapshots.getAccountPartitionClearedBalanceSnapshots(_tokenHolder, _partition),
            LibClearing.getClearedAmountByPartition(_partition, _tokenHolder)
        );
    }

    function frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            LibSnapshots.getAccountFrozenBalanceSnapshots(_tokenHolder),
            LibFreeze.getFrozenTokens(_tokenHolder)
        );
    }

    function frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            LibSnapshots.getAccountPartitionFrozenBalanceSnapshots(_tokenHolder, _partition),
            LibFreeze.getFrozenTokensByPartition(_tokenHolder, _partition)
        );
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    // ════════════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPER FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function _queryAdjustedBalance(
        uint256 snapshotId,
        SnapshotsStruct storage snapshots,
        uint256 currentBalanceAdjusted
    ) private view returns (uint256) {
        (bool snapshotted, uint256 value) = LibSnapshots.valueAt(snapshotId, snapshots);
        if (snapshotted) return value;

        uint256 abafAtSnap = _queryAbafAt(snapshotId);
        uint256 abaf = LibABAF.getAbafAdjustedAt(_getBlockTimestamp());

        if (abafAtSnap == abaf) return currentBalanceAdjusted;

        uint256 factor = abaf / abafAtSnap;
        return currentBalanceAdjusted / factor;
    }

    function _queryAbafAt(uint256 snapshotId) private view returns (uint256) {
        (bool snapshotted, uint256 value) = LibSnapshots.valueAt(snapshotId, LibSnapshots.getAbafSnapshots());
        return snapshotted ? LibABAF.zeroToOne(value) : LibABAF.getAbaf();
    }

    function _queryTotalHolders(uint256 snapshotId) private view returns (uint256) {
        (bool snapshotted, uint256 value) = LibSnapshots.valueAt(
            snapshotId,
            LibSnapshots.getTotalTokenHoldersSnapshots()
        );
        return snapshotted ? value : LibERC1410.getTotalTokenHolders();
    }
}
