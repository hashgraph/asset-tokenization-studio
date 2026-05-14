// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRate } from "./IKpiLinkedRate.sol";
import { INTEREST_RATE_MANAGER_ROLE } from "../../../../constants/roles.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { ScheduledTasksOps } from "../../../../domain/orchestrator/ScheduledTasksOps.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

contract KpiLinkedRate is IKpiLinkedRate, Modifiers {
    function initializeKpiLinkedRate(
        InterestRate calldata _interestRate,
        ImpactData calldata _impactData
    ) external override onlyNotKpiLinkedRateInitialized {
        InterestRateStorageWrapper.setInterestRate(_interestRate);
        InterestRateStorageWrapper.setImpactData(_impactData);
        InterestRateStorageWrapper.kpiLinkedRateStorage().initialized = true;
    }

    function setKpiLinkedRateInterestRate(
        InterestRate calldata _newInterestRate
    ) external onlyUnpaused onlyRole(INTEREST_RATE_MANAGER_ROLE) onlyValidInterestRate(_newInterestRate) {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        InterestRateStorageWrapper.setInterestRate(_newInterestRate);
        emit InterestRateUpdated(EvmAccessors.getMsgSender(), _newInterestRate);
    }

    function setKpiLinkedRateImpactData(
        ImpactData calldata _newImpactData
    ) external onlyUnpaused onlyRole(INTEREST_RATE_MANAGER_ROLE) onlyValidImpactData(_newImpactData) {
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
