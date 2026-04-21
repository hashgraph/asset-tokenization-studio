// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;
import { IKpiLinkedRateTypes } from "../../../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRateTypes.sol";

/**
 * @title T-Rex KPI Linked Interest Rate Interface
 * @notice Defines the interface for a KPI-linked interest rate mechanism within the T-Rex ecosystem.
 * @dev Extends `IKpiLinkedRateTypes` to utilise shared data structures and types.
 * @author Hashgraph
 */
interface TRexIKpiLinkedRate is IKpiLinkedRateTypes {
    /**
     * @notice Emitted when the interest rate configuration is updated.
     * @param operator The address of the authorised operator performing the update.
     * @param newInterestRate The updated interest rate parameters.
     */
    event InterestRateUpdated(address indexed operator, InterestRate newInterestRate);

    /**
     * @notice Emitted when the KPI impact data is updated.
     * @param operator The address of the authorised operator performing the update.
     * @param newImpactData The updated impact data used for rate calculations.
     */
    event ImpactDataUpdated(address indexed operator, ImpactData newImpactData);

    /**
     * @notice Thrown when attempting to modify an interest rate that is already linked to KPIs.
     * @dev Prevents accidental overwrites of active KPI-linked configurations.
     */
    error InterestRateIsKpiLinked();

    /**
     * @notice Initialises the KPI-linked interest rate mechanism with specified parameters.
     * @dev Sets up both the base interest rate and the impact data for KPI adjustments.
     * @param _interestRate The initial interest rate configuration.
     * @param _impactData The initial impact data influencing rate variability.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_KpiLinkedRate(InterestRate calldata _interestRate, ImpactData calldata _impactData) external;

    /**
     * @notice Updates the fixed components of the interest rate.
     * @dev Only callable by authorised roles; reverts if rate is actively KPI-linked.
     * @param _newInterestRate The updated interest rate parameters.
     */
    function setInterestRate(InterestRate calldata _newInterestRate) external;

    /**
     * @notice Updates the KPI impact data used for dynamic rate adjustments.
     * @dev Allows modification of how KPI performance influences the interest rate.
     * @param _newImpactData The new impact data structure.
     */
    function setImpactData(ImpactData calldata _newImpactData) external;

    /**
     * @notice Retrieves the current interest rate configuration.
     * @dev Returns a structured representation of the rate including base and KPI-linked elements.
     * @return interestRate_ The current interest rate settings.
     */
    function getInterestRate() external view returns (InterestRate memory interestRate_);

    /**
     * @notice Retrieves the current KPI impact data.
     * @dev Provides insight into how KPI metrics influence the variable component of the rate.
     * @return impactData_ The current impact data configuration.
     */
    function getImpactData() external view returns (ImpactData memory impactData_);
}
