// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRate } from "./IKpiLinkedRate.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";

contract KpiLinkedRate is IKpiLinkedRate {
    error AlreadyInitialized();
    // solhint-disable-next-line func-name-mixedcase
    function initialize_KpiLinkedRate(
        InterestRate calldata _interestRate,
        ImpactData calldata _impactData
    ) external override {
        if (InterestRateStorageWrapper._kpiLinkedRateStorage().initialized) revert AlreadyInitialized();
        InterestRateStorageWrapper._setInterestRate(_interestRate);
        InterestRateStorageWrapper._setImpactData(_impactData);
        InterestRateStorageWrapper._kpiLinkedRateStorage().initialized = true;
    }

    function setInterestRate(InterestRate calldata _newInterestRate) external {
        AccessControlStorageWrapper._checkRole(_INTEREST_RATE_MANAGER_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        InterestRateStorageWrapper._requireValidInterestRate(_newInterestRate);
        InterestRateStorageWrapper._setInterestRate(_newInterestRate);
        emit InterestRateUpdated(msg.sender, _newInterestRate);
    }

    function setImpactData(ImpactData calldata _newImpactData) external {
        AccessControlStorageWrapper._checkRole(_INTEREST_RATE_MANAGER_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        InterestRateStorageWrapper._requireValidImpactData(_newImpactData);
        InterestRateStorageWrapper._setImpactData(_newImpactData);
        emit ImpactDataUpdated(msg.sender, _newImpactData);
    }

    function getInterestRate() external view returns (InterestRate memory interestRate_) {
        interestRate_ = InterestRateStorageWrapper._getInterestRate();
    }

    function getImpactData() external view returns (ImpactData memory impactData_) {
        impactData_ = InterestRateStorageWrapper._getImpactData();
    }
}
