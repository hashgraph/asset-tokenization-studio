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

abstract contract InterestRateModifiers {
    /// @notice Modifier that ensures fixed rate has not been initialized
    /// @dev Calls _checkNotFixedRateInitialized from InterestRateStorageWrapper
    modifier onlyNotFixedRateInitialized() {
        InterestRateStorageWrapper._checkNotFixedRateInitialized();
        _;
    }

    /// @notice Modifier that ensures KPI linked rate has not been initialized
    /// @dev Calls _checkNotKpiLinkedRateInitialized from InterestRateStorageWrapper
    modifier onlyNotKpiLinkedRateInitialized() {
        InterestRateStorageWrapper._checkNotKpiLinkedRateInitialized();
        _;
    }

    /// @notice Modifier that ensures sustainability performance target rate has not been initialized
    /// @dev Calls _checkNotSustainabilityPerformanceTargetRateInitialized from InterestRateStorageWrapper
    modifier onlyNotSustainabilityPerformanceTargetRateInitialized() {
        InterestRateStorageWrapper._checkNotSustainabilityPerformanceTargetRateInitialized();
        _;
    }
}
