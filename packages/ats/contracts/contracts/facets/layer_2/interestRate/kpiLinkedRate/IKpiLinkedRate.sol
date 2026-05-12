// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRateErrors } from "./IKpiLinkedRateErrors.sol";

interface IKpiLinkedRate is IKpiLinkedRateErrors {
    event InterestRateUpdated(address indexed operator, InterestRate newInterestRate);
    event ImpactDataUpdated(address indexed operator, ImpactData newImpactData);

    error InterestRateIsKpiLinked();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_KpiLinkedRate(InterestRate calldata _interestRate, ImpactData calldata _impactData) external;

    function setInterestRate(InterestRate calldata _newInterestRate) external;
    function setImpactData(ImpactData calldata _newImpactData) external;

    function getInterestRate() external view returns (InterestRate memory interestRate_);
    function getImpactData() external view returns (ImpactData memory impactData_);
}
