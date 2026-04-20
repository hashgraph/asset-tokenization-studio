// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRate } from "./IKpiLinkedRate.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../../../constants/roles.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

contract KpiLinkedRate is IKpiLinkedRate, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_KpiLinkedRate(
        InterestRate calldata _interestRate,
        ImpactData calldata _impactData
    ) external override onlyNotKpiLinkedRateInitialized {
        InterestRateStorageWrapper.setInterestRate(_interestRate);
        InterestRateStorageWrapper.setImpactData(_impactData);
        InterestRateStorageWrapper.kpiLinkedRateStorage().initialized = true;
    }

    function setInterestRate(
        InterestRate calldata _newInterestRate
    ) external onlyUnpaused onlyRole(_INTEREST_RATE_MANAGER_ROLE) onlyValidInterestRate(_newInterestRate) {
        ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks();
        InterestRateStorageWrapper.setInterestRate(_newInterestRate);
        emit InterestRateUpdated(EvmAccessors.getMsgSender(), _newInterestRate);
    }

    function setImpactData(
        ImpactData calldata _newImpactData
    ) external onlyUnpaused onlyRole(_INTEREST_RATE_MANAGER_ROLE) onlyValidImpactData(_newImpactData) {
        ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks();
        InterestRateStorageWrapper.setImpactData(_newImpactData);
        emit ImpactDataUpdated(EvmAccessors.getMsgSender(), _newImpactData);
    }

    function getInterestRate() external view returns (InterestRate memory interestRate_) {
        interestRate_ = InterestRateStorageWrapper.getInterestRate();
    }

    function getImpactData() external view returns (ImpactData memory impactData_) {
        impactData_ = InterestRateStorageWrapper.getImpactData();
    }
}
