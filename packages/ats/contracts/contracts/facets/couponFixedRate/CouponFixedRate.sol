// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoupon } from "../coupon/ICoupon.sol";
import { ICouponTypes } from "../coupon/ICouponTypes.sol";
import { IFixedRate } from "../layer_2/interestRate/fixedRate/IFixedRate.sol";
import { CORPORATE_ACTION_ROLE } from "../../constants/roles.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../constants/values.sol";
import { CouponStorageWrapper } from "../../domain/asset/coupon/CouponStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { InterestRateStorageWrapper } from "../../domain/asset/InterestRateStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";

/**
 * @title CouponFixedRate
 * @author Asset Tokenization Studio Team
 * @notice Abstract base of the fixed-rate coupon writer surface exposed by
 *         `CouponFixedRateFacet`. Resolves the rate from the configured fixed-rate
 *         setting of the bond at scheduling time before persistence.
 * @dev Thin forwarder over `CouponStorageWrapper`; holds no storage of its own. Rejects
 *      user-supplied rate parameters (must be `PENDING` / `0` / `0`), reads the
 *      configured rate via `InterestRateStorageWrapper.getRate()`, and stamps
 *      `rateStatus = SET` before persistence. Reverts with
 *      `IFixedRate.InterestRateIsFixed` if the caller specifies rate parameters
 *      manually. Emits `ICoupon.CouponSet` / `ICoupon.CouponCancelled` inline after the
 *      underlying storage call returns.
 */
abstract contract CouponFixedRate is ICoupon, Modifiers {
    /// @inheritdoc ICoupon
    /// @dev Restricted to `CORPORATE_ACTION_ROLE`; gated by `onlyUnpaused`,
    ///      `onlyValidDates(...)` (three pairs of date validations), and
    ///      `onlyValidTimestamp` on `recordDate` and `fixingDate`. Resolves the rate
    ///      inline from `InterestRateStorageWrapper.getRate()` and stamps it onto the
    ///      coupon before persistence.
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
            revert IFixedRate.InterestRateIsFixed();
        }
        ICouponTypes.Coupon memory prepared = _newCoupon;
        (prepared.rate, prepared.rateDecimals) = InterestRateStorageWrapper.getRate();
        prepared.rateStatus = ICouponTypes.RateCalculationStatus.SET;
        bytes32 corporateActionId;
        (corporateActionId, couponID_) = CouponStorageWrapper.setCoupon(prepared);
        emit ICoupon.CouponSet(corporateActionId, couponID_, EvmAccessors.getMsgSender(), prepared);
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
