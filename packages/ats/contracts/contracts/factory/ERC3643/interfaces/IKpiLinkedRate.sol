// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/kpiLinkedRate/IKpiLinkedRate.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

/// @custom:hash resolverKey KpiLinkedRate
bytes32 constant RESOLVER_KEY_KPI_LINKED_RATE = 0x47cd76ae576f0ec85f1abfc652d614750caefe22a465bef2c859f6cb32a89593;

interface TRexIKpiLinkedRate {
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

    /// @notice Emitted once when the KpiLinkedRate capability is initialised on a token.
    /// @dev Fires exclusively from `initializeKpiLinkedRate` after the storage write succeeds.
    event KpiLinkedRateInitialized(InterestRate interestRate, ImpactData impactData);

    event InterestRateUpdated(address indexed operator, InterestRate newInterestRate);
    event ImpactDataUpdated(address indexed operator, ImpactData newImpactData);

    /// @notice Raised when KPI-linked rate interest rate values are invalid
    /// @param interestRate The invalid interest rate values
    error WrongInterestRateValues(InterestRate interestRate);

    /// @notice Raised when KPI-linked rate impact data values are invalid
    /// @param impactData The invalid impact data values
    error WrongImpactDataValues(ImpactData impactData);

    function initializeKpiLinkedRate(InterestRate calldata _interestRate, ImpactData calldata _impactData) external;

    function setKpiLinkedRateInterestRate(InterestRate calldata _newInterestRate) external;
    function setKpiLinkedRateImpactData(ImpactData calldata _newImpactData) external;

    function getKpiLinkedRateInterestRate() external view returns (InterestRate memory interestRate_);
    function getKpiLinkedRateImpactData() external view returns (ImpactData memory impactData_);
}
