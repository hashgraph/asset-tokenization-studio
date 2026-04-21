// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _FIXED_RATE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _KPI_LINKED_RATE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IKpiLinkedRateTypes } from "../../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRateTypes.sol";
/* solhint-disable max-line-length */
import {
    ISustainabilityPerformanceTargetRateTypes
} from "../../facets/layer_2/interestRate/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRateTypes.sol";
import { IFixedRate } from "../../facets/layer_2/interestRate/fixedRate/IFixedRate.sol";
/* solhint-enable max-line-length */

/**
 * @notice Diamond Storage struct for the fixed interest rate module.
 * @dev    Stored at `_FIXED_RATE_STORAGE_POSITION`. `initialized` guards against
 *         uninitialised reads and prevents re-initialisation when enforced by the
 *         calling facet.
 * @param rate         Stored fixed interest rate value.
 * @param decimals     Decimal precision of the stored rate.
 * @param initialized  True once `initializeFixedRate` has been called.
 */
struct FixedRateDataStorage {
    uint256 rate;
    uint8 decimals;
    bool initialized;
}

/**
 * @notice Diamond Storage struct for the KPI-linked interest rate module.
 * @dev    Stored at `_KPI_LINKED_RATE_STORAGE_POSITION`. All rate fields and impact
 *         data fields are stored flat in a single struct to minimise storage slot
 *         usage. `initialized` guards against uninitialised reads.
 *         The rate invariant `minRate <= baseRate <= maxRate` must be maintained by
 *         callers; use `requireValidInterestRate` before writing.
 *         The impact data invariant `maxDeviationFloor <= baseLine <= maxDeviationCap`
 *         must similarly be maintained; use `requireValidImpactData` before writing.
 * @param maxRate              Maximum achievable interest rate.
 * @param baseRate             Target interest rate under baseline performance.
 * @param minRate              Minimum achievable interest rate.
 * @param startPeriod          Unix timestamp marking the start of the first rate
 *                             calculation period.
 * @param startRate            Initial rate applied before the first reporting period
 *                             completes.
 * @param missedPenalty        Rate penalty applied when a KPI reporting period is
 *                             missed.
 * @param reportPeriod         Duration in seconds of each KPI reporting period.
 * @param rateDecimals         Decimal precision for all rate fields in this struct.
 * @param maxDeviationCap      Upper bound for KPI impact deviation; maps to maximum
 *                             rate adjustment upward.
 * @param baseLine             Baseline KPI value representing neutral performance.
 * @param maxDeviationFloor    Lower bound for KPI impact deviation; maps to maximum
 *                             rate adjustment downward.
 * @param adjustmentPrecision  Precision factor used when computing the rate adjustment
 *                             from KPI deviation.
 * @param impactDataDecimals   Decimal precision for all impact data fields.
 * @param initialized          True once `initializeKpiLinkedRate` has been called.
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
 * @notice Diamond Storage struct for the Sustainability Performance Target (SPT) rate
 *         module.
 * @dev    Stored at `_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_STORAGE_POSITION`.
 *         `impactDataByProject` maps each registered project address to its individual
 *         impact data configuration. Projects must be valid proceed recipients, as
 *         enforced during initialisation by a caller-supplied validation function.
 *         `initialized` guards against uninitialised reads.
 * @param baseRate            Base interest rate used as the adjustment reference.
 * @param startPeriod         Unix timestamp marking the start of the first SPT
 *                            calculation period.
 * @param startRate           Initial rate applied before the first SPT period completes.
 * @param rateDecimals        Decimal precision for all rate fields in this struct.
 * @param impactDataByProject Maps a project address to its sustainability impact data
 *                            configuration.
 * @param initialized         True once `initialize_SustainabilityPerformanceTargetRate`
 *                            has been called.
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
 * @title  InterestRateStorageWrapper
 * @notice Internal library providing storage operations for three distinct interest
 *         rate mechanisms: fixed rate, KPI-linked rate, and Sustainability Performance
 *         Target (SPT) rate.
 * @dev    Anchors three independent Diamond Storage structs at deterministic slots
 *         following the ERC-2535 Diamond Storage Pattern:
 *           - `FixedRateDataStorage`   at `_FIXED_RATE_STORAGE_POSITION`
 *           - `KpiLinkedRateDataStorage` at `_KPI_LINKED_RATE_STORAGE_POSITION`
 *           - `SustainabilityPerformanceTargetRateDataStorage` at
 *             `_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_STORAGE_POSITION`
 *
 *         All functions are `internal` and intended exclusively for use within facets
 *         or other internal libraries of the same diamond. The three rate modules are
 *         entirely independent; a diamond may deploy any subset of them.
 *
 *         Key invariants enforced at the pure validation layer:
 *           - KPI rate: `minRate <= baseRate <= maxRate`
 *           - KPI impact data: `maxDeviationFloor <= baseLine <= maxDeviationCap`
 *         SPT project registration requires caller-supplied proceed-recipient
 *         validation via a function pointer to avoid coupling this library to a
 *         specific proceed-recipient storage implementation.
 * @author Hashgraph
 */
