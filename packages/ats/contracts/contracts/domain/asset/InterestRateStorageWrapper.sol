// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _FIXED_RATE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _KPI_LINKED_RATE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IKpiLinkedRateErrors } from "../../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRateErrors.sol";
/* solhint-disable max-line-length */
import {
    ISustainabilityPerformanceTargetRateTypes
} from "../../facets/layer_2/interestRate/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRateTypes.sol";
/* solhint-enable max-line-length */

/**
 * @title FixedRateDataStorage
 * @notice Struct holding the fixed interest rate value and its decimal precision,
 *         along with an initialisation flag.
 * @param rate The fixed interest rate value.
 * @param decimals Number of decimal places for the rate.
 * @param initialized Whether the fixed rate data has been initialised.
 */
struct FixedRateDataStorage {
    uint256 rate;
    uint8 decimals;
    bool initialized;
}

/**
 * @title KpiLinkedRateDataStorage
 * @notice Stores parameters for a KPI-linked interest rate model, including rate
 *         boundaries, reporting constraints, and impact data bounds.
 * @param maxRate Upper bound for the KPI-linked rate.
 * @param baseRate Base rate from which adjustments are applied.
 * @param minRate Lower bound for the KPI-linked rate.
 * @param startPeriod Unix timestamp marking the start of the rate calculation period.
 * @param startRate Initial rate applicable at startPeriod.
 * @param missedPenalty Penalty rate applied when a report is missed.
 * @param reportPeriod Duration in seconds between successive reports.
 * @param rateDecimals Number of decimals for rate values.
 * @param maxDeviationCap Upper deviation cap for impact data.
 * @param baseLine Baseline value for impact deviation calculations.
 * @param maxDeviationFloor Lower deviation floor for impact data.
 * @param adjustmentPrecision Precision factor for the adjustment computation.
 * @param impactDataDecimals Number of decimals for impact data fields.
 * @param initialized Whether the KPI-linked rate data has been initialised.
 */
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

/**
 * @title SustainabilityPerformanceTargetRateDataStorage
 * @notice Holds base interest rate parameters and a per-project mapping of impact
 *         data for the sustainability performance target rate model.
 * @param baseRate The base interest rate for this model.
 * @param startPeriod Unix timestamp when the rate period begins.
 * @param startRate Initial rate at startPeriod.
 * @param rateDecimals Number of decimals for rate values.
 * @param impactDataByProject Mapping from a project address to its ImpactData.
 * @param initialized Whether the sustainability performance target rate data has
 *                    been initialised.
 */
struct SustainabilityPerformanceTargetRateDataStorage {
    uint256 baseRate;
    uint256 startPeriod;
    uint256 startRate;
    uint8 rateDecimals;
    mapping(address project => ISustainabilityPerformanceTargetRateTypes.ImpactData impactData) impactDataByProject;
    bool initialized;
}

/**
 * @title InterestRateStorageWrapper
 * @notice Library providing setters, getters, validation, and storage access for
 *         three interest rate models using deterministic storage slots.
 * @dev All functions are internal. Storage slots are accessed via inline assembly
 *      using precomputed position constants. The library is intended to be used by
 *      facet contracts that manage interest rate state.
 * @author Asset Tokenization Studio Team
 */
