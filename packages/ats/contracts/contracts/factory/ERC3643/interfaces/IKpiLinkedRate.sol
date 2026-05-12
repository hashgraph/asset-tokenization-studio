// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

import { IKpiLinkedRateErrors } from "../../../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRateErrors.sol";

interface TRexIKpiLinkedRate is IKpiLinkedRateErrors {
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
