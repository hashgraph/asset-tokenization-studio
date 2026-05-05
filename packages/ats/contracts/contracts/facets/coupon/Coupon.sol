// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoupon } from "./ICoupon.sol";
import { ICouponTypes } from "./ICouponTypes.sol";
import { CORPORATE_ACTION_ROLE } from "../../constants/roles.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../constants/values.sol";
import { CouponStorageWrapper } from "../../domain/asset/coupon/CouponStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";

/**
 * @title Coupon
 * @author Asset Tokenization Studio Team
 * @notice Abstract base providing the writer-side coupon lifecycle exposed by `CouponFacet`
 *         and its rate variants (`CouponFixedRateFacet`, `CouponKpiLinkedRateFacet`,
 *         `CouponSustainabilityPerformanceTargetRateFacet`) plus the record/per-account read
 *         helpers consumers need before executing a coupon.
 * @dev Thin forwarder over `CouponStorageWrapper`; holds no storage of its own. All write
 *      paths are restricted to `CORPORATE_ACTION_ROLE` and gated by the unpaused state. Read
 *      paths are guarded by `onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE,
 *      _couponID - 1)` so an attacker cannot use a non-coupon corporate-action id to read
 *      coupon slots. Exposes the virtual `_prepareCoupon` hook so rate variants can validate
 *      and resolve the rate before persistence.
 */
abstract contract Coupon is ICoupon, Modifiers {
    /// @inheritdoc ICoupon
    /// @dev Restricted to `CORPORATE_ACTION_ROLE`; gated by `onlyUnpaused`,
    ///      `onlyValidDates(...)` (three pairs of date validations), and `onlyValidTimestamp`
    ///      on `recordDate` and `fixingDate`. Routes the coupon through the virtual
    ///      `_prepareCoupon` hook before persistence so rate variants can apply variant-
    ///      specific validation and rate resolution.
    function setCoupon(
        ICouponTypes.Coupon calldata _newCoupon
    )
        external
        override
        onlyUnpaused
        onlyRole(CORPORATE_ACTION_ROLE)
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

    /// @inheritdoc ICoupon
    /// @dev Restricted to `CORPORATE_ACTION_ROLE`; gated by `onlyUnpaused` and
    ///      `onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)`.
    function cancelCoupon(
        uint256 _couponID
    )
        external
        override
        onlyUnpaused
        onlyRole(CORPORATE_ACTION_ROLE)
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (bool success_)
    {
        success_ = CouponStorageWrapper.cancelCoupon(_couponID);
    }

    /// @inheritdoc ICoupon
    /// @dev Reverts via `onlyMatchingActionType` if `_couponID` does not match the coupon
    ///      corporate-action type at index `_couponID - 1`.
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

    /// @inheritdoc ICoupon
    /// @dev Reverts via `onlyMatchingActionType` if `_couponID` does not match the coupon
    ///      corporate-action type at index `_couponID - 1`.
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

    /// @inheritdoc ICoupon
    /// @dev Reverts via `onlyMatchingActionType` if `_couponID` does not match the coupon
    ///      corporate-action type at index `_couponID - 1`.
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

    /// @inheritdoc ICoupon
    function getCouponCount() external view override returns (uint256 couponCount_) {
        couponCount_ = CouponStorageWrapper.getCouponCount();
    }

    /**
     * @notice Variant hook that validates and resolves the coupon rate before persistence.
     * @dev Default implementation is a pass-through used by the standard `CouponFacet`. Rate
     *      variants override this hook to enforce variant-specific constraints (e.g. fixed
     *      rate must read the rate from `InterestRateStorageWrapper`; KPI-linked / SPT
     *      variants reject non-pending rate inputs since the rate is computed dynamically).
     * @param _newCoupon The user-supplied coupon parameters.
     * @return coupon_ The validated and possibly rate-resolved coupon to persist.
     */
    function _prepareCoupon(
        ICouponTypes.Coupon calldata _newCoupon
    ) internal view virtual returns (ICouponTypes.Coupon memory coupon_) {
        coupon_ = _newCoupon;
    }
}
