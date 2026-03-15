// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "./IBondRead.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { CorporateActionsStorageWrapper } from "../../../domain/core/CorporateActionsStorageWrapper.sol";
import { BondStorageWrapper } from "../../../domain/asset/BondStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract BondRead is IBondRead, TimestampProvider {
    function getBondDetails() external view override returns (BondDetailsData memory bondDetailsData_) {
        return BondStorageWrapper.getBondDetails();
    }

    function getCoupon(uint256 _couponID) external view override returns (RegisteredCoupon memory registeredCoupon_) {
        CorporateActionsStorageWrapper.requireMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return BondStorageWrapper.getCoupon(_couponID);
    }

    function getCouponFor(
        uint256 _couponID,
        address _account
    ) external view override returns (CouponFor memory couponFor_) {
        CorporateActionsStorageWrapper.requireMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return BondStorageWrapper.getCouponFor(_couponID, _account);
    }

    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) external view override returns (CouponAmountFor memory couponAmountFor_) {
        CorporateActionsStorageWrapper.requireMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return BondStorageWrapper.getCouponAmountFor(_couponID, _account);
    }

    function getPrincipalFor(address _account) external view override returns (PrincipalFor memory principalFor_) {
        return BondStorageWrapper.getPrincipalFor(_account);
    }

    function getCouponCount() external view override returns (uint256 couponCount_) {
        return BondStorageWrapper.getCouponCount();
    }

    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return BondStorageWrapper.getCouponHolders(_couponID, _pageIndex, _pageLength);
    }

    function getTotalCouponHolders(uint256 _couponID) external view returns (uint256) {
        return BondStorageWrapper.getTotalCouponHolders(_couponID);
    }

    function getCouponFromOrderedListAt(uint256 _pos) external view returns (uint256 couponID_) {
        return BondStorageWrapper.getCouponFromOrderedListAt(_pos);
    }

    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory couponIDs_) {
        return BondStorageWrapper.getCouponsOrderedList(_pageIndex, _pageLength);
    }

    function getCouponsOrderedListTotal() external view returns (uint256 total_) {
        return BondStorageWrapper.getCouponsOrderedListTotalAdjustedAt(_getBlockTimestamp());
    }
}
