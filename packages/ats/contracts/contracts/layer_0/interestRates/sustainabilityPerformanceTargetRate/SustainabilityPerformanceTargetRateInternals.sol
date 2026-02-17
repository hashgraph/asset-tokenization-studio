// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpiLinkedRateInternals } from "../kpiLinkedRate/KpiLinkedRateInternals.sol";
// prettier-ignore
// solhint-disable-next-line max-line-length
import { ISustainabilityPerformanceTargetRate } from "../../../layer_2/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";

abstract contract SustainabilityPerformanceTargetRateInternals is KpiLinkedRateInternals {
    // prettier-ignore
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_SustainabilityPerformanceTargetRate(
        ISustainabilityPerformanceTargetRate.InterestRate calldata _interestRate,
        ISustainabilityPerformanceTargetRate.ImpactData[] calldata _impactData,
        address[] calldata _projects
    ) internal virtual;
    function _setSPTImpactData(
        ISustainabilityPerformanceTargetRate.ImpactData calldata _newImpactData,
        address _project
    ) internal virtual;
    function _setSPTInterestRate(
        ISustainabilityPerformanceTargetRate.InterestRate calldata _newInterestRate
    ) internal virtual;
    function _getSPTImpactDataFor(
        address _project
    ) internal view virtual returns (ISustainabilityPerformanceTargetRate.ImpactData memory impactData_);
    function _getSPTInterestRate()
        internal
        view
        virtual
        returns (ISustainabilityPerformanceTargetRate.InterestRate memory interestRate_);
    function _isSustainabilityPerformanceTargetRateInitialized() internal view virtual returns (bool);
}
