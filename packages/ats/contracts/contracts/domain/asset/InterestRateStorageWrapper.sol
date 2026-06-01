// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRate } from "../../facets/kpiLinkedRate/IKpiLinkedRate.sol";
import { IInterestRate } from "../../facets/interestRate/IInterestRate.sol";

/// @custom:hash storage InterestRateType
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_INTEREST_RATE_TYPE = 0xb307072990b6f669214acc1dea3ecf3325e96dd0c0bfc7f3707eee45be6a8a00;

/// @custom:hash storage KpiLinkedRate
bytes32 constant STORAGE_LOCATION_KPI_LINKED_RATE = 0xfd654781c90de8f4a5cbc1548092929b04718c1777cd90dc2720e57e9f459000;

/// @custom:hash storage FixedRate
bytes32 constant STORAGE_LOCATION_FIXED_RATE = 0x577d3b71f198de7595699f8f28612988ade0252ef23d62ee04fdaa63df28d200;

/**
 * @title FixedRateDataStorage
 * @notice Struct holding the fixed interest rate value and its decimal precision.
 * @dev Backing storage for the fixed-rate coupon model; mutated only by
 *      `InterestRateStorageWrapper` via the deterministic ERC-7201 slot.
 * @param decimals Number of decimal places for the rate.
 * @param rate The fixed interest rate value.
 * @custom:storage-location erc7201:security.token.standard.storage.FixedRate
 */
struct FixedRateDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    uint8 decimals;
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    uint256 rate;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title KpiLinkedRateDataStorage
 * @notice Stores parameters for a KPI-linked interest rate model, including rate
 *         boundaries, reporting constraints, and impact data bounds.
 * @dev Backing storage for the KPI-linked coupon model; mutated only by
 *      `InterestRateStorageWrapper`. Rate ordering (`minRate ≤ baseRate ≤ maxRate`)
 *      and impact bound strict-ordering invariants are enforced at write time.
 * @param rateDecimals Number of decimals for rate values.
 * @param impactDataDecimals Number of decimals for impact data fields.
 * @param maxRate Upper bound for the KPI-linked rate.
 * @param baseRate Base rate from which adjustments are applied.
 * @param minRate Lower bound for the KPI-linked rate.
 * @param startPeriod Unix timestamp marking the start of the rate calculation period.
 * @param startRate Initial rate applicable at startPeriod.
 * @param missedPenalty Penalty rate applied when a report is missed.
 * @param reportPeriod Duration in seconds between successive reports.
 * @param maxDeviationCap Upper deviation cap for impact data.
 * @param baseLine Baseline value for impact deviation calculations.
 * @param maxDeviationFloor Lower deviation floor for impact data.
 * @param adjustmentPrecision Precision factor for the adjustment computation.
 * @custom:storage-location erc7201:security.token.standard.storage.KpiLinkedRate
 */
struct KpiLinkedRateDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    uint8 rateDecimals;
    uint8 impactDataDecimals;
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    uint256 maxRate;
    uint256 baseRate;
    uint256 minRate;
    uint256 startPeriod;
    uint256 startRate;
    uint256 missedPenalty;
    uint256 reportPeriod;
    uint256 maxDeviationCap;
    uint256 baseLine;
    uint256 maxDeviationFloor;
    uint256 adjustmentPrecision;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title InterestRateTypeDataStorage
 * @notice Stores the selected coupon rate type discriminator.
 * @dev Decoupled from the rate-specific storages so the active model can be queried
 *      without touching the fixed-rate or KPI-linked storage slots.
 * @param rateType The `IInterestRate.RateType` discriminator selected by the admin.
 * @custom:storage-location erc7201:security.token.standard.storage.InterestRateType
 */
