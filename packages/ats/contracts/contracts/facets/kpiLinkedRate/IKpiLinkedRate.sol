// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey KpiLinkedRate
bytes32 constant RESOLVER_KEY_KPI_LINKED_RATE = 0x47cd76ae576f0ec85f1abfc652d614750caefe22a465bef2c859f6cb32a89593;

interface IKpiLinkedRate {
    /**
     * @notice Interest rate parameters for the KPI-linked coupon model.
     * @dev Rate values must satisfy `minRate ≤ baseRate ≤ maxRate`. All rate fields share
     *      the same `rateDecimals` scale.
     * @param maxRate Upper bound for the computed KPI-linked rate.
     * @param baseRate Reference rate from which KPI-driven adjustments are applied.
     * @param minRate Lower bound for the computed KPI-linked rate.
     * @param startPeriod Unix timestamp marking the beginning of the rate calculation period.
     * @param startRate Initial rate in effect at `startPeriod`, before any KPI adjustment.
     * @param missedPenalty Penalty rate deducted when a scheduled KPI report is missed.
     * @param reportPeriod Duration in seconds between successive KPI reports.
     * @param rateDecimals Decimal precision shared by all rate fields in this struct.
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
     * @notice Impact data parameters that bound and scale KPI-driven rate adjustments.
     * @dev Values must satisfy the strict ordering `maxDeviationFloor < baseLine < maxDeviationCap`.
     *      Equality is rejected because it would produce a zero denominator in the rate adjustment
     *      formula, permanently freezing scheduled-task execution.
     *      All deviation fields share the same `impactDataDecimals` scale.
     * @param maxDeviationCap Upper deviation limit; the KPI result cannot push the rate above this cap.
     * @param baseLine Reference KPI value against which actual results are compared.
     * @param maxDeviationFloor Lower deviation limit; the KPI result cannot push the rate below this floor.
     * @param impactDataDecimals Decimal precision shared by `maxDeviationCap`, `baseLine`, and `maxDeviationFloor`.
     * @param adjustmentPrecision Scaling factor applied during the rate-adjustment computation to preserve precision.
     */
    struct ImpactData {
        uint256 maxDeviationCap;
        uint256 baseLine;
        uint256 maxDeviationFloor;
        uint8 impactDataDecimals;
        uint256 adjustmentPrecision;
    }

    /// @notice Emitted once when the KpiLinkedRate capability is initialised on a token.
    /// @dev Fires exclusively from `initializeKpiLinkedRate` after the storage write succeeds.
    event KpiLinkedRateInitialized(InterestRate interestRate, ImpactData impactData);

    /// @notice Emitted when the KPI-linked interest rate configuration is updated.
    /// @param operator Address that performed the update.
    /// @param newInterestRate The new interest rate parameters that have been applied.
    event InterestRateUpdated(address indexed operator, InterestRate newInterestRate);

    /// @notice Emitted when the KPI-linked impact data configuration is updated.
    /// @param operator Address that performed the update.
    /// @param newImpactData The new impact data parameters that have been applied.
    event ImpactDataUpdated(address indexed operator, ImpactData newImpactData);

    /// @notice Raised when KPI-linked rate interest rate values are invalid
    /// @param interestRate The invalid interest rate values
    error WrongInterestRateValues(InterestRate interestRate);

    /// @notice Raised when KPI-linked rate impact data values are invalid
    /// @param impactData The invalid impact data values
    error WrongImpactDataValues(ImpactData impactData);

    /// @notice Initialises the KPI-linked rate model with its interest rate and impact data parameters.
    /// @dev Can only be called once per token. Validates ordering invariants before writing to storage.
    /// @param _interestRate Initial interest rate configuration (`minRate ≤ baseRate ≤ maxRate`).
    /// @param _impactData Initial impact data configuration (`maxDeviationFloor < baseLine < maxDeviationCap`).
    function initializeKpiLinkedRate(InterestRate calldata _interestRate, ImpactData calldata _impactData) external;

    /// @notice Updates the KPI-linked interest rate configuration.
    /// @dev Validates ordering invariants before writing. Emits `InterestRateUpdated`.
    /// @param _newInterestRate New interest rate parameters to apply.
    function setKpiLinkedRateInterestRate(InterestRate calldata _newInterestRate) external;

    /// @notice Updates the KPI-linked impact data configuration.
    /// @dev Validates strict ordering invariants before writing. Emits `ImpactDataUpdated`.
    /// @param _newImpactData New impact data parameters to apply.
    function setKpiLinkedRateImpactData(ImpactData calldata _newImpactData) external;

    /// @notice Returns the current KPI-linked interest rate configuration.
    /// @return interestRate_ The stored `InterestRate` struct.
    function getKpiLinkedRateInterestRate() external view returns (InterestRate memory interestRate_);

    /// @notice Returns the current KPI-linked impact data configuration.
    /// @return impactData_ The stored `ImpactData` struct.
    function getKpiLinkedRateImpactData() external view returns (ImpactData memory impactData_);
}
