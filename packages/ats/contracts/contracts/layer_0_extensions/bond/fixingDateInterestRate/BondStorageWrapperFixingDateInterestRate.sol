// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "contracts/layer_2/interfaces/bond/IBondRead.sol";
import { COUPON_LISTING_TASK_TYPE } from "../../../layer_0/constants/values.sol";
import { LowLevelCall } from "contracts/layer_0/common/libraries/LowLevelCall.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    ScheduledCrossOrderedTasksStorageWrapperFixingDateInterestRate
} from "./ScheduledCrossOrderedTasksStorageWrapper.sol";

abstract contract BondStorageWrapperFixingDateInterestRate is
    ScheduledCrossOrderedTasksStorageWrapperFixingDateInterestRate
{
    using LowLevelCall for address;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function _checkCoupon(
        IBondRead.Coupon memory _newCoupon,
        bytes4 _reasonCode,
        bytes memory _details
    ) internal virtual {
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) LowLevelCall.revertWithData(_reasonCode, _details);
    }

    function _initCoupon(bytes32 _actionId, IBondRead.Coupon memory _newCoupon) internal virtual override {
        super._initCoupon(_actionId, _newCoupon);

        _addScheduledCrossOrderedTask(_newCoupon.fixingDate, COUPON_LISTING_TASK_TYPE);
        _addScheduledCouponListing(_newCoupon.fixingDate, _actionId);
    }

    function _getCouponAdjustedAt(
        uint256 _couponID,
        function(uint256, IBondRead.Coupon memory) internal view returns (uint256, uint8) _calculateRate,
        uint256 _timestamp
    ) internal view virtual returns (IBondRead.RegisteredCoupon memory registeredCoupon_) {
        registeredCoupon_ = super._getCoupon(_couponID);

        if (registeredCoupon_.coupon.rateStatus == IBondRead.RateCalculationStatus.SET) return registeredCoupon_;

        if (registeredCoupon_.coupon.fixingDate > _timestamp) return registeredCoupon_;

        (registeredCoupon_.coupon.rate, registeredCoupon_.coupon.rateDecimals) = _calculateRate(
            _couponID,
            registeredCoupon_.coupon
        );
        registeredCoupon_.coupon.rateStatus = IBondRead.RateCalculationStatus.SET;
    }
}
