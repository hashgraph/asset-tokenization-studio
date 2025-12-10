// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseStorageWrapper } from "../../core/pause/PauseStorageWrapper.sol";
import {
    _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_STORAGE_POSITION
} from "../../../layer_2/constants/storagePositions.sol";
import {
    ISustainabilityPerformanceTargetRate
} from "../../../layer_2/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
import { KpiLinkedRateStorageWrapper } from "../kpiLinkedRate/KpiLinkedRateStorageWrapper.sol";

abstract contract SustainabilityPerformanceTargetRateStorageWrapper is KpiLinkedRateStorageWrapper {
    struct SustainabilityPerformanceTargetRateDataStorage {
        uint256 baseRate;
        uint256 startPeriod;
        uint256 startRate;
        uint8 rateDecimals;
        mapping(address project => ISustainabilityPerformanceTargetRate.ImpactData impactData) impactDataByProject;
        bool initialized;
    }

    function _setSPTInterestRate(ISustainabilityPerformanceTargetRate.InterestRate calldata _newInterestRate) internal {
        _triggerScheduledCrossOrderedTasks(0);
        SustainabilityPerformanceTargetRateDataStorage
            storage sustainabilityPerformanceTargetRateDataStorage = _sustainabilityPerformanceTargetRateStorage();
        sustainabilityPerformanceTargetRateDataStorage.baseRate = _newInterestRate.baseRate;
        sustainabilityPerformanceTargetRateDataStorage.startPeriod = _newInterestRate.startPeriod;
        sustainabilityPerformanceTargetRateDataStorage.startRate = _newInterestRate.startRate;
        sustainabilityPerformanceTargetRateDataStorage.rateDecimals = _newInterestRate.rateDecimals;
    }
    function _setSPTImpactData(
        ISustainabilityPerformanceTargetRate.ImpactData calldata _newImpactData,
        address _project
    ) internal {
        _triggerScheduledCrossOrderedTasks(0);
        ISustainabilityPerformanceTargetRate.ImpactData
            storage impactData = _sustainabilityPerformanceTargetRateStorage().impactDataByProject[_project];
        impactData.baseLine = _newImpactData.baseLine;
        impactData.baseLineMode = _newImpactData.baseLineMode;
        impactData.deltaRate = _newImpactData.deltaRate;
        impactData.impactDataMode = _newImpactData.impactDataMode;
    }

    function _getSPTInterestRate()
        internal
        view
        returns (ISustainabilityPerformanceTargetRate.InterestRate memory interestRate_)
    {
        SustainabilityPerformanceTargetRateDataStorage
            storage sustainabilityPerformanceTargetRateDataStorage = _sustainabilityPerformanceTargetRateStorage();
        interestRate_ = ISustainabilityPerformanceTargetRate.InterestRate({
            baseRate: sustainabilityPerformanceTargetRateDataStorage.baseRate,
            startPeriod: sustainabilityPerformanceTargetRateDataStorage.startPeriod,
            startRate: sustainabilityPerformanceTargetRateDataStorage.startRate,
            rateDecimals: sustainabilityPerformanceTargetRateDataStorage.rateDecimals
        });
    }

    function _getSPTImpactDataFor(
        address _project
    ) internal view returns (ISustainabilityPerformanceTargetRate.ImpactData memory impactData_) {
        return _sustainabilityPerformanceTargetRateStorage().impactDataByProject[_project];
    }

    function _sustainabilityPerformanceTargetRateStorage()
        internal
        pure
        returns (SustainabilityPerformanceTargetRateDataStorage storage sustainabilityPerformanceTargetRateDataStorage_)
    {
        bytes32 position = _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            sustainabilityPerformanceTargetRateDataStorage_.slot := position
        }
    }
}
