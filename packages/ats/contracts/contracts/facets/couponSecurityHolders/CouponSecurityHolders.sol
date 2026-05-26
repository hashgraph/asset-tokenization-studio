// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICouponSecurityHolders } from "./ICouponSecurityHolders.sol";
import { ICouponTypes } from "../coupon/ICouponTypes.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../constants/values.sol";
import { CouponStorageWrapper } from "../../domain/asset/coupon/CouponStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _COUPON_SECURITY_HOLDERS_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CouponSecurityHolders
 * @notice Abstract implementation of `ICouponSecurityHolders`.
 * @dev All functions are guarded by `onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, …)`
 *      and delegate storage reads to `CouponStorageWrapper`.
 * @author Asset Tokenization Studio Team
 */
abstract contract CouponSecurityHolders is ICouponSecurityHolders, Modifiers {
    /// @inheritdoc ICouponSecurityHolders
    function initializeCouponSecurityHolders()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_COUPON_SECURITY_HOLDERS_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_COUPON_SECURITY_HOLDERS_RESOLVER_KEY);
        emit CouponSecurityHoldersInitialized();
    }

    /// @inheritdoc ICouponSecurityHolders
    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        onlyOperational
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (address[] memory holders_)
    {
        holders_ = CouponStorageWrapper.getCouponHolders(_couponID, _pageIndex, _pageLength);
    }

    /// @inheritdoc ICouponSecurityHolders
    function getCouponsFor(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        onlyOperational
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (ICouponTypes.CouponFor[] memory couponFor_, address[] memory holders_)
    {
        holders_ = CouponStorageWrapper.getCouponHolders(_couponID, _pageIndex, _pageLength);
        uint256 length = holders_.length;
        couponFor_ = new ICouponTypes.CouponFor[](length);
        for (uint256 i; i < length; ) {
            couponFor_[i] = CouponStorageWrapper.getCouponFor(_couponID, holders_[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc ICouponSecurityHolders
    function getTotalCouponHolders(
        uint256 _couponID
    ) external view override onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1) returns (uint256) {
        return CouponStorageWrapper.getTotalCouponHolders(_couponID);
    }
}
