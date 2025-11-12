// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledCouponListing
} from '../../../layer_2/interfaces/scheduledTasks/scheduledCouponListing/IScheduledCouponListing.sol';
import {
    ScheduledSnapshotsStorageWrapper
} from '../scheduledSnapshots/ScheduledSnapshotsStorageWrapper.sol';
import {
    ScheduledTasksLib
} from '../../../layer_2/scheduledTasks/ScheduledTasksLib.sol';
import {
    _SCHEDULED_COUPON_LISTING_STORAGE_POSITION
} from '../../constants/storagePositions.sol';
import {IBondRead} from '../../../layer_2/interfaces/bond/IBondRead.sol';
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from '../../../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol';
import {COUPON_LISTING_RESULT_ID} from '../../constants/values.sol';

abstract contract ScheduledCouponListingStorageWrapper is
    ScheduledSnapshotsStorageWrapper
{
    function _addScheduledCouponListing(
        uint256 _newScheduledTimestamp,
        bytes memory _newData
    ) internal {
        ScheduledTasksLib.addScheduledTask(
            _scheduledCouponListingtorage(),
            _newScheduledTimestamp,
            _newData
        );
    }

    function _triggerScheduledCouponListing(
        uint256 _max
    ) internal returns (uint256) {
        return
            _triggerScheduledTasks(
                _scheduledCouponListingtorage(),
                _onScheduledCouponListingTriggered,
                _max,
                _blockTimestamp()
            );
    }

    function _onScheduledCouponListingTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) internal {
        bytes memory data = _scheduledTask.data;

        if (data.length == 0) return;

        bytes32 actionId = abi.decode(data, (bytes32));

        _addToCouponsOrderedList(uint256(actionId));
        uint256 pos = _getCouponsOrderedListTotal();

        _updateCorporateActionResult(
            actionId,
            COUPON_LISTING_RESULT_ID,
            abi.encodePacked(pos)
        );
    }

    function _addToCouponsOrderedList(uint256 _couponID) internal virtual;
    function _getCouponsOrderedListTotal()
        internal
        view
        virtual
        returns (uint256 total_);

    function _getScheduledCouponListingCount() internal view returns (uint256) {
        return
            ScheduledTasksLib.getScheduledTaskCount(
                _scheduledCouponListingtorage()
            );
    }

    function _getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledCouponListing_) {
        return
            ScheduledTasksLib.getScheduledTasks(
                _scheduledCouponListingtorage(),
                _pageIndex,
                _pageLength
            );
    }

    function _getPendingScheduledCouponListingTotalAt(
        uint256 _timestamp
    ) internal view returns (uint256 total_) {
        total_ = 0;

        ScheduledTasksDataStorage
            storage scheduledCouponListing = _scheduledCouponListingtorage();

        uint256 scheduledTaskCount = ScheduledTasksLib.getScheduledTaskCount(
            scheduledCouponListing
        );

        for (uint256 i = 1; i <= scheduledTaskCount; i++) {
            uint256 pos = scheduledTaskCount - i;

            ScheduledTask memory scheduledTask = ScheduledTasksLib
                .getScheduledTasksByIndex(scheduledCouponListing, pos);

            if (scheduledTask.scheduledTimestamp < _timestamp) {
                total_ += 1;
            } else {
                break;
            }
        }
    }

    function _getScheduledCouponListingIdAtIndex(
        uint256 _index
    ) internal view returns (uint256 couponID_) {
        ScheduledTask memory couponListing = ScheduledTasksLib
            .getScheduledTasksByIndex(_scheduledCouponListingtorage(), _index);

        bytes32 actionId = abi.decode(couponListing.data, (bytes32));

        (, couponID_, ) = _getCorporateAction(actionId);
    }

    function _scheduledCouponListingtorage()
        internal
        pure
        returns (ScheduledTasksDataStorage storage scheduledCouponListing_)
    {
        bytes32 position = _SCHEDULED_COUPON_LISTING_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledCouponListing_.slot := position
        }
    }
}
