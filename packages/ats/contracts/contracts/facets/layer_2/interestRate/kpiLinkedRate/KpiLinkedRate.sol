// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRate, RESOLVER_KEY_KPI_LINKED_RATE } from "./IKpiLinkedRate.sol";
import { ROLE_INTEREST_RATE_MANAGER, DEFAULT_ADMIN_ROLE } from "../../../../constants/roles.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { ScheduledTasksOps } from "../../../../domain/orchestrator/ScheduledTasksOps.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

contract KpiLinkedRate is IKpiLinkedRate, Modifiers {
    function initializeKpiLinkedRate(
        InterestRate calldata _interestRate,
        ImpactData calldata _impactData
    )
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_KPI_LINKED_RATE)
        onlyValidInterestRate(_interestRate)
        onlyValidImpactData(_impactData)
    {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        InterestRateStorageWrapper.setInterestRate(_interestRate);
        InterestRateStorageWrapper.setImpactData(_impactData);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_KPI_LINKED_RATE);
        emit IKpiLinkedRate.KpiLinkedRateInitialized(_interestRate, _impactData);
    }

    function setKpiLinkedRateInterestRate(
        InterestRate calldata _newInterestRate
    ) external onlyActivated onlyUnpaused onlyRole(ROLE_INTEREST_RATE_MANAGER) onlyValidInterestRate(_newInterestRate) {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        InterestRateStorageWrapper.setInterestRate(_newInterestRate);
        emit InterestRateUpdated(EvmAccessors.getMsgSender(), _newInterestRate);
    }

    function setKpiLinkedRateImpactData(
        ImpactData calldata _newImpactData
    ) external onlyActivated onlyUnpaused onlyRole(ROLE_INTEREST_RATE_MANAGER) onlyValidImpactData(_newImpactData) {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        InterestRateStorageWrapper.setImpactData(_newImpactData);
        emit ImpactDataUpdated(EvmAccessors.getMsgSender(), _newImpactData);
    }

    function getKpiLinkedRateInterestRate() external view returns (InterestRate memory interestRate_) {
        interestRate_ = InterestRateStorageWrapper.getInterestRate();
    }

    function getKpiLinkedRateImpactData() external view returns (ImpactData memory impactData_) {
        impactData_ = InterestRateStorageWrapper.getImpactData();
    }
}
