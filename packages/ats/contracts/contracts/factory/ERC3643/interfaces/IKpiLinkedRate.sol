// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

import { TRexIKpiLinkedRateErrors as IKpiLinkedRateErrors } from "./IKpiLinkedRateErrors.sol";

interface TRexIKpiLinkedRate is IKpiLinkedRateErrors {
    event InterestRateUpdated(address indexed operator, InterestRate newInterestRate);
    event ImpactDataUpdated(address indexed operator, ImpactData newImpactData);

    error InterestRateIsKpiLinked();

    function initializeKpiLinkedRate(InterestRate calldata _interestRate, ImpactData calldata _impactData) external;

    /**
     * @notice Marks the KpiLinkedRate facet as ready following a Diamond upgrade.
     * @dev Called during upgrade re-initialisation. No storage migration is performed;
     *      existing state carries over unchanged. Reverts if the facet was not previously
     *      registered at one of the accepted config versions, or is already marked ready at
     *      the current config version.
     * @param fromVersions Accepted previous config versions for this upgrade path.
     */
    function reinitializeKpiLinkedRate(uint256[] calldata fromVersions) external;

    function setInterestRate(InterestRate calldata _newInterestRate) external;
    function setImpactData(ImpactData calldata _newImpactData) external;

    function getInterestRate() external view returns (InterestRate memory interestRate_);
    function getImpactData() external view returns (ImpactData memory impactData_);
}
