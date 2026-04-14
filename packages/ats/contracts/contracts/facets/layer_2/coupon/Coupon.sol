// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { ICoupon } from "./ICoupon.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { CouponStorageWrapper } from "../../../domain/asset/CouponStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";
import { InterestRateStorageWrapper } from "../../../domain/asset/InterestRateStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

error InterestRateIsKpiLinked();

abstract contract Coupon is ICoupon, TimestampProvider, Modifiers {
    function setCoupon(
        ICoupon.Coupon calldata _newCoupon
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidDates(_newCoupon.startDate, _newCoupon.endDate)
        onlyValidDates(_newCoupon.recordDate, _newCoupon.executionDate)
        onlyValidDates(_newCoupon.fixingDate, _newCoupon.executionDate)
        onlyValidTimestamp(_newCoupon.recordDate)
        onlyValidTimestamp(_newCoupon.fixingDate)
        returns (uint256 couponID_)
    {
        ICoupon.Coupon memory coupon = _prepareCoupon(_newCoupon);
        bytes32 corporateActionID;
        (corporateActionID, couponID_) = CouponStorageWrapper.setCoupon(coupon);
    }

    function cancelCoupon(
        uint256 _couponId
    )
        external
        override
        onlyUnpaused
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponId - 1)
        onlyRole(_CORPORATE_ACTION_ROLE)
        returns (bool success_)
    {
        (success_) = CouponStorageWrapper.cancelCoupon(_couponId);
        if (success_) {
            emit ICoupon.CouponCancelled(_couponId, EvmAccessors.getMsgSender());
        }
    }

    function getCoupon(
        uint256 _couponID
    )
        external
        view
        override
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (RegisteredCoupon memory registeredCoupon_, bool isDisabled_)
    {
        (registeredCoupon_, , isDisabled_) = CouponStorageWrapper.getCoupon(_couponID);
    }

    function getCouponFor(
        uint256 _couponID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (CouponFor memory couponFor_)
    {
        return CouponStorageWrapper.getCouponFor(_couponID, _account);
    }

    function getCouponsFor(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (CouponFor[] memory couponsFor_, address[] memory accounts_)
    {
        return CouponStorageWrapper.getCouponsFor(_couponID, _pageIndex, _pageLength);
    }

    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (CouponAmountFor memory couponAmountFor_)
    {
        return CouponStorageWrapper.getCouponAmountFor(_couponID, _account);
    }

    function getCouponCount() external view override returns (uint256 couponCount_) {
        return CouponStorageWrapper.getCouponCount();
    }

    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return CouponStorageWrapper.getCouponHolders(_couponID, _pageIndex, _pageLength);
    }

    function getTotalCouponHolders(uint256 _couponID) external view returns (uint256) {
        return CouponStorageWrapper.getTotalCouponHolders(_couponID);
    }

    function getCouponFromOrderedListAt(uint256 _pos) external view returns (uint256 couponID_) {
        return CouponStorageWrapper.getCouponFromOrderedListAt(_pos);
    }

    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory couponIDs_) {
        return CouponStorageWrapper.getCouponsOrderedList(_pageIndex, _pageLength);
    }

    function getCouponsOrderedListTotal() external view returns (uint256 total_) {
        return CouponStorageWrapper.getCouponsOrderedListTotalAdjustedAt(_getBlockTimestamp());
    }

    function _prepareCoupon(ICoupon.Coupon calldata _newCoupon) internal virtual returns (ICoupon.Coupon memory) {
        if (
            InterestRateStorageWrapper.isKpiLinkedRateInitialized() &&
            (_newCoupon.rateStatus != ICoupon.RateCalculationStatus.PENDING ||
                _newCoupon.rate != 0 ||
                _newCoupon.rateDecimals != 0)
        ) revert InterestRateIsKpiLinked();
        return _newCoupon;
    }
}
