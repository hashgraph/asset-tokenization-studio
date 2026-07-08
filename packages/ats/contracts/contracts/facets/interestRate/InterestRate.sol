// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IInterestRate, RESOLVER_KEY_INTEREST_RATE } from "./IInterestRate.sol";
import { InterestRateStorageWrapper } from "../../domain/asset/InterestRateStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ROLE_INTEREST_RATE_MANAGER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title InterestRate
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing the admin-controlled coupon rate type selector.
 * @dev Implements `IInterestRate`. State is stored via `InterestRateStorageWrapper` at
 *      `STORAGE_LOCATION_INTEREST_RATE_TYPE`. Intended to be inherited exclusively by
 *      `InterestRateFacet`.
 */
abstract contract InterestRate is IInterestRate, Modifiers {
    /// @inheritdoc IInterestRate
    function initializeInterestRateType(
        IInterestRate.RateType rateType
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_INTEREST_RATE) {
        InterestRateStorageWrapper.initializeCouponRateType(rateType);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_INTEREST_RATE);
        emit IInterestRate.InterestRateTypeInitialized(rateType);
    }

    /// @inheritdoc IInterestRate
    /// @dev Protected by `onlyRole(ROLE_INTEREST_RATE_MANAGER)`.
    function setCouponRateType(
        IInterestRate.RateType rateType
    ) external override onlyOperational onlyActivated onlyRole(ROLE_INTEREST_RATE_MANAGER) {
        // TODO: check if changing the rate type is allowed after existing coupons have been issued
        InterestRateStorageWrapper.setCouponRateType(rateType);
        emit CouponRateTypeSet(EvmAccessors.getMsgSender(), rateType);
    }

    /// @inheritdoc IInterestRate
    function getCouponRateType() external view returns (IInterestRate.RateType) {
        return InterestRateStorageWrapper.getCouponRateType();
    }
}