library InterestRateStorageWrapper {
    /**
     * @notice Initialises the fixed rate module by writing the rate configuration and
     *         marking the storage as initialised.
     * @dev    Delegates the rate write to `setRate`. Calling this more than once
     *         overwrites the rate and re-sets `initialized`; callers must enforce
     *         single-initialisation via the `onlyNotFixedRateInitialized` modifier or
     *         equivalent.
     * @param _initData  Calldata struct containing the initial rate value and decimal
     *                   precision.
     */
    function initializeFixedRate(IFixedRate.FixedRateData calldata _initData) internal {
        setRate(_initData.rate, _initData.rateDecimals);
        fixedRateStorage().initialized = true;
    }

    /**
     * @notice Initialises the KPI-linked rate module by writing the interest rate and
     *         impact data configuration, then marking the storage as initialised.
     * @dev    Delegates writes to `setInterestRate` and `setImpactData`. Callers must
     *         validate `_interestRate` via `requireValidInterestRate` and `_impactData`
     *         via `requireValidImpactData` before calling to maintain the rate and
     *         impact invariants. Calling this more than once silently overwrites all
     *         stored values.
     * @param _interestRate  KPI interest rate configuration (rates and period
     *                       parameters).
     * @param _impactData    KPI impact data configuration (deviation bounds and
     *                       precision).
     */
    function initializeKpiLinkedRate(
        IKpiLinkedRateTypes.InterestRate calldata _interestRate,
        IKpiLinkedRateTypes.ImpactData calldata _impactData
    ) internal {
        setInterestRate(_interestRate);
        setImpactData(_impactData);
        kpiLinkedRateStorage().initialized = true;
    }

    /**
     * @notice Writes a new fixed rate value and decimal precision to storage.
     * @dev    Overwrites the existing `rate` and `decimals` fields without any
     *         validation. Callers at the facet level are responsible for access control
     *         and emitting relevant events. Does not update `initialized`.
     * @param _newRate          New interest rate value to store.
     * @param _newRateDecimals  Decimal precision of `_newRate`.
     */
    function setRate(uint256 _newRate, uint8 _newRateDecimals) internal {
        FixedRateDataStorage storage frs = fixedRateStorage();
        frs.rate = _newRate;
        frs.decimals = _newRateDecimals;
    }

    /**
     * @notice Writes all KPI interest rate fields to storage.
     * @dev    Overwrites all rate fields in a single storage pointer pass. Does not
     *         validate the rate ordering invariant (`minRate <= baseRate <= maxRate`);
     *         callers must invoke `requireValidInterestRate` before calling. Does not
     *         update `initialized`.
     * @param _newInterestRate  Calldata struct containing all KPI rate parameters.
     */
    function setInterestRate(IKpiLinkedRateTypes.InterestRate calldata _newInterestRate) internal {
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
     * @notice Writes all KPI impact data fields to storage.
     * @dev    Overwrites all impact data fields in a single storage pointer pass. Does
     *         not validate the deviation invariant
     *         (`maxDeviationFloor <= baseLine <= maxDeviationCap`); callers must invoke
     *         `requireValidImpactData` before calling. Does not update `initialized`.
     * @param _newImpactData  Calldata struct containing all KPI impact data parameters.
     */
    function setImpactData(IKpiLinkedRateTypes.ImpactData calldata _newImpactData) internal {
        KpiLinkedRateDataStorage storage kpiRateStorage = kpiLinkedRateStorage();
        kpiRateStorage.maxDeviationCap = _newImpactData.maxDeviationCap;
        kpiRateStorage.baseLine = _newImpactData.baseLine;
        kpiRateStorage.maxDeviationFloor = _newImpactData.maxDeviationFloor;
        kpiRateStorage.impactDataDecimals = _newImpactData.impactDataDecimals;
        kpiRateStorage.adjustmentPrecision = _newImpactData.adjustmentPrecision;
    }

    /**
     * @notice Initialises the SPT rate module by writing the interest rate
     *         configuration and registering per-project impact data.
     * @dev    Writes the SPT interest rate via `setSPTInterestRate`, then iterates over
     *         `_impactData` and `_projects` in parallel, validating each project against
     *         `_isProceedRecipient` before writing via `setSPTImpactData`. Reverts with
     *         `ISustainabilityPerformanceTargetRateTypes.NotExistingProject` if any
     *         project address is not a registered proceed recipient.
     *         `_impactData` and `_projects` must have equal lengths; callers must verify
     *         this with `requireEqualLength` before calling. Uses `unchecked` loop
     *         increments; gas cost scales linearly with the number of projects.
     *         Calling this more than once silently overwrites all stored values.
     * @param _interestRate        SPT interest rate configuration.
     * @param _impactData          Array of per-project impact data configurations;
     *                             must have the same length as `_projects`.
     * @param _projects            Array of project addresses to register impact data for;
     *                             each must be a valid proceed recipient.
     * @param _isProceedRecipient  View function used to validate each project address
     *                             as a registered proceed recipient.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_SustainabilityPerformanceTargetRate(
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
     * @notice Writes all SPT interest rate fields to storage.
     * @dev    Overwrites all four rate fields in a single storage pointer pass. Does
     *         not update `initialized`. Callers are responsible for access control.
     * @param _newInterestRate  Calldata struct containing the SPT base rate, start
     *                          period, start rate, and decimal precision.
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
     * @notice Writes the SPT impact data configuration for a specific project address.
     * @dev    Overwrites all four impact data fields for `_project` via a direct
     *         storage pointer. Callers must ensure `_project` is a valid registered
     *         proceed recipient before calling; this function does not re-validate.
     * @param _newImpactData  Calldata struct containing the project's impact data
     *                        parameters.
     * @param _project        Project address whose impact data is to be written.
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
     * @notice Returns the stored SPT interest rate configuration as a memory struct.
     * @dev    Assembles the return struct from individual storage fields. Returns
     *         zero-value defaults if the SPT module has not been initialised.
     * @return interestRate_  SPT interest rate struct containing base rate, start
     *                        period, start rate, and decimal precision.
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
     * @notice Returns the stored SPT impact data for a specific project.
     * @dev    Returns a zero-value struct if no impact data has been registered for
     *         `_project`. Callers should verify project registration before relying on
     *         the returned values.
     * @param _project  Project address whose impact data is to be retrieved.
     * @return impactData_  Impact data struct for `_project`; zero-value if absent.
     */
    function getSPTImpactDataFor(
        address _project
    ) internal view returns (ISustainabilityPerformanceTargetRateTypes.ImpactData memory impactData_) {
        return sustainabilityPerformanceTargetRateStorage().impactDataByProject[_project];
    }

    /**
     * @notice Returns whether the SPT rate module has been initialised.
     * @dev    Returns `false` until `initialize_SustainabilityPerformanceTargetRate`
     *         has been called.
     * @return True if the SPT module is initialised; false otherwise.
     */
    function isSustainabilityPerformanceTargetRateInitialized() internal view returns (bool) {
        return sustainabilityPerformanceTargetRateStorage().initialized;
    }

    /**
     * @notice Returns whether the fixed rate module has been initialised.
     * @dev    Returns `false` until `initializeFixedRate` has been called.
     * @return True if the fixed rate module is initialised; false otherwise.
     */
    function isFixedRateInitialized() internal view returns (bool) {
        return fixedRateStorage().initialized;
    }

    /**
     * @notice Returns whether the KPI-linked rate module has been initialised.
     * @dev    Returns `false` until `initializeKpiLinkedRate` has been called.
     * @return True if the KPI-linked rate module is initialised; false otherwise.
     */
    function isKpiLinkedRateInitialized() internal view returns (bool) {
        return kpiLinkedRateStorage().initialized;
    }

    /**
     * @notice Returns the stored fixed interest rate and its decimal precision.
     * @dev    Returns zero values if the fixed rate module has not been initialised.
     * @return rate_      Current fixed interest rate value.
     * @return decimals_  Decimal precision of the returned rate.
     */
    function getRate() internal view returns (uint256 rate_, uint8 decimals_) {
        rate_ = fixedRateStorage().rate;
        decimals_ = fixedRateStorage().decimals;
    }

    /**
     * @notice Returns the stored KPI interest rate configuration as a memory struct.
     * @dev    Assembles the return struct from individual storage fields. Returns
     *         zero-value defaults if the KPI module has not been initialised.
     * @return interestRate_  KPI interest rate struct containing all rate and period
     *                        parameters.
     */
    function getInterestRate() internal view returns (IKpiLinkedRateTypes.InterestRate memory interestRate_) {
        KpiLinkedRateDataStorage storage kpiRateStorage = kpiLinkedRateStorage();
        interestRate_ = IKpiLinkedRateTypes.InterestRate({
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
     * @notice Returns the stored KPI impact data configuration as a memory struct.
     * @dev    Assembles the return struct from individual storage fields. Returns
     *         zero-value defaults if the KPI module has not been initialised.
     * @return impactData_  KPI impact data struct containing deviation bounds and
     *                      precision parameters.
     */
    function getImpactData() internal view returns (IKpiLinkedRateTypes.ImpactData memory impactData_) {
        KpiLinkedRateDataStorage storage kpiRateStorage = kpiLinkedRateStorage();
        impactData_ = IKpiLinkedRateTypes.ImpactData({
            maxDeviationCap: kpiRateStorage.maxDeviationCap,
            baseLine: kpiRateStorage.baseLine,
            maxDeviationFloor: kpiRateStorage.maxDeviationFloor,
            impactDataDecimals: kpiRateStorage.impactDataDecimals,
            adjustmentPrecision: kpiRateStorage.adjustmentPrecision
        });
    }

    /**
     * @notice Reverts if the KPI interest rate does not satisfy the ordering invariant
     *         `minRate <= baseRate <= maxRate`.
     * @dev    Pure validation; performs no storage reads or writes. Must be called
     *         before any invocation of `setInterestRate` or `initializeKpiLinkedRate`
     *         to prevent storing an inconsistent rate configuration.
     *         Reverts with `IKpiLinkedRateTypes.WrongInterestRateValues` on failure.
     * @param _newInterestRate  Calldata struct containing the rate values to validate.
     */
    function requireValidInterestRate(IKpiLinkedRateTypes.InterestRate calldata _newInterestRate) internal pure {
        if (
            _newInterestRate.minRate > _newInterestRate.baseRate || _newInterestRate.baseRate > _newInterestRate.maxRate
        ) {
            revert IKpiLinkedRateTypes.WrongInterestRateValues(_newInterestRate);
        }
    }

    /**
     * @notice Reverts if the KPI impact data does not satisfy the ordering invariant
     *         `maxDeviationFloor <= baseLine <= maxDeviationCap`.
     * @dev    Pure validation; performs no storage reads or writes. Must be called
     *         before any invocation of `setImpactData` or `initializeKpiLinkedRate`
     *         to prevent storing an inconsistent impact data configuration.
     *         Reverts with `IKpiLinkedRateTypes.WrongImpactDataValues` on failure.
     * @param _newImpactData  Calldata struct containing the impact data values to
     *                        validate.
     */
    function requireValidImpactData(IKpiLinkedRateTypes.ImpactData calldata _newImpactData) internal pure {
        if (
            _newImpactData.maxDeviationFloor > _newImpactData.baseLine ||
            _newImpactData.baseLine > _newImpactData.maxDeviationCap
        ) {
            revert IKpiLinkedRateTypes.WrongImpactDataValues(_newImpactData);
        }
    }

    /**
     * @notice Reverts if the two provided lengths are not equal.
     * @dev    Pure validation; intended for use before parallel array operations,
     *         particularly before iterating over `_impactData` and `_projects` in
     *         `initialize_SustainabilityPerformanceTargetRate`. Reverts with
     *         `ISustainabilityPerformanceTargetRateTypes.ProvidedListsLengthMismatch`.
     * @param len1  Length of the first array.
     * @param len2  Length of the second array.
     */
    function requireEqualLength(uint256 len1, uint256 len2) internal pure {
        if (len1 != len2) {
            revert ISustainabilityPerformanceTargetRateTypes.ProvidedListsLengthMismatch(len1, len2);
        }
    }

    /**
     * @notice Returns the Diamond Storage pointer for `FixedRateDataStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_FIXED_RATE_STORAGE_POSITION`, following the ERC-2535 Diamond
     *         Storage Pattern. Must only be called from within this library.
     * @return fixedRateDataStorage_  Storage pointer to `FixedRateDataStorage`.
     */
    function fixedRateStorage() private pure returns (FixedRateDataStorage storage fixedRateDataStorage_) {
        bytes32 position = _FIXED_RATE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            fixedRateDataStorage_.slot := position
        }
    }

    /**
     * @notice Returns the Diamond Storage pointer for `KpiLinkedRateDataStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_KPI_LINKED_RATE_STORAGE_POSITION`, following the ERC-2535
     *         Diamond Storage Pattern. Must only be called from within this library.
     * @return kpiLinkedRateDataStorage_  Storage pointer to `KpiLinkedRateDataStorage`.
     */
    function kpiLinkedRateStorage() private pure returns (KpiLinkedRateDataStorage storage kpiLinkedRateDataStorage_) {
        bytes32 position = _KPI_LINKED_RATE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kpiLinkedRateDataStorage_.slot := position
        }
    }

    /**
     * @notice Returns the Diamond Storage pointer for
     *         `SustainabilityPerformanceTargetRateDataStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_STORAGE_POSITION`,
     *         following the ERC-2535 Diamond Storage Pattern. Must only be called from
     *         within this library.
     * @return sustainabilityPerformanceTargetRateDataStorage_  Storage pointer to
     *         `SustainabilityPerformanceTargetRateDataStorage`.
     */
    function sustainabilityPerformanceTargetRateStorage()
        private
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
