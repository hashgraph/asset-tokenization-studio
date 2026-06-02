// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRateErrors } from "./IKpiLinkedRateErrors.sol";

/// @custom:hash resolverKey KpiLinkedRate
bytes32 constant RESOLVER_KEY_KPI_LINKED_RATE = 0x47cd76ae576f0ec85f1abfc652d614750caefe22a465bef2c859f6cb32a89593;

interface IKpiLinkedRate is IKpiLinkedRateErrors {
    /// @notice Emitted once when the KpiLinkedRate capability is initialised on a token.
    /// @dev Fires exclusively from `initializeKpiLinkedRate` after the storage write succeeds.
    event KpiLinkedRateInitialized(InterestRate interestRate, ImpactData impactData);

    event InterestRateUpdated(address indexed operator, InterestRate newInterestRate);
    event ImpactDataUpdated(address indexed operator, ImpactData newImpactData);

    function initializeKpiLinkedRate(InterestRate calldata _interestRate, ImpactData calldata _impactData) external;

    function setKpiLinkedRateInterestRate(InterestRate calldata _newInterestRate) external;
    function setKpiLinkedRateImpactData(ImpactData calldata _newImpactData) external;

    function getKpiLinkedRateInterestRate() external view returns (InterestRate memory interestRate_);
    function getKpiLinkedRateImpactData() external view returns (ImpactData memory impactData_);
}
