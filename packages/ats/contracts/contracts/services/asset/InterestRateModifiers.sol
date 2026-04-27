// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title InterestRateModifiers
 * @notice Modifier contract for InterestRate domain - FixedRate, KpiLinkedRate, and SustainabilityPerformanceTargetRate
 * @dev Provides modifiers that enforce initialization state invariants by calling
 *      _check* functions from InterestRateStorageWrapper. This follows the pattern
 *      where modifiers delegate to storage wrapper check functions rather than
 *      implementing validation inline.
 *
 * @author Asset Tokenization Studio Team
 */
import { InterestRateStorageWrapper } from "../../domain/asset/InterestRateStorageWrapper.sol";
import { _checkNotInitialized } from "../InitializationErrors.sol";
import { IKpiLinkedRate } from "../../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol";

abstract contract InterestRateModifiers {
    /// @notice Modifier that ensures fixed rate has not been initialized
    /// @dev Calls _checkNotFixedRateInitialized from InterestRateStorageWrapper
    modifier onlyNotFixedRateInitialized() {
        _checkNotInitialized(InterestRateStorageWrapper.isFixedRateInitialized());
        _;
    }

    /// @notice Modifier that ensures KPI linked rate has not been initialized
    /// @dev Calls _checkNotKpiLinkedRateInitialized from InterestRateStorageWrapper
    modifier onlyNotKpiLinkedRateInitialized() {
        _checkNotInitialized(InterestRateStorageWrapper.isKpiLinkedRateInitialized());
        _;
    }

    /// @notice Modifier that ensures sustainability performance target rate has not been initialized
    /// @dev Calls _checkNotSustainabilityPerformanceTargetRateInitialized from InterestRateStorageWrapper
    modifier onlyNotSustainabilityPerformanceTargetRateInitialized() {
        _checkNotInitialized(InterestRateStorageWrapper.isSustainabilityPerformanceTargetRateInitialized());
        _;
    }

    modifier onlyValidInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) {
        InterestRateStorageWrapper.requireValidInterestRate(_newInterestRate);
        _;
    }

    modifier onlyValidImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) {
        InterestRateStorageWrapper.requireValidImpactData(_newImpactData);
        _;
    }

    /**
     * @dev Modifier that validates that two array lengths are equal
     *
     * Requirements:
     * - Both lengths must be identical
     *
     * @param _length1 Length of the first array
     * @param _length2 Length of the second array
     */
    modifier onlyValidEqualLength(uint256 _length1, uint256 _length2) {
        InterestRateStorageWrapper.requireEqualLength(_length1, _length2);
        _;
    }
}
