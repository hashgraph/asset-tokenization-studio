// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Common } from "../../../layer_0/common/Common.sol";
import { COUPON_LISTING_TASK_TYPE } from "../../../layer_0/constants/values.sol";

abstract contract ScheduledCrossOrderedTasksStorageWrapperFixingDateInterestRate is Common {
    function _postOnScheduledCrossOrderedTaskTriggered(bytes32 taskType) internal override {
        if (taskType == COUPON_LISTING_TASK_TYPE) {
            _triggerScheduledCouponListing(1);
            return;
        }
    }
}
