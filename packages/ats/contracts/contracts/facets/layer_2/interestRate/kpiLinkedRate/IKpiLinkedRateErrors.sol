// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IKpiLinkedRateErrors
 * @notice Interface for KPI Linked Rate shared structs and error definitions
 * @dev Separated from IKpiLinkedRate to expose errors through IAsset
 *      without including IKpiLinkedRate's function selectors
 */
interface IKpiLinkedRateErrors {
    /// @notice Interest rate structure for KPI-linked rate calculations
    struct InterestRate {
        uint256 maxRate;
        uint256 baseRate;
        uint256 minRate;
        uint256 startPeriod;
        uint256 startRate;
        uint256 missedPenalty;
        uint256 reportPeriod;
        uint8 rateDecimals;
    }

    /// @notice Impact data structure for KPI-linked rate adjustments
    struct ImpactData {
        uint256 maxDeviationCap;
        uint256 baseLine;
        uint256 maxDeviationFloor;
        uint8 impactDataDecimals;
        uint256 adjustmentPrecision;
    }

    /// @notice Raised when KPI-linked rate interest rate values are invalid
    /// @param interestRate The invalid interest rate values
    error WrongInterestRateValues(InterestRate interestRate);

    /// @notice Raised when KPI-linked rate impact data values are invalid
    /// @param impactData The invalid impact data values
    error WrongImpactDataValues(ImpactData impactData);
}
