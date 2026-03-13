// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _FIXED_RATE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _KPI_LINKED_RATE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IKpiLinkedRate } from "../../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol";
/* solhint-disable max-line-length */
import {
    ISustainabilityPerformanceTargetRate
} from "../../facets/layer_2/interestRate/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
/* solhint-enable max-line-length */

// --- Storage structs ---

struct FixedRateDataStorage {
    uint256 rate;
    uint8 decimals;
    bool initialized;
}

struct KpiLinkedRateDataStorage {
    uint256 maxRate;
    uint256 baseRate;
    uint256 minRate;
    uint256 startPeriod;
    uint256 startRate;
    uint256 missedPenalty;
    uint256 reportPeriod;
    uint8 rateDecimals;
    uint256 maxDeviationCap;
    uint256 baseLine;
    uint256 maxDeviationFloor;
    uint256 adjustmentPrecision;
    uint8 impactDataDecimals;
    bool initialized;
}

struct SustainabilityPerformanceTargetRateDataStorage {
    uint256 baseRate;
    uint256 startPeriod;
    uint256 startRate;
    uint8 rateDecimals;
    mapping(address project => ISustainabilityPerformanceTargetRate.ImpactData impactData) impactDataByProject;
    bool initialized;
}

library InterestRateStorageWrapper {
    // --- Storage accessors ---

    function _fixedRateStorage() internal pure returns (FixedRateDataStorage storage fixedRateDataStorage_) {
        bytes32 position = _FIXED_RATE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            fixedRateDataStorage_.slot := position
        }
    }

    function _kpiLinkedRateStorage()
        internal
        pure
        returns (KpiLinkedRateDataStorage storage kpiLinkedRateDataStorage_)
    {
        bytes32 position = _KPI_LINKED_RATE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kpiLinkedRateDataStorage_.slot := position
        }
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

    // --- Guard functions ---

    function _requireValidInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) internal pure {
        if (
            _newInterestRate.minRate > _newInterestRate.baseRate || _newInterestRate.baseRate > _newInterestRate.maxRate
        ) {
            revert IKpiLinkedRate.WrongInterestRateValues(_newInterestRate);
        }
    }

    function _requireValidImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) internal pure {
        if (
            _newImpactData.maxDeviationFloor > _newImpactData.baseLine ||
            _newImpactData.baseLine > _newImpactData.maxDeviationCap
        ) {
            revert IKpiLinkedRate.WrongImpactDataValues(_newImpactData);
        }
    }

    function _requireEqualLength(uint256 len1, uint256 len2) internal pure {
        if (len1 != len2) {
            revert ISustainabilityPerformanceTargetRate.ProvidedListsLengthMismatch(len1, len2);
        }
    }

    // --- Fixed Rate functions ---

    // solhint-disable-next-line ordering
    function _setRate(uint256 _newRate, uint8 _newRateDecimals) internal {
        FixedRateDataStorage storage frs = _fixedRateStorage();
        frs.rate = _newRate;
        frs.decimals = _newRateDecimals;
    }

    function _getRate() internal view returns (uint256 rate_, uint8 decimals_) {
        rate_ = _fixedRateStorage().rate;
        decimals_ = _fixedRateStorage().decimals;
    }

    // --- KPI Linked Rate functions ---

    function _setInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) internal {
        KpiLinkedRateDataStorage storage kpiRateStorage = _kpiLinkedRateStorage();
        kpiRateStorage.maxRate = _newInterestRate.maxRate;
        kpiRateStorage.baseRate = _newInterestRate.baseRate;
        kpiRateStorage.minRate = _newInterestRate.minRate;
        kpiRateStorage.startPeriod = _newInterestRate.startPeriod;
        kpiRateStorage.startRate = _newInterestRate.startRate;
        kpiRateStorage.missedPenalty = _newInterestRate.missedPenalty;
        kpiRateStorage.reportPeriod = _newInterestRate.reportPeriod;
        kpiRateStorage.rateDecimals = _newInterestRate.rateDecimals;
    }

    function _setImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) internal {
        KpiLinkedRateDataStorage storage kpiRateStorage = _kpiLinkedRateStorage();
        kpiRateStorage.maxDeviationCap = _newImpactData.maxDeviationCap;
        kpiRateStorage.baseLine = _newImpactData.baseLine;
        kpiRateStorage.maxDeviationFloor = _newImpactData.maxDeviationFloor;
        kpiRateStorage.impactDataDecimals = _newImpactData.impactDataDecimals;
        kpiRateStorage.adjustmentPrecision = _newImpactData.adjustmentPrecision;
    }

    function _getInterestRate() internal view returns (IKpiLinkedRate.InterestRate memory interestRate_) {
        KpiLinkedRateDataStorage storage kpiRateStorage = _kpiLinkedRateStorage();
        interestRate_ = IKpiLinkedRate.InterestRate({
            maxRate: kpiRateStorage.maxRate,
            baseRate: kpiRateStorage.baseRate,
            minRate: kpiRateStorage.minRate,
            startPeriod: kpiRateStorage.startPeriod,
            startRate: kpiRateStorage.startRate,
            missedPenalty: kpiRateStorage.missedPenalty,
            reportPeriod: kpiRateStorage.reportPeriod,
            rateDecimals: kpiRateStorage.rateDecimals
        });
    }

    function _getImpactData() internal view returns (IKpiLinkedRate.ImpactData memory impactData_) {
        KpiLinkedRateDataStorage storage kpiRateStorage = _kpiLinkedRateStorage();
        impactData_ = IKpiLinkedRate.ImpactData({
            maxDeviationCap: kpiRateStorage.maxDeviationCap,
            baseLine: kpiRateStorage.baseLine,
            maxDeviationFloor: kpiRateStorage.maxDeviationFloor,
            impactDataDecimals: kpiRateStorage.impactDataDecimals,
            adjustmentPrecision: kpiRateStorage.adjustmentPrecision
        });
    }

    // --- SPT Rate functions ---

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_SustainabilityPerformanceTargetRate(
        ISustainabilityPerformanceTargetRate.InterestRate calldata _interestRate,
        ISustainabilityPerformanceTargetRate.ImpactData[] calldata _impactData,
        address[] calldata _projects,
        function(address) view returns (bool) _isProceedRecipient
    ) internal {
        _setSPTInterestRate(_interestRate);
        for (uint256 index = 0; index < _impactData.length; index++) {
            if (!_isProceedRecipient(_projects[index]))
                revert ISustainabilityPerformanceTargetRate.NotExistingProject(_projects[index]);
            _setSPTImpactData(_impactData[index], _projects[index]);
        }

        _sustainabilityPerformanceTargetRateStorage().initialized = true;
    }

    function _setSPTInterestRate(ISustainabilityPerformanceTargetRate.InterestRate calldata _newInterestRate) internal {
        SustainabilityPerformanceTargetRateDataStorage
            storage sptStorage = _sustainabilityPerformanceTargetRateStorage();
        sptStorage.baseRate = _newInterestRate.baseRate;
        sptStorage.startPeriod = _newInterestRate.startPeriod;
        sptStorage.startRate = _newInterestRate.startRate;
        sptStorage.rateDecimals = _newInterestRate.rateDecimals;
    }

    function _setSPTImpactData(
        ISustainabilityPerformanceTargetRate.ImpactData calldata _newImpactData,
        address _project
    ) internal {
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
            storage sptStorage = _sustainabilityPerformanceTargetRateStorage();
        interestRate_ = ISustainabilityPerformanceTargetRate.InterestRate({
            baseRate: sptStorage.baseRate,
            startPeriod: sptStorage.startPeriod,
            startRate: sptStorage.startRate,
            rateDecimals: sptStorage.rateDecimals
        });
    }

    function _getSPTImpactDataFor(
        address _project
    ) internal view returns (ISustainabilityPerformanceTargetRate.ImpactData memory impactData_) {
        return _sustainabilityPerformanceTargetRateStorage().impactDataByProject[_project];
    }

    function _isSustainabilityPerformanceTargetRateInitialized() internal view returns (bool) {
        return _sustainabilityPerformanceTargetRateStorage().initialized;
    }
}
