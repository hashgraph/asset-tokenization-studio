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
    // --- Fixed Rate functions ---

    function setRate(uint256 _newRate, uint8 _newRateDecimals) internal {
        FixedRateDataStorage storage frs = fixedRateStorage();
        frs.rate = _newRate;
        frs.decimals = _newRateDecimals;
    }

    // --- KPI Linked Rate functions ---

    function setInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) internal {
        KpiLinkedRateDataStorage storage kpiRateStorage = kpiLinkedRateStorage();
        kpiRateStorage.maxRate = _newInterestRate.maxRate;
        kpiRateStorage.baseRate = _newInterestRate.baseRate;
        kpiRateStorage.minRate = _newInterestRate.minRate;
        kpiRateStorage.startPeriod = _newInterestRate.startPeriod;
        kpiRateStorage.startRate = _newInterestRate.startRate;
        kpiRateStorage.missedPenalty = _newInterestRate.missedPenalty;
        kpiRateStorage.reportPeriod = _newInterestRate.reportPeriod;
        kpiRateStorage.rateDecimals = _newInterestRate.rateDecimals;
    }

    function setImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) internal {
        KpiLinkedRateDataStorage storage kpiRateStorage = kpiLinkedRateStorage();
        kpiRateStorage.maxDeviationCap = _newImpactData.maxDeviationCap;
        kpiRateStorage.baseLine = _newImpactData.baseLine;
        kpiRateStorage.maxDeviationFloor = _newImpactData.maxDeviationFloor;
        kpiRateStorage.impactDataDecimals = _newImpactData.impactDataDecimals;
        kpiRateStorage.adjustmentPrecision = _newImpactData.adjustmentPrecision;
    }

    // --- SPT Rate functions ---

    // solhint-disable-next-line func-name-mixedcase
    function initialize_SustainabilityPerformanceTargetRate(
        ISustainabilityPerformanceTargetRate.InterestRate calldata _interestRate,
        ISustainabilityPerformanceTargetRate.ImpactData[] calldata _impactData,
        address[] calldata _projects,
        function(address) view returns (bool) _isProceedRecipient
    ) internal {
        setSPTInterestRate(_interestRate);
        for (uint256 index = 0; index < _impactData.length; index++) {
            if (!_isProceedRecipient(_projects[index]))
                revert ISustainabilityPerformanceTargetRate.NotExistingProject(_projects[index]);
            setSPTImpactData(_impactData[index], _projects[index]);
        }

        sustainabilityPerformanceTargetRateStorage().initialized = true;
    }

    function setSPTInterestRate(ISustainabilityPerformanceTargetRate.InterestRate calldata _newInterestRate) internal {
        SustainabilityPerformanceTargetRateDataStorage
            storage sptStorage = sustainabilityPerformanceTargetRateStorage();
        sptStorage.baseRate = _newInterestRate.baseRate;
        sptStorage.startPeriod = _newInterestRate.startPeriod;
        sptStorage.startRate = _newInterestRate.startRate;
        sptStorage.rateDecimals = _newInterestRate.rateDecimals;
    }

    function setSPTImpactData(
        ISustainabilityPerformanceTargetRate.ImpactData calldata _newImpactData,
        address _project
    ) internal {
        ISustainabilityPerformanceTargetRate.ImpactData
            storage impactData = sustainabilityPerformanceTargetRateStorage().impactDataByProject[_project];
        impactData.baseLine = _newImpactData.baseLine;
        impactData.baseLineMode = _newImpactData.baseLineMode;
        impactData.deltaRate = _newImpactData.deltaRate;
        impactData.impactDataMode = _newImpactData.impactDataMode;
    }

    function getSPTInterestRate()
        internal
        view
        returns (ISustainabilityPerformanceTargetRate.InterestRate memory interestRate_)
    {
        SustainabilityPerformanceTargetRateDataStorage
            storage sptStorage = sustainabilityPerformanceTargetRateStorage();
        interestRate_ = ISustainabilityPerformanceTargetRate.InterestRate({
            baseRate: sptStorage.baseRate,
            startPeriod: sptStorage.startPeriod,
            startRate: sptStorage.startRate,
            rateDecimals: sptStorage.rateDecimals
        });
    }

    function getSPTImpactDataFor(
        address _project
    ) internal view returns (ISustainabilityPerformanceTargetRate.ImpactData memory impactData_) {
        return sustainabilityPerformanceTargetRateStorage().impactDataByProject[_project];
    }

    function isSustainabilityPerformanceTargetRateInitialized() internal view returns (bool) {
        return sustainabilityPerformanceTargetRateStorage().initialized;
    }

    function isFixedRateInitialized() internal view returns (bool) {
        return fixedRateStorage().initialized;
    }

    function isKpiLinkedRateInitialized() internal view returns (bool) {
        return kpiLinkedRateStorage().initialized;
    }

    // --- View functions ---

    function getRate() internal view returns (uint256 rate_, uint8 decimals_) {
        rate_ = fixedRateStorage().rate;
        decimals_ = fixedRateStorage().decimals;
    }

    function getInterestRate() internal view returns (IKpiLinkedRate.InterestRate memory interestRate_) {
        KpiLinkedRateDataStorage storage kpiRateStorage = kpiLinkedRateStorage();
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

    function getImpactData() internal view returns (IKpiLinkedRate.ImpactData memory impactData_) {
        KpiLinkedRateDataStorage storage kpiRateStorage = kpiLinkedRateStorage();
        impactData_ = IKpiLinkedRate.ImpactData({
            maxDeviationCap: kpiRateStorage.maxDeviationCap,
            baseLine: kpiRateStorage.baseLine,
            maxDeviationFloor: kpiRateStorage.maxDeviationFloor,
            impactDataDecimals: kpiRateStorage.impactDataDecimals,
            adjustmentPrecision: kpiRateStorage.adjustmentPrecision
        });
    }

    // --- Pure functions ---

    function requireValidInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) internal pure {
        if (
            _newInterestRate.minRate > _newInterestRate.baseRate || _newInterestRate.baseRate > _newInterestRate.maxRate
        ) {
            revert IKpiLinkedRate.WrongInterestRateValues(_newInterestRate);
        }
    }

    function requireValidImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) internal pure {
        if (
            _newImpactData.maxDeviationFloor > _newImpactData.baseLine ||
            _newImpactData.baseLine > _newImpactData.maxDeviationCap
        ) {
            revert IKpiLinkedRate.WrongImpactDataValues(_newImpactData);
        }
    }

    function requireEqualLength(uint256 len1, uint256 len2) internal pure {
        if (len1 != len2) {
            revert ISustainabilityPerformanceTargetRate.ProvidedListsLengthMismatch(len1, len2);
        }
    }

    // --- Storage accessors (pure) ---

    function fixedRateStorage() internal pure returns (FixedRateDataStorage storage fixedRateDataStorage_) {
        bytes32 position = _FIXED_RATE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            fixedRateDataStorage_.slot := position
        }
    }

    function kpiLinkedRateStorage() internal pure returns (KpiLinkedRateDataStorage storage kpiLinkedRateDataStorage_) {
        bytes32 position = _KPI_LINKED_RATE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kpiLinkedRateDataStorage_.slot := position
        }
    }

    function sustainabilityPerformanceTargetRateStorage()
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
