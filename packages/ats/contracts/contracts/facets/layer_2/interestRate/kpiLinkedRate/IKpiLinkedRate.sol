// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRateTypes } from "./IKpiLinkedRateTypes.sol";

/**
 * @title KPI-Linked Interest Rate Interface
 * @notice Defines the interface for a KPI-linked interest rate mechanism
 * @dev Extends IKpiLinkedRateTypes to provide functions for managing interest rates tied to KPIs
 * @author Hashgraph
 */
interface IKpiLinkedRate is IKpiLinkedRateTypes {
    /**
     * @notice Emitted when the interest rate configuration is updated
     * @param operator The address of the operator who initiated the update
     * @param newInterestRate The updated interest rate configuration
     */
    event InterestRateUpdated(address indexed operator, InterestRate newInterestRate);

    /**
     * @notice Emitted when the impact data configuration is updated
     * @param operator The address of the operator who initiated the update
     * @param newImpactData The updated impact data configuration
     */
    event ImpactDataUpdated(address indexed operator, ImpactData newImpactData);

    /**
     * @notice Thrown when attempting to set an interest rate that is already KPI-linked
     * @dev Prevents accidental overwrites of KPI-linked configurations
     */
    error InterestRateIsKpiLinked();

    /**
     * @notice Initialises the KPI-linked interest rate mechanism
     * @dev Sets up the initial interest rate and impact data configurations
     * @param _interestRate The initial interest rate configuration
     * @param _impactData The initial impact data configuration
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_KpiLinkedRate(InterestRate calldata _interestRate, ImpactData calldata _impactData) external;

    /**
     * @notice Updates the current interest rate configuration
     * @dev Can only be called by authorised operators; emits InterestRateUpdated event
     * @param _newInterestRate The new interest rate configuration
     */
    function setInterestRate(InterestRate calldata _newInterestRate) external;

    /**
     * @notice Updates the impact data configuration
     * @dev Can only be called by authorised operators; emits ImpactDataUpdated event
     * @param _newImpactData The new impact data configuration
     */
    function setImpactData(ImpactData calldata _newImpactData) external;

    /**
     * @notice Retrieves the current interest rate configuration
     * @dev Returns a copy of the stored InterestRate struct
     * @return interestRate_ The current interest rate configuration
     */
    function getInterestRate() external view returns (InterestRate memory interestRate_);

    /**
     * @notice Retrieves the current impact data configuration
     * @dev Returns a copy of the stored ImpactData struct
     * @return impactData_ The current impact data configuration
     */
    function getImpactData() external view returns (ImpactData memory impactData_);
}
