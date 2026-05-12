// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISustainabilityPerformanceTargetRateTypes } from "./ISustainabilityPerformanceTargetRateTypes.sol";

interface ISustainabilityPerformanceTargetRate is ISustainabilityPerformanceTargetRateTypes {
    // Structs, enums and errors are inherited from ISustainabilityPerformanceTargetRateErrors

    event InterestRateUpdated(
        address indexed operator,
        ISustainabilityPerformanceTargetRateTypes.InterestRate newInterestRate
    );
    event ImpactDataUpdated(
        address indexed operator,
        ISustainabilityPerformanceTargetRateTypes.ImpactData[] newImpactData,
        address[] projects
    );

    function initializeSustainabilityPerformanceTargetRate(
        ISustainabilityPerformanceTargetRateTypes.InterestRate calldata _interestRate,
        ISustainabilityPerformanceTargetRateTypes.ImpactData[] calldata _impactData,
        address[] calldata _projects
    ) external;

    /**
     * @notice Marks the SustainabilityPerformanceTargetRate facet as ready following a Diamond upgrade.
     * @dev Called during upgrade re-initialisation. No storage migration is performed;
     *      existing state carries over unchanged. Reverts if the facet was not previously
     *      registered at one of the accepted config versions, or is already marked ready at
     *      the current config version.
     * @param fromVersions Accepted previous config versions for this upgrade path.
     */
    function reinitializeSustainabilityPerformanceTargetRate(uint256[] calldata fromVersions) external;

    function setInterestRate(ISustainabilityPerformanceTargetRateTypes.InterestRate calldata _newInterestRate) external;
    function setImpactData(
        ISustainabilityPerformanceTargetRateTypes.ImpactData[] calldata _newImpactData,
        address[] calldata projects
    ) external;

    function getInterestRate()
        external
        view
        returns (ISustainabilityPerformanceTargetRateTypes.InterestRate memory interestRate_);
    function getImpactDataFor(
        address _project
    ) external view returns (ISustainabilityPerformanceTargetRateTypes.ImpactData memory impactData_);
}
