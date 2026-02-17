// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AccessControlModifiers } from "../../core/accessControl/AccessControlModifiers.sol";
import { IKpiLinkedRate } from "../../../layer_2/interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol";

abstract contract KpiLinkedRateModifiers is AccessControlModifiers {
    // ===== KpiLinkedRate Modifiers =====
    modifier checkInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) virtual;
    modifier checkImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) virtual;
}
