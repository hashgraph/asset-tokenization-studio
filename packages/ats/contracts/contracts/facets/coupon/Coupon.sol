// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoupon, RESOLVER_KEY_COUPON } from "./ICoupon.sol";
import { ICouponTypes } from "./ICouponTypes.sol";
import { ROLE_CORPORATE_ACTION, ROLE_CORPORATE_ACTION_FORCE_CANCEL, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { CORPORATE_ACTION_TYPE_COUPON } from "../../constants/dispatchTypes.sol";
import { CouponStorageWrapper } from "../../domain/asset/coupon/CouponStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Coupon
 * @author Asset Tokenization Studio Team
 * @notice Abstract base of the unified coupon writer surface exposed by `CouponFacet` for
 *         every bond rate variant (standard, fixed-rate, KPI-linked, SPT). Provides the
 *         shared coupon lifecycle (`setCoupon`, `cancelCoupon`) plus the per-record reads
 *         consumers need before executing a coupon.
 * @dev Thin forwarder over `CouponStorageWrapper`; holds no storage of its own. Write
 *      paths are restricted to `ROLE_CORPORATE_ACTION` and gated by the unpaused state.
 *      Read paths are guarded by `onlyMatchingActionType(CORPORATE_ACTION_TYPE_COUPON,
 *      _couponID - 1)`. The rate-variant invariants and rate resolution live in
 *      `CouponStorageWrapper.setCoupon` (write-path mirror of `getCoupon`'s read-path
 *      dispatch via `InterestRateStorageWrapper.is<Variant>Initialized()`). Emits
 *      `ICoupon.CouponSet` / `ICoupon.CouponCancelled` inline after the underlying
 *      storage call returns, per the writer-abstract emit-site rule.
 */
abstract contract Coupon is ICoupon, Modifiers {
    /// @inheritdoc ICoupon
    function initializeCoupon()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_COUPON)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_COUPON);
        emit CouponInitialized();
    }

    /// @inheritdoc ICoupon
    /// @dev Restricted to `ROLE_CORPORATE_ACTION`; gated by `onlyUnpaused`,
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
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CORPORATE_ACTION)
        onlyValidDates(_newCoupon.startDate, _newCoupon.endDate)
        onlyValidDates(_newCoupon.recordDate, _newCoupon.executionDate)
        onlyValidDates(_newCoupon.fixingDate, _newCoupon.executionDate)
        onlyValidTimestamp(_newCoupon.recordDate)
        onlyValidTimestamp(_newCoupon.fixingDate)
        onlyValidCouponEndDate(_newCoupon.endDate)
        returns (uint256 couponID_)
    {
        bytes32 corporateActionId;
        ICouponTypes.Coupon memory resolved;
        (corporateActionId, couponID_, resolved) = CouponStorageWrapper.setCoupon(_newCoupon);
        emit ICoupon.CouponSet(corporateActionId, couponID_, EvmAccessors.getMsgSender(), resolved);
    }

    /// @inheritdoc ICoupon
    /// @dev Restricted to `ROLE_CORPORATE_ACTION`; gated by `onlyUnpaused` and
    ///      `onlyMatchingActionType(CORPORATE_ACTION_TYPE_COUPON, _couponID - 1)`.
    function cancelCoupon(
        uint256 _couponID
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CORPORATE_ACTION)
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_COUPON, _couponID - 1)
        returns (bool success_)
    {
        success_ = CouponStorageWrapper.cancelCoupon(_couponID);
        emit ICoupon.CouponCancelled(_couponID, EvmAccessors.getMsgSender());
    }

    /// @inheritdoc ICoupon
    /// @dev Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL`; gated by `onlyUnpaused` and
    ///      `onlyMatchingActionType(CORPORATE_ACTION_TYPE_COUPON, _couponID - 1)`.
    function forceCancelCoupon(
        uint256 _couponID
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CORPORATE_ACTION_FORCE_CANCEL)
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_COUPON, _couponID - 1)
        returns (bool success_)
    {
        success_ = CouponStorageWrapper.forceCancelCoupon(_couponID);
        emit ICoupon.CouponForceCancelled(_couponID, EvmAccessors.getMsgSender());
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_COUPON, _couponID - 1)
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_COUPON, _couponID - 1)
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_COUPON, _couponID - 1)
        returns (ICouponTypes.CouponAmountFor memory couponAmountFor_)
    {
        couponAmountFor_ = CouponStorageWrapper.getCouponAmountFor(_couponID, _account);
    }

    /// @inheritdoc ICoupon
    function getCouponCount() external view override returns (uint256 couponCount_) {
        couponCount_ = CouponStorageWrapper.getCouponCount();
    }
}
