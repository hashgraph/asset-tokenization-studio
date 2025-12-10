// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Common } from "../../../layer_0/common/Common.sol";
import { IBondRead } from "../../interfaces/bond/IBondRead.sol";
import { COUPON_LISTING_TASK_TYPE, COUPON_CORPORATE_ACTION_TYPE } from "../../../layer_0/constants/values.sol";
import { LowLevelCall } from "../../../layer_0/common/libraries/LowLevelCall.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { DecimalsLib } from "../../../layer_0/common/libraries/DecimalsLib.sol";

abstract contract BondStorageWrapperFixingDateInterestRate is Common {
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

        _addScheduledCrossOrderedTask(_newCoupon.fixingDate, abi.encode(COUPON_LISTING_TASK_TYPE));
        _addScheduledCouponListing(_newCoupon.fixingDate, abi.encode(_actionId));
    }

    function _getCouponAdjusted(
        uint256 _couponID,
        function(uint256, IBondRead.Coupon memory) internal view returns (uint256, uint8) _calculateRate
    ) internal view virtual returns (IBondRead.RegisteredCoupon memory registeredCoupon_) {
        registeredCoupon_ = super._getCoupon(_couponID);

        if (registeredCoupon_.coupon.rateStatus == IBondRead.RateCalculationStatus.SET) return registeredCoupon_;

        if (registeredCoupon_.coupon.fixingDate > _blockTimestamp()) return registeredCoupon_;

        (registeredCoupon_.coupon.rate, registeredCoupon_.coupon.rateDecimals) = _calculateRate(
            _couponID,
            registeredCoupon_.coupon
        );
        registeredCoupon_.coupon.rateStatus = IBondRead.RateCalculationStatus.SET;
    }
}
