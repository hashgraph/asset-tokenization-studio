// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_STORAGE_POSITION
} from "contracts/layer_2/constants/storagePositions.sol";
import {
    ISustainabilityPerformanceTargetRate
} from "contracts/layer_2/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
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

    modifier onlyEqualLength(uint256 len1, uint256 len2) {
        if (len1 != len2) {
            revert ISustainabilityPerformanceTargetRate.ProvidedListsLengthMismatch(len1, len2);
        }
        _;
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_SustainabilityPerformanceTargetRate(
        ISustainabilityPerformanceTargetRate.InterestRate calldata _interestRate,
        ISustainabilityPerformanceTargetRate.ImpactData[] calldata _impactData,
        address[] calldata _projects
    ) internal override {
        _setSPTInterestRate(_interestRate);
        for (uint256 index = 0; index < _impactData.length; index++) {
            if (!_isProceedRecipient(_projects[index]))
                revert ISustainabilityPerformanceTargetRate.NotExistingProject(_projects[index]);
            _setSPTImpactData(_impactData[index], _projects[index]);
        }

        _sustainabilityPerformanceTargetRateStorage().initialized = true;
    }

    function _setSPTInterestRate(
        ISustainabilityPerformanceTargetRate.InterestRate calldata _newInterestRate
    ) internal override {
        _callTriggerPendingScheduledCrossOrderedTasks();
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
    ) internal override {
        _callTriggerPendingScheduledCrossOrderedTasks();
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
        override
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
    ) internal view override returns (ISustainabilityPerformanceTargetRate.ImpactData memory impactData_) {
        return _sustainabilityPerformanceTargetRateStorage().impactDataByProject[_project];
    }

    function _isSustainabilityPerformanceTargetRateInitialized() internal view override returns (bool) {
        return _sustainabilityPerformanceTargetRateStorage().initialized;
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
