// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRate } from "./IKpiLinkedRate.sol";
import { INTEREST_RATE_MANAGER_ROLE, DEFAULT_ADMIN_ROLE } from "../../../../constants/roles.sol";
import { _KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { ScheduledTasksOps } from "../../../../domain/orchestrator/ScheduledTasksOps.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title KpiLinkedRate
 * @notice Manages the interest rate and impact data of a KPI-linked rate instrument.
 * @dev Implements `IKpiLinkedRate` and delegates persistence to
 *      `InterestRateStorageWrapper`. Administrative initialisation is single-use per
 *      resolver key. Rate and impact updates require an operational, activated and
 *      unpaused token, and trigger pending scheduled cross-ordered tasks before mutation.
 * @author Asset Tokenization Studio Team
 */
contract KpiLinkedRate is IKpiLinkedRate, Modifiers {
    /// @inheritdoc IKpiLinkedRate
    /// @dev Can only be called by `DEFAULT_ADMIN_ROLE` before this facet is registered as ready.
    function initializeKpiLinkedRate(
        InterestRate calldata _interestRate,
        ImpactData calldata _impactData
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(_KPI_LINKED_RATE_RESOLVER_KEY) {
        InterestRateStorageWrapper.setInterestRate(_interestRate);
        InterestRateStorageWrapper.setImpactData(_impactData);
        InitializerStorageWrapper.setFacetToReady(_KPI_LINKED_RATE_RESOLVER_KEY);
        emit IKpiLinkedRate.KpiLinkedRateInitialized(_interestRate, _impactData);
    }

    /// @inheritdoc IKpiLinkedRate
    /// @dev Requires `INTEREST_RATE_MANAGER_ROLE`, valid rate bounds, and an operational,
    ///      activated and unpaused token. Executes pending scheduled tasks before updating
    ///      storage to preserve temporal ordering.
    function setKpiLinkedRateInterestRate(
        InterestRate calldata _newInterestRate
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(INTEREST_RATE_MANAGER_ROLE)
        onlyValidInterestRate(_newInterestRate)
    {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        InterestRateStorageWrapper.setInterestRate(_newInterestRate);
        emit InterestRateUpdated(EvmAccessors.getMsgSender(), _newInterestRate);
    }

    /// @inheritdoc IKpiLinkedRate
    /// @dev Requires `INTEREST_RATE_MANAGER_ROLE`, valid impact data, and an operational,
    ///      activated and unpaused token. Executes pending scheduled tasks before updating
    ///      storage to preserve temporal ordering.
    function setKpiLinkedRateImpactData(
        ImpactData calldata _newImpactData
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(INTEREST_RATE_MANAGER_ROLE)
        onlyValidImpactData(_newImpactData)
    {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        InterestRateStorageWrapper.setImpactData(_newImpactData);
        emit ImpactDataUpdated(EvmAccessors.getMsgSender(), _newImpactData);
    }

    /**
     * @notice Returns the current KPI-linked interest rate configuration.
     * @dev Reads the persisted rate data without mutating state.
     * @return interestRate_ Current interest rate parameters.
     */
    function getKpiLinkedRateInterestRate() external view returns (InterestRate memory interestRate_) {
        interestRate_ = InterestRateStorageWrapper.getInterestRate();
    }

    /**
     * @notice Returns the current KPI-linked impact data configuration.
     * @dev Reads the persisted impact data without mutating state.
     * @return impactData_ Current impact data parameters.
     */
    function getKpiLinkedRateImpactData() external view returns (ImpactData memory impactData_) {
        impactData_ = InterestRateStorageWrapper.getImpactData();
    }
}
