// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "./IBondRead.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { CorporateActionsStorageWrapper } from "../../../domain/core/CorporateActionsStorageWrapper.sol";
import { BondStorageWrapper } from "../../../domain/asset/BondStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract BondRead is IBondRead, TimestampProvider {
    function getBondDetails() external view override returns (BondDetailsData memory bondDetailsData_) {
        return BondStorageWrapper._getBondDetails();
    }

    function getCoupon(uint256 _couponID) external view override returns (RegisteredCoupon memory registeredCoupon_) {
        CorporateActionsStorageWrapper._requireMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return BondStorageWrapper._getCoupon(_couponID);
    }

    function getCouponFor(
        uint256 _couponID,
        address _account
    ) external view override returns (CouponFor memory couponFor_) {
        CorporateActionsStorageWrapper._requireMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return BondStorageWrapper._getCouponFor(_couponID, _account);
    }

    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) external view override returns (CouponAmountFor memory couponAmountFor_) {
        CorporateActionsStorageWrapper._requireMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return BondStorageWrapper._getCouponAmountFor(_couponID, _account);
    }

    function getPrincipalFor(address _account) external view override returns (PrincipalFor memory principalFor_) {
        return BondStorageWrapper._getPrincipalFor(_account);
    }

    function getCouponCount() external view override returns (uint256 couponCount_) {
        return BondStorageWrapper._getCouponCount();
    }

    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return BondStorageWrapper._getCouponHolders(_couponID, _pageIndex, _pageLength);
    }

    function getTotalCouponHolders(uint256 _couponID) external view returns (uint256) {
        return BondStorageWrapper._getTotalCouponHolders(_couponID);
    }

    function getCouponFromOrderedListAt(uint256 _pos) external view returns (uint256 couponID_) {
        return BondStorageWrapper._getCouponFromOrderedListAt(_pos);
    }

    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory couponIDs_) {
        return BondStorageWrapper._getCouponsOrderedList(_pageIndex, _pageLength);
    }

    function getCouponsOrderedListTotal() external view returns (uint256 total_) {
        return BondStorageWrapper._getCouponsOrderedListTotalAdjustedAt(_getBlockTimestamp());
    }
}
