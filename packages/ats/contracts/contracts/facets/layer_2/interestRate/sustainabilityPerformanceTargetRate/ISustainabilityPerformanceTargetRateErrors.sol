// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ISustainabilityPerformanceTargetRateErrors
 * @notice Interface for Sustainability Performance Target Rate shared structs and error definitions
 * @dev Separated from ISustainabilityPerformanceTargetRate to expose errors through IAsset
 *      without including ISustainabilityPerformanceTargetRate's function selectors
 */
interface ISustainabilityPerformanceTargetRateErrors {
    enum BaseLineMode {
        MINIMUM,
        MAXIMUM
    }

    enum ImpactDataMode {
        PENALTY,
        BONUS
    }

    /// @notice Interest rate structure for sustainability performance target rate calculations
    struct InterestRate {
        uint256 baseRate;
        uint256 startPeriod;
        uint256 startRate;
        uint8 rateDecimals;
    }

    /// @notice Impact data structure for sustainability performance target rate adjustments
    struct ImpactData {
        uint256 baseLine;
        BaseLineMode baseLineMode;
        uint256 deltaRate;
        ImpactDataMode impactDataMode;
    }

    /// @notice Raised when the project does not exist
    /// @param project The address of the non-existent project
    error NotExistingProject(address project);

    /// @notice Raised when impact data and projects arrays have different lengths
    /// @param impactDataLength Length of the impact data array
    /// @param projectsLength Length of the projects array
    error ProvidedListsLengthMismatch(uint256 impactDataLength, uint256 projectsLength);

    /// @notice Raised when the interest rate type is sustainability performance target rate
    error InterestRateIsSustainabilityPerformanceTargetRate();
}
