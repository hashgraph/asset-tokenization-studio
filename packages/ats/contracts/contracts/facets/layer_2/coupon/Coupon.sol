// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoupon } from "./ICoupon.sol";
import { ICouponTypes } from "./ICouponTypes.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { CouponStorageWrapper } from "../../../domain/asset/coupon/CouponStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";

abstract contract Coupon is ICoupon, Modifiers {
    function setCoupon(
        ICouponTypes.Coupon calldata _newCoupon
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
        ICouponTypes.Coupon memory prepared = _prepareCoupon(_newCoupon);
        (, couponID_) = CouponStorageWrapper.setCoupon(prepared);
    }

    function cancelCoupon(
        uint256 _couponID
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (bool success_)
    {
        success_ = CouponStorageWrapper.cancelCoupon(_couponID);
    }

    function getCoupon(
        uint256 _couponID
    )
        external
        view
        override
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (ICouponTypes.RegisteredCoupon memory registeredCoupon_, bool isDisabled_)
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
        returns (ICouponTypes.CouponFor memory couponFor_)
    {
        couponFor_ = CouponStorageWrapper.getCouponFor(_couponID, _account);
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
        returns (ICouponTypes.CouponFor[] memory couponFor_, address[] memory accounts_)
    {
        address[] memory holders = CouponStorageWrapper.getCouponHolders(_couponID, _pageIndex, _pageLength);
        accounts_ = holders;
        couponFor_ = new ICouponTypes.CouponFor[](holders.length);
        for (uint256 i; i < holders.length; ) {
            couponFor_[i] = CouponStorageWrapper.getCouponFor(_couponID, holders[i]);
            unchecked {
                ++i;
            }
        }
    }

    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (ICouponTypes.CouponAmountFor memory couponAmountFor_)
    {
        couponAmountFor_ = CouponStorageWrapper.getCouponAmountFor(_couponID, _account);
    }

    function getCouponCount() external view override returns (uint256 couponCount_) {
        couponCount_ = CouponStorageWrapper.getCouponCount();
    }

    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (address[] memory holders_)
    {
        holders_ = CouponStorageWrapper.getCouponHolders(_couponID, _pageIndex, _pageLength);
    }

    function getTotalCouponHolders(
        uint256 _couponID
    ) external view override onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1) returns (uint256) {
        return CouponStorageWrapper.getTotalCouponHolders(_couponID);
    }

    function getCouponFromOrderedListAt(uint256 _pos) external view override returns (uint256 couponID_) {
        couponID_ = CouponStorageWrapper.getCouponFromOrderedListAt(_pos);
    }

    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory couponIDs_) {
        couponIDs_ = CouponStorageWrapper.getCouponsOrderedList(_pageIndex, _pageLength);
    }

    function getCouponsOrderedListTotal() external view override returns (uint256 total_) {
        total_ = CouponStorageWrapper.getCouponsOrderedListTotal();
    }

    function _prepareCoupon(
        ICouponTypes.Coupon calldata _newCoupon
    ) internal view virtual returns (ICouponTypes.Coupon memory coupon_) {
        coupon_ = _newCoupon;
    }
}
