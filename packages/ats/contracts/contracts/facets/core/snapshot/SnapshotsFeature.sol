// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshots, Snapshots as SnapshotsStruct, PartitionSnapshots } from "../snapshot/ISnapshots.sol";
// solhint-disable-next-line max-line-length
import {
    IScheduledCrossOrderedTasks
} from "../../asset/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../../../domain/asset/SnapshotsStorageWrapper.sol";
import { ABAFStorageWrapper } from "../../../domain/asset/ABAFStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../../../domain/asset/ERC20StorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { HoldStorageWrapper } from "../../../domain/asset/HoldStorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../domain/core/ComplianceStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { _SNAPSHOT_ROLE } from "../../../constants/roles.sol";

abstract contract SnapshotsFeature is ISnapshots, TimestampProvider {
    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function takeSnapshot() external override returns (uint256 snapshotID_) {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_SNAPSHOT_ROLE, msg.sender);
        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
        snapshotID_ = SnapshotsStorageWrapper.takeSnapshot();
        emit SnapshotTaken(msg.sender, snapshotID_);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function decimalsAtSnapshot(uint256 _snapshotID) external view override returns (uint8 decimals_) {
        (bool snapshotted, uint256 value) = SnapshotsStorageWrapper.valueAt(
            _snapshotID,
            SnapshotsStorageWrapper.getDecimalsSnapshots()
        );
        decimals_ = snapshotted ? uint8(value) : ERC20StorageWrapper.getDecimals();
    }

    function balanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            SnapshotsStorageWrapper.getAccountBalanceSnapshots(_tokenHolder),
            ABAFStorageWrapper.balanceOfAdjustedAt(_tokenHolder, _getBlockTimestamp())
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
            (bool snapshotted, address value) = SnapshotsStorageWrapper.addressValueAt(
                _snapshotID,
                SnapshotsStorageWrapper.getTokenHolderSnapshots(index)
            );
            holders_[i] = snapshotted ? value : ERC1410StorageWrapper.getTokenHolder(index);
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
            SnapshotsStorageWrapper.getAccountPartitionBalanceSnapshots(_tokenHolder, _partition),
            ABAFStorageWrapper.balanceOfByPartitionAdjustedAt(_partition, _tokenHolder, _getBlockTimestamp())
        );
    }

    function partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (bytes32[] memory) {
        PartitionSnapshots storage partitionSnapshots = SnapshotsStorageWrapper.getAccountPartitionMetadata(
            _tokenHolder
        );
        (bool found, uint256 index) = SnapshotsStorageWrapper.indexFor(_snapshotID, partitionSnapshots.ids);
        if (!found) {
            return ERC1410StorageWrapper.partitionsOf(_tokenHolder);
        }
        return partitionSnapshots.values[index].partitions;
    }

    function totalSupplyAtSnapshot(uint256 _snapshotID) external view override returns (uint256 totalSupply_) {
        (bool snapshotted, uint256 value) = SnapshotsStorageWrapper.valueAt(
            _snapshotID,
            SnapshotsStorageWrapper.getTotalSupplySnapshots()
        );
        totalSupply_ = snapshotted ? value : ERC1410StorageWrapper.totalSupply();
    }

    function totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) external view override returns (uint256 totalSupply_) {
        totalSupply_ = _queryAdjustedBalance(
            _snapshotID,
            SnapshotsStorageWrapper.getTotalSupplyByPartitionSnapshots(_partition),
            ERC1410StorageWrapper.totalSupplyByPartition(_partition)
        );
    }

    function lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            SnapshotsStorageWrapper.getAccountLockedBalanceSnapshots(_tokenHolder),
            LockStorageWrapper.getLockedAmountFor(_tokenHolder)
        );
    }

    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            SnapshotsStorageWrapper.getAccountPartitionLockedBalanceSnapshots(_tokenHolder, _partition),
            LockStorageWrapper.getLockedAmountForByPartition(_partition, _tokenHolder)
        );
    }

    function heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            SnapshotsStorageWrapper.getAccountHeldBalanceSnapshots(_tokenHolder),
            HoldStorageWrapper.getHeldAmountFor(_tokenHolder)
        );
    }

    function heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            SnapshotsStorageWrapper.getAccountPartitionHeldBalanceSnapshots(_tokenHolder, _partition),
            HoldStorageWrapper.getHeldAmountForByPartition(_partition, _tokenHolder)
        );
    }

    function clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            SnapshotsStorageWrapper.getAccountClearedBalanceSnapshots(_tokenHolder),
            ClearingStorageWrapper.getClearedAmount(_tokenHolder)
        );
    }

    function clearedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            SnapshotsStorageWrapper.getAccountPartitionClearedBalanceSnapshots(_tokenHolder, _partition),
            ClearingStorageWrapper.getClearedAmountByPartition(_partition, _tokenHolder)
        );
    }

    function frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            SnapshotsStorageWrapper.getAccountFrozenBalanceSnapshots(_tokenHolder),
            ComplianceStorageWrapper.getFrozenTokens(_tokenHolder)
        );
    }

    function frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            SnapshotsStorageWrapper.getAccountPartitionFrozenBalanceSnapshots(_tokenHolder, _partition),
            ComplianceStorageWrapper.getFrozenTokensByPartition(_tokenHolder, _partition)
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
        (bool snapshotted, uint256 value) = SnapshotsStorageWrapper.valueAt(snapshotId, snapshots);
        if (snapshotted) return value;

        uint256 abafAtSnap = _queryAbafAt(snapshotId);
        uint256 abaf = ABAFStorageWrapper.getAbafAdjustedAt(_getBlockTimestamp());

        if (abafAtSnap == abaf) return currentBalanceAdjusted;

        uint256 factor = abaf / abafAtSnap;
        return currentBalanceAdjusted / factor;
    }

    function _queryAbafAt(uint256 snapshotId) private view returns (uint256) {
        (bool snapshotted, uint256 value) = SnapshotsStorageWrapper.valueAt(
            snapshotId,
            SnapshotsStorageWrapper.getAbafSnapshots()
        );
        return snapshotted ? ABAFStorageWrapper.zeroToOne(value) : ABAFStorageWrapper.getAbaf();
    }

    function _queryTotalHolders(uint256 snapshotId) private view returns (uint256) {
        (bool snapshotted, uint256 value) = SnapshotsStorageWrapper.valueAt(
            snapshotId,
            SnapshotsStorageWrapper.getTotalTokenHoldersSnapshots()
        );
        return snapshotted ? value : ERC1410StorageWrapper.getTotalTokenHolders();
    }
}