library InterestRateStorageWrapper {
    /**
     * @notice Stores the fixed interest rate and its decimal precision.
     * @dev Mutates the fixed rate storage slot.
     * @param _newRate The new fixed interest rate value.
     * @param _newRateDecimals The number of decimals for the new rate.
     */
    function setRate(uint256 _newRate, uint8 _newRateDecimals) internal {
        FixedRateDataStorage storage frs = fixedRateStorage();
        frs.rate = _newRate;
        frs.decimals = _newRateDecimals;
    }

    /**
     * @notice Stores the full interest rate configuration for the KPI-linked model.
     * @dev Copies all fields from the calldata InterestRate struct into storage.
     * @param _newInterestRate The InterestRate structure containing all rate parameters.
     */
    function setInterestRate(IKpiLinkedRateErrors.InterestRate calldata _newInterestRate) internal {
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

    /**
     * @notice Stores the impact data configuration for the KPI-linked model.
     * @dev Copies deviation bounds and precision from the calldata ImpactData struct.
     * @param _newImpactData The ImpactData structure containing deviation and precision parameters.
     */
    function setImpactData(IKpiLinkedRateErrors.ImpactData calldata _newImpactData) internal {
        KpiLinkedRateDataStorage storage kpiRateStorage = kpiLinkedRateStorage();
        kpiRateStorage.maxDeviationCap = _newImpactData.maxDeviationCap;
        kpiRateStorage.baseLine = _newImpactData.baseLine;
        kpiRateStorage.maxDeviationFloor = _newImpactData.maxDeviationFloor;
        kpiRateStorage.impactDataDecimals = _newImpactData.impactDataDecimals;
        kpiRateStorage.adjustmentPrecision = _newImpactData.adjustmentPrecision;
    }

    /**
     * @notice Initialises the sustainability performance target rate model with an
     *         interest rate and impact data for a list of projects.
     * @dev Validates each project via the callback _isProceedRecipient and reverts
     *      with NotExistingProject if invalid. The initialized flag is set once all
     *      assignments succeed.
     * @param _interestRate The InterestRate configuration for the SPT model.
     * @param _impactData Array of ImpactData structures, one per project.
     * @param _projects Array of project addresses corresponding to each impact data entry.
     * @param _isProceedRecipient Callback function that returns true if the project exists.
     * @custom:revert ISustainabilityPerformanceTargetRateTypes.NotExistingProject if any project is not valid.
     */
    function initializeSustainabilityPerformanceTargetRate(
        ISustainabilityPerformanceTargetRateTypes.InterestRate calldata _interestRate,
        ISustainabilityPerformanceTargetRateTypes.ImpactData[] calldata _impactData,
        address[] calldata _projects,
        function(address) view returns (bool) _isProceedRecipient
    ) internal {
        setSPTInterestRate(_interestRate);
        uint256 length = _impactData.length;
        for (uint256 index; index < length; ) {
            address project = _projects[index];
            if (!_isProceedRecipient(project))
                revert ISustainabilityPerformanceTargetRateTypes.NotExistingProject(project);
            setSPTImpactData(_impactData[index], project);
            unchecked {
                ++index;
            }
        }
        sustainabilityPerformanceTargetRateStorage().initialized = true;
    }

    /**
     * @notice Stores the interest rate configuration for the sustainability
     *         performance target rate model.
     * @dev Copies baseRate, startPeriod, startRate, and rateDecimals into storage.
     * @param _newInterestRate The InterestRate structure containing the SPT parameters.
     */
    function setSPTInterestRate(
        ISustainabilityPerformanceTargetRateTypes.InterestRate calldata _newInterestRate
    ) internal {
        SustainabilityPerformanceTargetRateDataStorage
            storage sptStorage = sustainabilityPerformanceTargetRateStorage();
        sptStorage.baseRate = _newInterestRate.baseRate;
        sptStorage.startPeriod = _newInterestRate.startPeriod;
        sptStorage.startRate = _newInterestRate.startRate;
        sptStorage.rateDecimals = _newInterestRate.rateDecimals;
    }

    /**
     * @notice Stores the impact data for a specific project in the sustainability
     *         performance target rate model.
     * @param _newImpactData The ImpactData structure for the project.
     * @param _project The address of the project to associate the data with.
     */
    function setSPTImpactData(
        ISustainabilityPerformanceTargetRateTypes.ImpactData calldata _newImpactData,
        address _project
    ) internal {
        ISustainabilityPerformanceTargetRateTypes.ImpactData
            storage impactData = sustainabilityPerformanceTargetRateStorage().impactDataByProject[_project];
        impactData.baseLine = _newImpactData.baseLine;
        impactData.baseLineMode = _newImpactData.baseLineMode;
        impactData.deltaRate = _newImpactData.deltaRate;
        impactData.impactDataMode = _newImpactData.impactDataMode;
    }

    /**
     * @notice Returns the currently stored SPT interest rate configuration.
     * @return interestRate_ An InterestRate memory struct containing the SPT parameters.
     */
    function getSPTInterestRate()
        internal
        view
        returns (ISustainabilityPerformanceTargetRateTypes.InterestRate memory interestRate_)
    {
        SustainabilityPerformanceTargetRateDataStorage
            storage sptStorage = sustainabilityPerformanceTargetRateStorage();
        interestRate_ = ISustainabilityPerformanceTargetRateTypes.InterestRate({
            baseRate: sptStorage.baseRate,
            startPeriod: sptStorage.startPeriod,
            startRate: sptStorage.startRate,
            rateDecimals: sptStorage.rateDecimals
        });
    }

    /**
     * @notice Retrieves the impact data for a given project from the SPT storage.
     * @param _project The project address to query.
     * @return impactData_ The ImpactData memory struct for the project.
     */
    function getSPTImpactDataFor(
        address _project
    ) internal view returns (ISustainabilityPerformanceTargetRateTypes.ImpactData memory impactData_) {
        return sustainabilityPerformanceTargetRateStorage().impactDataByProject[_project];
    }

    /**
     * @notice Checks whether the sustainability performance target rate model has been initialised.
     * @return True if the SPT model is initialised, false otherwise.
     */
    function isSustainabilityPerformanceTargetRateInitialized() internal view returns (bool) {
        return sustainabilityPerformanceTargetRateStorage().initialized;
    }

    /**
     * @notice Checks whether the fixed rate data has been initialised.
     * @return True if fixed rate data is initialised, false otherwise.
     */
    function isFixedRateInitialized() internal view returns (bool) {
        return fixedRateStorage().initialized;
    }

    /**
     * @notice Checks whether the KPI-linked rate data has been initialised.
     * @return True if KPI-linked rate data is initialised, false otherwise.
     */
    function isKpiLinkedRateInitialized() internal view returns (bool) {
        return kpiLinkedRateStorage().initialized;
    }

    /**
     * @notice Returns the stored fixed interest rate and its decimal count.
     * @return rate_ The fixed rate value.
     * @return decimals_ The number of decimals for the rate.
     */
    function getRate() internal view returns (uint256 rate_, uint8 decimals_) {
        rate_ = fixedRateStorage().rate;
        decimals_ = fixedRateStorage().decimals;
    }

    /**
     * @notice Returns the full KPI-linked interest rate configuration from storage.
     * @return interestRate_ An InterestRate memory struct with all KPI rate parameters.
     */
    function getInterestRate() internal view returns (IKpiLinkedRateErrors.InterestRate memory interestRate_) {
        KpiLinkedRateDataStorage storage kpiRateStorage = kpiLinkedRateStorage();
        interestRate_ = IKpiLinkedRateErrors.InterestRate({
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

    /**
     * @notice Returns the KPI-linked impact data configuration from storage.
     * @return impactData_ An ImpactData memory struct with deviation bounds and precision.
     */
    function getImpactData() internal view returns (IKpiLinkedRateErrors.ImpactData memory impactData_) {
        KpiLinkedRateDataStorage storage kpiRateStorage = kpiLinkedRateStorage();
        impactData_ = IKpiLinkedRateErrors.ImpactData({
            maxDeviationCap: kpiRateStorage.maxDeviationCap,
            baseLine: kpiRateStorage.baseLine,
            maxDeviationFloor: kpiRateStorage.maxDeviationFloor,
            impactDataDecimals: kpiRateStorage.impactDataDecimals,
            adjustmentPrecision: kpiRateStorage.adjustmentPrecision
        });
    }

    /**
     * @notice Validates that the given KPI-linked interest rate values are ordered
     *         correctly (minRate ≤ baseRate ≤ maxRate).
     * @dev Reverts with WrongInterestRateValues if the invariant is violated.
     * @param _newInterestRate The InterestRate struct to validate.
     * @custom:revert IKpiLinkedRateErrors.WrongInterestRateValues If ordering is invalid.
     */
    function requireValidInterestRate(IKpiLinkedRateErrors.InterestRate calldata _newInterestRate) internal pure {
        if (
            _newInterestRate.minRate > _newInterestRate.baseRate || _newInterestRate.baseRate > _newInterestRate.maxRate
        ) {
            revert IKpiLinkedRateErrors.WrongInterestRateValues(_newInterestRate);
        }
    }

    /**
     * @notice Validates that the given KPI-linked impact data values are ordered
     *         correctly (maxDeviationFloor ≤ baseLine ≤ maxDeviationCap).
     * @dev Reverts with WrongImpactDataValues if the invariant is violated.
     * @param _newImpactData The ImpactData struct to validate.
     * @custom:revert IKpiLinkedRateErrors.WrongImpactDataValues If ordering is invalid.
     */
    function requireValidImpactData(IKpiLinkedRateErrors.ImpactData calldata _newImpactData) internal pure {
        if (
            _newImpactData.maxDeviationFloor > _newImpactData.baseLine ||
            _newImpactData.baseLine > _newImpactData.maxDeviationCap
        ) {
            revert IKpiLinkedRateErrors.WrongImpactDataValues(_newImpactData);
        }
    }

    /**
     * @notice Requires two array lengths to be equal.
     * @dev Reverts with ProvidedListsLengthMismatch if lengths differ.
     * @param len1 Length of the first list.
     * @param len2 Length of the second list.
     * @custom:revert ISustainabilityPerformanceTargetRateTypes.ProvidedListsLengthMismatch If len1 != len2.
     */
    function requireEqualLength(uint256 len1, uint256 len2) internal pure {
        if (len1 != len2) {
            revert ISustainabilityPerformanceTargetRateTypes.ProvidedListsLengthMismatch(len1, len2);
        }
    }

    /**
     * @notice Returns the storage pointer for the fixed rate data at a deterministic slot.
     * @dev Uses inline assembly to load the slot from a precomputed constant value.
     * @return fixedRateDataStorage_ Storage pointer to FixedRateDataStorage.
     */
    function fixedRateStorage() internal pure returns (FixedRateDataStorage storage fixedRateDataStorage_) {
        bytes32 position = _FIXED_RATE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            fixedRateDataStorage_.slot := position
        }
    }

    /**
     * @notice Returns the storage pointer for the KPI-linked rate data at a deterministic slot.
     * @dev Uses inline assembly to load the slot from a precomputed constant value.
     * @return kpiLinkedRateDataStorage_ Storage pointer to KpiLinkedRateDataStorage.
     */
    function kpiLinkedRateStorage() internal pure returns (KpiLinkedRateDataStorage storage kpiLinkedRateDataStorage_) {
        bytes32 position = _KPI_LINKED_RATE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kpiLinkedRateDataStorage_.slot := position
        }
    }

    /**
     * @notice Returns the storage pointer for the sustainability performance target
     *         rate data at a deterministic slot.
     * @dev Uses inline assembly to load the slot from a precomputed constant value.
     * @return sustainabilityPerformanceTargetRateDataStorage_ Storage pointer to
     *         SustainabilityPerformanceTargetRateDataStorage.
     */
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
