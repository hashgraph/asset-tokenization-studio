// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { InterestRateStorageWrapper } from "../../domain/asset/InterestRateStorageWrapper.sol";
import { _checkNotInitialized } from "../InitializationErrors.sol";
import { IKpiLinkedRate } from "../../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol";
import { IInterestRate } from "../../facets/interestRate/IInterestRate.sol";

/**
 * @title InterestRateModifiers
 * @author Asset Tokenization Studio Team
 * @notice Modifier contract for the InterestRate domain — FixedRate and KpiLinkedRate.
 * @dev Provides modifiers that enforce initialisation state invariants by delegating to
 *      _check* functions from InterestRateStorageWrapper rather than implementing
 *      validation inline.
 */
abstract contract InterestRateModifiers {
    /**
     * @notice Modifier that ensures fixed rate has not been initialized.
     * @dev Reverts with AlreadyInitialized if fixed rate is already initialized.
     */
    modifier onlyNotFixedRateInitialized() {
        _checkNotInitialized(InterestRateStorageWrapper.isFixedRateInitialized());
        _;
    }

    /**
     * @notice Modifier that ensures KPI linked rate has not been initialized.
     * @dev Reverts with AlreadyInitialized if KPI linked rate is already initialized.
     */
    modifier onlyNotKpiLinkedRateInitialized() {
        _checkNotInitialized(InterestRateStorageWrapper.isKpiLinkedRateInitialized());
        _;
    }

    /**
     * @notice Modifier that ensures the coupon rate type has not been initialized.
     * @dev Reverts with AlreadyInitialized if the coupon rate type is already initialized.
     */
    modifier onlyNotInterestRateTypeInitialized() {
        _checkNotInitialized(InterestRateStorageWrapper.isInterestRateTypeInitialized());
        _;
    }

    /**
     * @notice Modifier that validates the KPI-linked interest rate ordering invariant.
     * @dev Reverts with WrongInterestRateValues if minRate > baseRate or baseRate > maxRate.
     * @param _newInterestRate The interest rate struct to validate.
     */
    modifier onlyValidInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) {
        InterestRateStorageWrapper.requireValidInterestRate(_newInterestRate);
        _;
    }

    /**
     * @notice Modifier that validates the KPI-linked impact data ordering invariant.
     * @dev Reverts with WrongImpactDataValues if the deviation bounds are not strictly ordered.
     * @param _newImpactData The impact data struct to validate.
     */
    modifier onlyValidImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) {
        InterestRateStorageWrapper.requireValidImpactData(_newImpactData);
        _;
    }

    /**
     * @notice Modifier that reverts when `NONE` is supplied as the rate type.
     * @dev `NONE` is the zero-value default reserved for uninitialised assets.
     * @param rateType The rate type to validate.
     */
    modifier onlyValidRateType(IInterestRate.RateType rateType) {
        InterestRateStorageWrapper.checkValidRateType(rateType);
        _;
    }
}
