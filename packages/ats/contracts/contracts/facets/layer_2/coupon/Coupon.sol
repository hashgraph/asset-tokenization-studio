// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoupon } from "./ICoupon.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { Internals } from "../../../domain/Internals.sol";

abstract contract Coupon is ICoupon, Internals {
    function setCoupon(
        ICoupon.Coupon calldata _newCoupon
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        validateDates(_newCoupon.startDate, _newCoupon.endDate)
        validateDates(_newCoupon.recordDate, _newCoupon.executionDate)
        validateDates(_newCoupon.fixingDate, _newCoupon.executionDate)
        onlyValidTimestamp(_newCoupon.recordDate)
        onlyValidTimestamp(_newCoupon.fixingDate)
        returns (uint256 couponID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, couponID_) = _setCoupon(_newCoupon);
    }

    function cancelCoupon(
        uint256 _couponID
    )
        external
        override
        onlyUnpaused
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        onlyRole(_CORPORATE_ACTION_ROLE)
        returns (bool success_)
    {
        (success_) = _cancelCoupon(_couponID);
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
        (registeredCoupon_, , isDisabled_) = _getCoupon(_couponID);
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
        return _getCouponFor(_couponID, _account);
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
        returns (CouponFor[] memory couponFor_, address[] memory accounts_)
    {
        (couponFor_, accounts_) = _getCouponsFor(_couponID, _pageIndex, _pageLength);
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
        return _getCouponAmountFor(_couponID, _account);
    }

    function getCouponCount() external view override returns (uint256 couponCount_) {
        return _getCouponCount();
    }

    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (address[] memory holders_)
    {
        return _getCouponHolders(_couponID, _pageIndex, _pageLength);
    }

    function getTotalCouponHolders(
        uint256 _couponID
    ) external view onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1) returns (uint256) {
        return _getTotalCouponHolders(_couponID);
    }

    function getCouponFromOrderedListAt(uint256 _pos) external view returns (uint256 couponID_) {
        return _getCouponFromOrderedListAt(_pos);
    }

    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory couponIDs_) {
        return _getCouponsOrderedList(_pageIndex, _pageLength);
    }

    function getCouponsOrderedListTotal() external view returns (uint256 total_) {
        return _getCouponsOrderedListTotalAdjustedAt(_blockTimestamp());
    }
}
