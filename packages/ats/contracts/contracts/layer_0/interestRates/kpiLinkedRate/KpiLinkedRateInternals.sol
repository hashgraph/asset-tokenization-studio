// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { FixedRateInternals } from "../fixedRate/FixedRateInternals.sol";
import { IKpiLinkedRate } from "../../../layer_2/interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol";

abstract contract KpiLinkedRateInternals is FixedRateInternals {
    function _setImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) internal virtual;
    function _setInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) internal virtual;
    function _getImpactData() internal view virtual returns (IKpiLinkedRate.ImpactData memory impactData_);
    function _getInterestRate() internal view virtual returns (IKpiLinkedRate.InterestRate memory interestRate_);
}
