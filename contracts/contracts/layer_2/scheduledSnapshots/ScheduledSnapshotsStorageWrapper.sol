// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import {
    _SCHEDULED_SNAPSHOTS_STORAGE_POSITION
} from '../constants/storagePositions.sol';
import {
    ERC1410SnapshotStorageWrapper
} from '../../layer_1/ERC1400/ERC1410//ERC1410SnapshotStorageWrapper.sol';
import {
    IScheduledSnapshots
} from '../interfaces/scheduledSnapshots/IScheduledSnapshots.sol';
import {LibCommon} from '../../layer_1/common/LibCommon.sol';
import {
    IScheduledSnapshotsStorageWrapper
} from '../interfaces/scheduledSnapshots/IScheduledSnapshotsStorageWrapper.sol';

abstract contract ScheduledSnapshotsStorageWrapper is
    IScheduledSnapshotsStorageWrapper,
    ERC1410SnapshotStorageWrapper
{
    struct ScheduledSnapshotsDataStorage {
        mapping(uint256 => IScheduledSnapshots.ScheduledSnapshot) scheduledSnapshots;
        uint256 scheduledSnapshotCount;
    }

    modifier checkTimestamp(uint256 timestamp) {
        if (timestamp <= _blockTimestamp()) {
            revert WrongTimestamp(timestamp);
        }
        _;
    }

    function _addScheduledSnapshot(
        uint256 newScheduledTimestamp,
        bytes memory newData
    ) internal virtual {
        IScheduledSnapshots.ScheduledSnapshot
            memory newScheduledSnapshot = IScheduledSnapshots.ScheduledSnapshot(
                newScheduledTimestamp,
                newData
            );

        uint256 scheduledSnapshotsLength = _getScheduledSnapshotCount();

        uint256 newScheduledSnapshotId = scheduledSnapshotsLength;

        bool added = false;

        if (scheduledSnapshotsLength > 0) {
            for (
                uint256 index = 1;
                index <= scheduledSnapshotsLength;
                index++
            ) {
                uint256 scheduledSnapshotPosition = scheduledSnapshotsLength -
                    index;

                if (
                    _scheduledSnapshotsStorage()
                        .scheduledSnapshots[scheduledSnapshotPosition]
                        .scheduledTimestamp < newScheduledTimestamp
                ) {
                    _slideScheduledSnapshots(scheduledSnapshotPosition);
                } else {
                    newScheduledSnapshotId = scheduledSnapshotPosition + 1;
                    _insertScheduledSnapshot(
                        newScheduledSnapshotId,
                        newScheduledSnapshot
                    );
                    added = true;
                    break;
                }
            }
        }
        if (!added) {
            _insertScheduledSnapshot(0, newScheduledSnapshot);
        }
    }

    function _triggerScheduledSnapshots(
        uint256 max
    ) internal virtual returns (uint256) {
        uint256 scheduledSnapshotsLength = _getScheduledSnapshotCount();

        if (scheduledSnapshotsLength == 0) {
            return 0;
        }

        uint256 _max = max;

        uint256 newSnapShotID;

        if (max > scheduledSnapshotsLength || max == 0) {
            _max = scheduledSnapshotsLength;
        }

        for (uint256 j = 1; j <= scheduledSnapshotsLength; j++) {
            uint256 pos = scheduledSnapshotsLength - j;

            IScheduledSnapshots.ScheduledSnapshot
                memory currentScheduledSnapshot = _getScheduledSnapshotsByIndex(
                    pos
                );

            if (
                currentScheduledSnapshot.scheduledTimestamp < _blockTimestamp()
            ) {
                if (pos == scheduledSnapshotsLength - 1) {
                    newSnapShotID = _snapshot();
                }

                _popScheduledSnapshot();

                _onScheduledSnapshotTriggered(
                    newSnapShotID,
                    currentScheduledSnapshot.data
                );
            } else {
                break;
            }
        }

        return newSnapShotID;
    }

    function _getScheduledSnapshotCount()
        internal
        view
        virtual
        returns (uint256)
    {
        return _scheduledSnapshotsStorage().scheduledSnapshotCount;
    }

    function _getScheduledSnapshotsByIndex(
        uint256 index
    )
        internal
        view
        virtual
        returns (IScheduledSnapshots.ScheduledSnapshot memory)
    {
        return _scheduledSnapshotsStorage().scheduledSnapshots[index];
    }

    function _slideScheduledSnapshots(uint256 pos) private {
        _scheduledSnapshotsStorage()
            .scheduledSnapshots[pos + 1]
            .scheduledTimestamp = _scheduledSnapshotsStorage()
            .scheduledSnapshots[pos]
            .scheduledTimestamp;
        _scheduledSnapshotsStorage()
            .scheduledSnapshots[pos + 1]
            .data = _scheduledSnapshotsStorage().scheduledSnapshots[pos].data;
    }

    function _insertScheduledSnapshot(
        uint256 pos,
        IScheduledSnapshots.ScheduledSnapshot memory scheduledSnapshotToInsert
    ) private {
        _scheduledSnapshotsStorage()
            .scheduledSnapshots[pos]
            .scheduledTimestamp = scheduledSnapshotToInsert.scheduledTimestamp;
        _scheduledSnapshotsStorage()
            .scheduledSnapshots[pos]
            .data = scheduledSnapshotToInsert.data;
        _scheduledSnapshotsStorage().scheduledSnapshotCount++;
    }

    function _popScheduledSnapshot() private {
        uint256 scheduledSnapshotsLength = _getScheduledSnapshotCount();
        if (scheduledSnapshotsLength == 0) {
            return;
        }
        delete (
            _scheduledSnapshotsStorage().scheduledSnapshots[
                scheduledSnapshotsLength - 1
            ]
        );
        _scheduledSnapshotsStorage().scheduledSnapshotCount--;
    }

    function _getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        internal
        view
        virtual
        returns (
            IScheduledSnapshots.ScheduledSnapshot[] memory scheduledSnapshot_
        )
    {
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(
            _pageIndex,
            _pageLength
        );

        scheduledSnapshot_ = new IScheduledSnapshots.ScheduledSnapshot[](
            LibCommon.getSize(start, end, _getScheduledSnapshotCount())
        );

        for (uint256 i = 0; i < scheduledSnapshot_.length; i++) {
            scheduledSnapshot_[i] = _getScheduledSnapshotsByIndex(start + i);
        }
    }

    function _onScheduledSnapshotTriggered(
        uint256 snapShotID,
        bytes memory data
    ) internal virtual;

    function _scheduledSnapshotsStorage()
        internal
        pure
        virtual
        returns (ScheduledSnapshotsDataStorage storage scheduledSnapshots_)
    {
        bytes32 position = _SCHEDULED_SNAPSHOTS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledSnapshots_.slot := position
        }
    }
}
