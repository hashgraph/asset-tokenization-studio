// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRate } from "./IKpiLinkedRate.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../../../constants/roles.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title  KpiLinkedRate
 * @notice Facet implementing a KPI-linked interest rate for bond instruments, where the
 *         effective rate adjusts dynamically based on reported KPI performance against a
 *         defined baseline and deviation bounds.
 * @dev    Implements `IKpiLinkedRate` and inherits `Modifiers` for access control and
 *         pause guards. All interest rate and impact data state is delegated to
 *         `InterestRateStorageWrapper`, which persists data via the ERC-2535 Diamond
 *         Storage Pattern.
 *
 *         Initialisation is protected by the `onlyNotKpiLinkedRateInitialized` modifier,
 *         ensuring it can only be called once per diamond proxy. Subsequent rate and
 *         impact data updates require the caller to hold `_INTEREST_RATE_MANAGER_ROLE`
 *         and the contract to be unpaused. Both update functions trigger pending
 *         scheduled cross-ordered tasks before writing to storage, ensuring that any
 *         outstanding balance adjustments are settled before the new rate configuration
 *         takes effect.
 *
 *         Rate and impact data invariants (`minRate <= baseRate <= maxRate` and
 *         `maxDeviationFloor <= baseLine <= maxDeviationCap`) are enforced via the
 *         `onlyValidInterestRate` and `onlyValidImpactData` modifiers respectively.
 * @author Hashgraph
 */
contract KpiLinkedRate is IKpiLinkedRate, Modifiers {
    /**
     * @notice Initialises the KPI-linked rate module with the provided interest rate
     *         and impact data configuration.
     * @dev    Protected by `onlyNotKpiLinkedRateInitialized`; reverts if the KPI-linked
     *         rate subsystem has already been initialised. Delegates all state writes to
     *         `InterestRateStorageWrapper.initializeKpiLinkedRate`. Callers should ensure
     *         the rate and impact data invariants hold before calling, as no validation
     *         modifier is applied at this entry point; validation is expected to have been
     *         performed upstream (e.g. in the factory).
     * @param _interestRate  Calldata struct containing all KPI rate parameters, including
     *                       min, base, and max rates and period configuration.
     * @param _impactData    Calldata struct containing KPI deviation bounds and precision
     *                       parameters.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_KpiLinkedRate(
        InterestRate calldata _interestRate,
        ImpactData calldata _impactData
    ) external override onlyNotKpiLinkedRateInitialized {
        InterestRateStorageWrapper.initializeKpiLinkedRate(_interestRate, _impactData);
    }

    /**
     * @notice Updates the stored KPI interest rate configuration to the provided values.
     * @dev    Requires the caller to hold `_INTEREST_RATE_MANAGER_ROLE`, the contract to
     *         be unpaused, and the new rate to satisfy `minRate <= baseRate <= maxRate`
     *         (enforced via `onlyValidInterestRate`). Triggers pending scheduled
     *         cross-ordered tasks before writing to ensure all outstanding balance
     *         adjustments are settled under the previous rate configuration.
     *         Emits: `IKpiLinkedRate.InterestRateUpdated`.
     * @param _newInterestRate  Calldata struct containing the updated KPI rate parameters.
     */
    function setInterestRate(
        InterestRate calldata _newInterestRate
    ) external onlyUnpaused onlyRole(_INTEREST_RATE_MANAGER_ROLE) onlyValidInterestRate(_newInterestRate) {
        ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks();
        InterestRateStorageWrapper.setInterestRate(_newInterestRate);
        emit InterestRateUpdated(EvmAccessors.getMsgSender(), _newInterestRate);
    }

    /**
     * @notice Updates the stored KPI impact data configuration to the provided values.
     * @dev    Requires the caller to hold `_INTEREST_RATE_MANAGER_ROLE`, the contract to
     *         be unpaused, and the new impact data to satisfy
     *         `maxDeviationFloor <= baseLine <= maxDeviationCap` (enforced via
     *         `onlyValidImpactData`). Triggers pending scheduled cross-ordered tasks
     *         before writing to ensure all outstanding balance adjustments are settled
     *         under the previous impact data configuration.
     *         Emits: `IKpiLinkedRate.ImpactDataUpdated`.
     * @param _newImpactData  Calldata struct containing the updated KPI deviation bounds
     *                        and precision parameters.
     */
    function setImpactData(
        ImpactData calldata _newImpactData
    ) external onlyUnpaused onlyRole(_INTEREST_RATE_MANAGER_ROLE) onlyValidImpactData(_newImpactData) {
        ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks();
        InterestRateStorageWrapper.setImpactData(_newImpactData);
        emit ImpactDataUpdated(EvmAccessors.getMsgSender(), _newImpactData);
    }

    /**
     * @notice Returns the currently stored KPI interest rate configuration.
     * @dev    Delegates entirely to `InterestRateStorageWrapper.getInterestRate`. Returns
     *         zero-value defaults if the KPI-linked rate module has not yet been
     *         initialised.
     * @return interestRate_  Memory struct containing all current KPI rate parameters.
     */
    function getInterestRate() external view returns (InterestRate memory interestRate_) {
        interestRate_ = InterestRateStorageWrapper.getInterestRate();
    }

    /**
     * @notice Returns the currently stored KPI impact data configuration.
     * @dev    Delegates entirely to `InterestRateStorageWrapper.getImpactData`. Returns
     *         zero-value defaults if the KPI-linked rate module has not yet been
     *         initialised.
     * @return impactData_  Memory struct containing the current KPI deviation bounds and
     *                      precision parameters.
     */
    function getImpactData() external view returns (ImpactData memory impactData_) {
        impactData_ = InterestRateStorageWrapper.getImpactData();
    }
}
