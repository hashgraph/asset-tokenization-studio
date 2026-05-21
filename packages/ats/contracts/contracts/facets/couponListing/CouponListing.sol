// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICouponListing } from "./ICouponListing.sol";
import { ScheduledTask } from "../layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { CouponStorageWrapper } from "../../domain/asset/coupon/CouponStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _COUPON_LISTING_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CouponListing
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `ICouponListing`, providing read-only queries for the
 *         ordered coupon list and the scheduled coupon listing.
 * @dev Reads from `CouponStorageWrapper`, `ScheduledTasksStorageWrapper`, and
 *      `TimeTravelStorageWrapper`. Intended to be inherited by `CouponListingFacet`.
 */
abstract contract CouponListing is ICouponListing, Modifiers {
    /// @inheritdoc ICouponListing
    function initializeCouponListing()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_COUPON_LISTING_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_COUPON_LISTING_RESOLVER_KEY);
        emit CouponListingInitialized();
    }

    /// @inheritdoc ICouponListing
    function getCouponFromOrderedListAt(uint256 _pos) external view override returns (uint256 couponID_) {
        couponID_ = CouponStorageWrapper.getCouponFromOrderedListAt(_pos);
    }

    /// @inheritdoc ICouponListing
    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory couponIDs_) {
        couponIDs_ = CouponStorageWrapper.getCouponsOrderedList(_pageIndex, _pageLength);
    }

    /// @inheritdoc ICouponListing
    function getCouponsOrderedListTotal() external view override returns (uint256 total_) {
        total_ = CouponStorageWrapper.getCouponsOrderedListTotalAdjustedAt(
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
    }

    /// @inheritdoc ICouponListing
    function scheduledCouponListingCount() external view override returns (uint256) {
        return ScheduledTasksStorageWrapper.getScheduledCouponListingCount();
    }

    /// @inheritdoc ICouponListing
    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledCouponListing_) {
        scheduledCouponListing_ = ScheduledTasksStorageWrapper.getScheduledCouponListing(_pageIndex, _pageLength);
    }
}