struct InterestRateTypeDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    IInterestRate.RateType rateType;
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title InterestRateStorageWrapper
 * @notice Library providing setters, getters, validation, and storage access for
 *         two interest rate models (fixed rate and KPI-linked) using deterministic storage slots.
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

    /**
     * @notice Stores the impact data configuration for the KPI-linked model.
     * @dev Copies deviation bounds and precision from the calldata ImpactData struct.
     * @param _newImpactData The ImpactData structure containing deviation and precision parameters.
     */
    function setImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) internal {
        KpiLinkedRateDataStorage storage kpiRateStorage = kpiLinkedRateStorage();
        kpiRateStorage.maxDeviationCap = _newImpactData.maxDeviationCap;
        kpiRateStorage.baseLine = _newImpactData.baseLine;
        kpiRateStorage.maxDeviationFloor = _newImpactData.maxDeviationFloor;
        kpiRateStorage.impactDataDecimals = _newImpactData.impactDataDecimals;
        kpiRateStorage.adjustmentPrecision = _newImpactData.adjustmentPrecision;
    }

    /**
     * @notice Writes the coupon rate type during one-time initialisation.
     * @dev Called only once during asset deployment. Reverts via the caller's modifier
     *      if already initialised.
     * @param _rateType The `IInterestRate.RateType` to persist.
     */
    function initializeCouponRateType(IInterestRate.RateType _rateType) internal {
        interestRateTypeStorage().rateType = _rateType;
    }

    /**
     * @notice Updates the coupon rate type after initialisation.
     * @dev Used by the post-init admin setter; does not touch the `initialized` flag.
     * @param _rateType The `IInterestRate.RateType` to persist.
     */
    function setCouponRateType(IInterestRate.RateType _rateType) internal {
        interestRateTypeStorage().rateType = _rateType;
    }

    /**
     * @notice Returns the stored coupon rate type.
     * @return rateType_ The `IInterestRate.RateType` value; defaults to `NONE` (0) if never set.
     */
    function getCouponRateType() internal view returns (IInterestRate.RateType rateType_) {
        return interestRateTypeStorage().rateType;
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

    /**
     * @notice Returns the KPI-linked impact data configuration from storage.
     * @return impactData_ An ImpactData memory struct with deviation bounds and precision.
     */
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

    /**
     * @notice Reverts when `NONE` is supplied as the rate type.
     * @dev `NONE` is the zero-value default reserved for uninitialised assets; it must never
     *      be set explicitly.
     * @param _rateType The rate type to validate.
     * @custom:revert IInterestRate.InvalidRateType If `_rateType` is `NONE`.
     */
    function checkValidRateType(IInterestRate.RateType _rateType) internal pure {
        if (_rateType == IInterestRate.RateType.NONE) revert IInterestRate.InvalidRateType(_rateType);
    }

    /**
     * @notice Validates that the given KPI-linked interest rate values are ordered
     *         correctly (minRate ≤ baseRate ≤ maxRate).
     * @dev Reverts with WrongInterestRateValues if the invariant is violated.
     * @param _newInterestRate The InterestRate struct to validate.
     * @custom:revert IKpiLinkedRate.WrongInterestRateValues If ordering is invalid.
     */
    function requireValidInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) internal pure {
        if (
            _newInterestRate.minRate > _newInterestRate.baseRate || _newInterestRate.baseRate > _newInterestRate.maxRate
        ) {
            revert IKpiLinkedRate.WrongInterestRateValues(_newInterestRate);
        }
    }

    /**
     * @notice Validates that the given KPI-linked impact data values are strictly ordered
     *         (maxDeviationFloor < baseLine < maxDeviationCap).
     * @dev Equality is rejected because a zero denominator in the rate calculation would result
     *      when baseLine == maxDeviationFloor or baseLine == maxDeviationCap, causing a permanent
     *      revert that propagates through the scheduled-task queue and freezes all token operations.
     * @param _newImpactData The ImpactData struct to validate.
     * @custom:revert IKpiLinkedRate.WrongImpactDataValues If ordering is invalid.
     */
    function requireValidImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) internal pure {
        if (
            !(_newImpactData.maxDeviationFloor < _newImpactData.baseLine &&
                _newImpactData.baseLine < _newImpactData.maxDeviationCap)
        ) {
            revert IKpiLinkedRate.WrongImpactDataValues(_newImpactData);
        }
    }

    /**
     * @notice Returns the storage pointer for the fixed rate data at a deterministic slot.
     * @dev Uses inline assembly to load the slot from a precomputed constant value.
     * @return fixedRateDataStorage_ Storage pointer to FixedRateDataStorage.
     */
    function fixedRateStorage() internal pure returns (FixedRateDataStorage storage fixedRateDataStorage_) {
        bytes32 position = STORAGE_LOCATION_FIXED_RATE;
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
        bytes32 position = STORAGE_LOCATION_KPI_LINKED_RATE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kpiLinkedRateDataStorage_.slot := position
        }
    }

    /**
     * @notice Returns the storage pointer for the interest-rate-type data at a deterministic slot.
     * @dev Uses inline assembly to load the slot from a precomputed constant value.
     * @return data_ Storage pointer to InterestRateTypeDataStorage.
     */
    function interestRateTypeStorage() private pure returns (InterestRateTypeDataStorage storage data_) {
        bytes32 position = STORAGE_LOCATION_INTEREST_RATE_TYPE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            data_.slot := position
        }
    }
}
