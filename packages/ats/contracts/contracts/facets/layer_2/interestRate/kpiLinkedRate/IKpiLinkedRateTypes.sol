// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IKpiLinkedRateErrors
 * @notice Interface for KPI Linked Rate shared structs and error definitions
 * @dev Separated from IKpiLinkedRate to expose errors through IAsset
 *      without including IKpiLinkedRate's function selectors
 * @author Hashgraph
 */
interface IKpiLinkedRateTypes {
    /**
     * @notice Interest rate structure for KPI-linked rate calculations
     * @param maxRate Maximum allowed interest rate
     * @param baseRate Base interest rate applied under normal conditions
     * @param minRate Minimum allowable interest rate
     * @param startPeriod Time period after which rate adjustments begin
     * @param startRate Initial rate at the beginning of the adjustment process
     * @param missedPenalty Penalty applied for missed performance targets
     * @param reportPeriod Frequency of performance reporting intervals
     * @param rateDecimals Decimal precision used for rate values
     */
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

    /**
     * @notice Impact data structure for KPI-linked rate adjustments
     * @param maxDeviationCap Upper limit on deviation percentage that can affect rates
     * @param baseLine Reference point for measuring performance deviations
     * @param maxDeviationFloor Lower bound on deviation thresholds
     * @param impactDataDecimals Decimal precision for impact metrics
     * @param adjustmentPrecision Granularity of rate adjustment steps
     */
    struct ImpactData {
        uint256 maxDeviationCap;
        uint256 baseLine;
        uint256 maxDeviationFloor;
        uint8 impactDataDecimals;
        uint256 adjustmentPrecision;
    }

    /**
     * @notice Raised when KPI-linked rate interest rate values are invalid
     * @dev Validates that all components of an InterestRate struct meet specified constraints
     * @param interestRate The invalid interest rate values
     */
    error WrongInterestRateValues(InterestRate interestRate);

    /**
     * @notice Raised when KPI-linked rate impact data values are invalid
     * @dev Ensures ImpactData parameters conform to expected ranges and relationships
     * @param impactData The invalid impact data values
     */
    error WrongImpactDataValues(ImpactData impactData);
}
