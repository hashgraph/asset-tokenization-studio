// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoupon } from "./ICoupon.sol";
import { ICouponTypes } from "./ICouponTypes.sol";
import { CORPORATE_ACTION_ROLE } from "../../constants/roles.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../constants/values.sol";
import { CouponStorageWrapper } from "../../domain/asset/coupon/CouponStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { Modifiers } from "../../services/Modifiers.sol";

/**
 * @title Coupon
 * @author Asset Tokenization Studio Team
 * @notice Abstract base of the unified coupon writer surface exposed by `CouponFacet` for
 *         every bond rate variant (standard, fixed-rate, KPI-linked, SPT). Provides the
 *         shared coupon lifecycle (`setCoupon`, `cancelCoupon`) plus the per-record reads
 *         consumers need before executing a coupon.
 * @dev Thin forwarder over `CouponStorageWrapper`; holds no storage of its own. Write
 *      paths are restricted to `CORPORATE_ACTION_ROLE` and gated by the unpaused state.
 *      Read paths are guarded by `onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE,
 *      _couponID - 1)`. The rate-variant invariants and rate resolution live in
 *      `CouponStorageWrapper.setCoupon` (write-path mirror of `getCoupon`'s read-path
 *      dispatch via `InterestRateStorageWrapper.is<Variant>Initialized()`). Emits
 *      `ICoupon.CouponSet` / `ICoupon.CouponCancelled` inline after the underlying
 *      storage call returns, per the writer-abstract emit-site rule.
 */
abstract contract Coupon is ICoupon, Modifiers {
    /// @inheritdoc ICoupon
    /// @dev Restricted to `CORPORATE_ACTION_ROLE`; gated by `onlyUnpaused`,
    ///      `onlyValidDates(...)` (three pairs of date validations), and
    ///      `onlyValidTimestamp` on `recordDate` and `fixingDate`. Variant-specific
    ///      rate invariants and rate stamping are applied inside
    ///      `CouponStorageWrapper.setCoupon`; the wrapper returns the post-resolution
    ///      coupon so the emitted event reflects the persisted state.
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
        bytes32 corporateActionId;
        ICouponTypes.Coupon memory resolved;
        (corporateActionId, couponID_, resolved) = CouponStorageWrapper.setCoupon(_newCoupon);
        emit ICoupon.CouponSet(corporateActionId, couponID_, EvmAccessors.getMsgSender(), resolved);
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
        emit ICoupon.CouponCancelled(_couponID, EvmAccessors.getMsgSender());
    }

    /// @inheritdoc ICoupon
    /// @dev Reverts via `onlyMatchingActionType` if `_couponID` does not match the
    ///      coupon corporate-action type at index `_couponID - 1`.
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
    /// @dev Reverts via `onlyMatchingActionType` if `_couponID` does not match the
    ///      coupon corporate-action type at index `_couponID - 1`.
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
    /// @dev Reverts via `onlyMatchingActionType` if `_couponID` does not match the
    ///      coupon corporate-action type at index `_couponID - 1`.
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
}
