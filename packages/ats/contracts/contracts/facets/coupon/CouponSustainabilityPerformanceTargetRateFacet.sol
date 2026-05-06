// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoupon } from "./ICoupon.sol";
import { ICouponTypes } from "./ICouponTypes.sol";
import { CORPORATE_ACTION_ROLE } from "../../constants/roles.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../constants/values.sol";
import { _COUPON_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { CouponStorageWrapper } from "../../domain/asset/coupon/CouponStorageWrapper.sol";
// solhint-disable-next-line max-line-length
import {
    ISustainabilityPerformanceTargetRateTypes
} from "../layer_2/interestRate/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRateTypes.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";

/**
 * @title CouponSustainabilityPerformanceTargetRateFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet variant of the coupon writer for Sustainability-Performance-Target
 *         (SPT) bonds. The rate is left pending at scheduling time and resolved
 *         dynamically at execution against the SPT achievement state of the bond.
 *         Registered under `_COUPON_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY`.
 * @dev Library-composition facet (BBND-1710). Calls `CouponStorageWrapper` directly.
 *      Requires the user-supplied coupon to have `rateStatus = PENDING`, `rate = 0`, and
 *      `rateDecimals = 0`; reverts with
 *      `ISustainabilityPerformanceTargetRateTypes.InterestRateIsSustainabilityPerformanceTargetRate`
 *      otherwise.
 */
contract CouponSustainabilityPerformanceTargetRateFacet is ICoupon, Modifiers, IStaticFunctionSelectors {
    /// @inheritdoc ICoupon
    /// @dev Restricted to `CORPORATE_ACTION_ROLE`; gated by `onlyUnpaused`,
    ///      `onlyValidDates(...)` (three pairs of date validations), and
    ///      `onlyValidTimestamp` on `recordDate` and `fixingDate`. Validates that the
    ///      rate parameters are pending; rejects user-supplied rate values inline.
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
        if (
            _newCoupon.rateStatus != ICouponTypes.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert ISustainabilityPerformanceTargetRateTypes.InterestRateIsSustainabilityPerformanceTargetRate();
        }
        (, couponID_) = CouponStorageWrapper.setCoupon(_newCoupon);
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

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Selectors are written in reverse via `--selectorIndex` inside an `unchecked`
    ///      block; the resulting array reads in declaration order (`setCoupon`,
    ///      `cancelCoupon`, `getCoupon`, `getCouponFor`, `getCouponAmountFor`,
    ///      `getCouponCount`).
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 6;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getCouponCount.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getCouponAmountFor.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getCouponFor.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getCoupon.selector;
            staticFunctionSelectors_[--selectorIndex] = this.cancelCoupon.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setCoupon.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorsIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorsIndex);
        unchecked {
            staticInterfaceIds_[--selectorsIndex] = type(ICoupon).interfaceId;
        }
    }
}
