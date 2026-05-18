// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IInterestRate } from "./IInterestRate.sol";
import { InterestRateStorageWrapper } from "../../domain/asset/InterestRateStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { INTEREST_RATE_MANAGER_ROLE } from "../../constants/roles.sol";

/**
 * @title InterestRate
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing the admin-controlled coupon rate type selector.
 * @dev Implements `IInterestRate`. State is stored via `InterestRateStorageWrapper` at
 *      `_INTEREST_RATE_TYPE_STORAGE_POSITION`. Intended to be inherited exclusively by
 *      `InterestRateFacet`.
 */
abstract contract InterestRate is IInterestRate, Modifiers {
    /// @inheritdoc IInterestRate
    /// @dev No role required. Protected by `onlyValidRateType`.
    function initializeInterestRateType(IInterestRate.RateType rateType) external onlyValidRateType(rateType) {
        InterestRateStorageWrapper.setCouponRateType(rateType);
        emit CouponRateTypeSet(msg.sender, rateType);
    }

    /// @inheritdoc IInterestRate
    /// @dev Protected by `onlyRole(INTEREST_RATE_MANAGER_ROLE)` and `onlyValidRateType`.
    function setCouponRateType(
        IInterestRate.RateType rateType
    ) external onlyActivated onlyRole(INTEREST_RATE_MANAGER_ROLE) onlyValidRateType(rateType) {
        // TODO: check if changing the rate type is allowed after existing coupons have been issued
        InterestRateStorageWrapper.setCouponRateType(rateType);
        emit CouponRateTypeSet(msg.sender, rateType);
    }

    /// @inheritdoc IInterestRate
    function getCouponRateType() external view returns (IInterestRate.RateType) {
        return InterestRateStorageWrapper.getCouponRateType();
    }
}
