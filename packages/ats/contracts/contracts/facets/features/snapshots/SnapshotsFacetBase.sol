// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { ISnapshots, Snapshots, PartitionSnapshots } from "../interfaces/snapshots/ISnapshots.sol";
import { ISnapshotsStorageWrapper } from "../interfaces/snapshots/ISnapshotsStorageWrapper.sol";
// solhint-disable-next-line max-line-length
import {
    IScheduledCrossOrderedTasks
} from "../../assetCapabilities/interfaces/scheduledTasks/scheduledCrossOrderedTasks/IScheduledCrossOrderedTasks.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibSnapshots } from "../../../lib/domain/LibSnapshots.sol";
import { LibABAF } from "../../../lib/domain/LibABAF.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibERC20 } from "../../../lib/domain/LibERC20.sol";
import { LibLock } from "../../../lib/domain/LibLock.sol";
import { LibHold } from "../../../lib/domain/LibHold.sol";
import { LibClearing } from "../../../lib/domain/LibClearing.sol";
import { LibFreeze } from "../../../lib/domain/LibFreeze.sol";
import { snapshotStorage, SnapshotStorage } from "../../../storage/AssetStorage.sol";
import { _SNAPSHOT_ROLE } from "../../../constants/roles.sol";

abstract contract SnapshotsFacetBase is ISnapshots, IStaticFunctionSelectors {
    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function takeSnapshot() external override returns (uint256 snapshotID_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_SNAPSHOT_ROLE, msg.sender);
        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
        snapshotID_ = LibSnapshots.takeSnapshot();
        emit ISnapshotsStorageWrapper.SnapshotTaken(msg.sender, snapshotID_);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function decimalsAtSnapshot(uint256 _snapshotID) external view override returns (uint8 decimals_) {
        (bool snapshotted, uint256 value) = LibSnapshots.valueAt(_snapshotID, snapshotStorage().decimals);
        decimals_ = snapshotted ? uint8(value) : LibERC20.getDecimals();
    }

    function balanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            snapshotStorage().accountBalanceSnapshots[_tokenHolder],
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
        SnapshotStorage storage ss = snapshotStorage();

        for (uint256 i = 0; i < holders_.length; i++) {
            uint256 index = i + 1;
            (bool snapshotted, address value) = LibSnapshots.addressValueAt(
                _snapshotID,
                ss.tokenHoldersSnapshots[index]
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
            snapshotStorage().accountPartitionBalanceSnapshots[_tokenHolder][_partition],
            LibABAF.balanceOfByPartitionAdjustedAt(_partition, _tokenHolder, _getBlockTimestamp())
        );
    }

    function partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (bytes32[] memory) {
        PartitionSnapshots storage partitionSnapshots = snapshotStorage().accountPartitionMetadata[_tokenHolder];
        (bool found, uint256 index) = LibSnapshots.indexFor(_snapshotID, partitionSnapshots.ids);
        if (!found) {
            return LibERC1410.partitionsOf(_tokenHolder);
        }
        return partitionSnapshots.values[index].partitions;
    }

    function totalSupplyAtSnapshot(uint256 _snapshotID) external view override returns (uint256 totalSupply_) {
        (bool snapshotted, uint256 value) = LibSnapshots.valueAt(_snapshotID, snapshotStorage().totalSupplySnapshots);
        totalSupply_ = snapshotted ? value : LibERC1410.totalSupply();
    }

    function totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) external view override returns (uint256 totalSupply_) {
        totalSupply_ = _queryAdjustedBalance(
            _snapshotID,
            snapshotStorage().totalSupplyByPartitionSnapshots[_partition],
            LibERC1410.totalSupplyByPartition(_partition)
        );
    }

    function lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            snapshotStorage().accountLockedBalanceSnapshots[_tokenHolder],
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
            snapshotStorage().accountPartitionLockedBalanceSnapshots[_tokenHolder][_partition],
            LibLock.getLockedAmountForByPartition(_partition, _tokenHolder)
        );
    }

    function heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            snapshotStorage().accountHeldBalanceSnapshots[_tokenHolder],
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
            snapshotStorage().accountPartitionHeldBalanceSnapshots[_tokenHolder][_partition],
            LibHold.getHeldAmountForByPartition(_partition, _tokenHolder)
        );
    }

    function clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            snapshotStorage().accountClearedBalanceSnapshots[_tokenHolder],
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
            snapshotStorage().accountPartitionClearedBalanceSnapshots[_tokenHolder][_partition],
            LibClearing.getClearedAmountByPartition(_partition, _tokenHolder)
        );
    }

    function frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _queryAdjustedBalance(
            _snapshotID,
            snapshotStorage().accountFrozenBalanceSnapshots[_tokenHolder],
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
            snapshotStorage().accountPartitionFrozenBalanceSnapshots[_tokenHolder][_partition],
            LibFreeze.getFrozenTokensByPartition(_tokenHolder, _partition)
        );
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // STATIC FUNCTION SELECTORS
    // ════════════════════════════════════════════════════════════════════════════════════

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](17);
        staticFunctionSelectors_[selectorIndex++] = this.takeSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOfAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupplyAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOfAtSnapshotByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.partitionsOfAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupplyAtSnapshotByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.lockedBalanceOfAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.lockedBalanceOfAtSnapshotByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.heldBalanceOfAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.heldBalanceOfAtSnapshotByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.clearedBalanceOfAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.clearedBalanceOfAtSnapshotByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.frozenBalanceOfAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.frozenBalanceOfAtSnapshotByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.decimalsAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTokenHoldersAtSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalTokenHoldersAtSnapshot.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ISnapshots).interfaceId;
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPER FUNCTIONS (renamed to avoid collision with Internals virtuals)
    // ════════════════════════════════════════════════════════════════════════════════════

    function _queryAdjustedBalance(
        uint256 snapshotId,
        Snapshots storage snapshots,
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
        (bool snapshotted, uint256 value) = LibSnapshots.valueAt(snapshotId, snapshotStorage().abafSnapshots);
        return snapshotted ? LibABAF.zeroToOne(value) : LibABAF.getAbaf();
    }

    function _queryTotalHolders(uint256 snapshotId) private view returns (uint256) {
        (bool snapshotted, uint256 value) = LibSnapshots.valueAt(
            snapshotId,
            snapshotStorage().totalTokenHoldersSnapshots
        );
        return snapshotted ? value : LibERC1410.getTotalTokenHolders();
    }
}
