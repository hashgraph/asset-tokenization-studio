// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    FixedRateDataStorage,
    KpiLinkedRateDataStorage,
    SustainabilityPerformanceTargetRateDataStorage
} from "../../storage/ScheduledStorage.sol";
import {
    fixedRateStorage,
    kpiLinkedRateStorage,
    sustainabilityPerformanceTargetRateStorage
} from "../../storage/ScheduledStorage.sol";
// solhint-disable max-line-length
import {
    ISustainabilityPerformanceTargetRate
} from "../../facets/assetCapabilities/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
// solhint-enable max-line-length
import {
    IKpiLinkedRate
} from "../../facets/assetCapabilities/interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol";
/// @title LibInterestRate
/// @notice Centralized library for interest rate storage management across fixed, KPI-linked,
///         and sustainability performance target rate variants
/// @dev Extracts rate calculation logic and storage accessors from 3 StorageWrapper implementations
library LibInterestRate {
    // ═══════════════════════════════════════════════════════════════════════════════
    // FIXED RATE — Simple fixed interest rate initialization and retrieval
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Initialize fixed interest rate
    /// @param _rate The fixed interest rate value
    /// @param _decimals The number of decimal places for the rate
    function initializeFixedRate(uint256 _rate, uint8 _decimals) internal {
        FixedRateDataStorage storage rateStorage = fixedRateStorage();
        rateStorage.rate = _rate;
        rateStorage.decimals = _decimals;
        rateStorage.initialized = true;
    }

    /// @notice Set the fixed interest rate (without changing initialized state)
    /// @param _rate The new fixed interest rate value
    /// @param _decimals The number of decimal places for the rate
    function setFixedRate(uint256 _rate, uint8 _decimals) internal {
        FixedRateDataStorage storage rateStorage = fixedRateStorage();
        rateStorage.rate = _rate;
        rateStorage.decimals = _decimals;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // KPI LINKED RATE — Dynamic rate based on KPI impact data and deviations
    // Non-view functions first, then view functions
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Initialize KPI-linked interest rate with all configuration parameters
    /// @param _maxRate Maximum interest rate cap
    /// @param _baseRate Base interest rate (starting point)
    /// @param _minRate Minimum interest rate floor
    /// @param _startPeriod Timestamp of rate start period
    /// @param _startRate Rate to use before start period
    /// @param _missedPenalty Penalty rate applied when no KPI report found
    /// @param _reportPeriod Period duration for KPI report collection
    /// @param _rateDecimals Decimal places for rate values
    /// @param _maxDeviationCap Maximum positive deviation from baseline
    /// @param _baseLine Baseline impact data value
    /// @param _maxDeviationFloor Maximum negative deviation from baseline
    /// @param _adjustmentPrecision Precision for rate adjustment calculations
    /// @param _impactDataDecimals Decimal places for impact data values
    function initializeKpiLinkedRate(
        uint256 _maxRate,
        uint256 _baseRate,
        uint256 _minRate,
        uint256 _startPeriod,
        uint256 _startRate,
        uint256 _missedPenalty,
        uint256 _reportPeriod,
        uint8 _rateDecimals,
        uint256 _maxDeviationCap,
        uint256 _baseLine,
        uint256 _maxDeviationFloor,
        uint256 _adjustmentPrecision,
        uint8 _impactDataDecimals
    ) internal {
        KpiLinkedRateDataStorage storage rateStorage = kpiLinkedRateStorage();
        rateStorage.maxRate = _maxRate;
        rateStorage.baseRate = _baseRate;
        rateStorage.minRate = _minRate;
        rateStorage.startPeriod = _startPeriod;
        rateStorage.startRate = _startRate;
        rateStorage.missedPenalty = _missedPenalty;
        rateStorage.reportPeriod = _reportPeriod;
        rateStorage.rateDecimals = _rateDecimals;
        rateStorage.maxDeviationCap = _maxDeviationCap;
        rateStorage.baseLine = _baseLine;
        rateStorage.maxDeviationFloor = _maxDeviationFloor;
        rateStorage.adjustmentPrecision = _adjustmentPrecision;
        rateStorage.impactDataDecimals = _impactDataDecimals;
        rateStorage.initialized = true;
    }

    /// @notice Set KPI-linked interest rate parameters
    /// @dev Without _callTriggerPendingScheduledCrossOrderedTasks; facet handles that
    /// @param _newInterestRate The new interest rate data
    function setKpiLinkedInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) internal {
        KpiLinkedRateDataStorage storage rateStorage = kpiLinkedRateStorage();
        rateStorage.maxRate = _newInterestRate.maxRate;
        rateStorage.baseRate = _newInterestRate.baseRate;
        rateStorage.minRate = _newInterestRate.minRate;
        rateStorage.startPeriod = _newInterestRate.startPeriod;
        rateStorage.startRate = _newInterestRate.startRate;
        rateStorage.missedPenalty = _newInterestRate.missedPenalty;
        rateStorage.reportPeriod = _newInterestRate.reportPeriod;
        rateStorage.rateDecimals = _newInterestRate.rateDecimals;
    }

    /// @notice Set KPI-linked impact data parameters
    /// @dev Without _callTriggerPendingScheduledCrossOrderedTasks; facet handles that
    /// @param _newImpactData The new impact data
    function setKpiLinkedImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) internal {
        KpiLinkedRateDataStorage storage rateStorage = kpiLinkedRateStorage();
        rateStorage.maxDeviationCap = _newImpactData.maxDeviationCap;
        rateStorage.baseLine = _newImpactData.baseLine;
        rateStorage.maxDeviationFloor = _newImpactData.maxDeviationFloor;
        rateStorage.impactDataDecimals = _newImpactData.impactDataDecimals;
        rateStorage.adjustmentPrecision = _newImpactData.adjustmentPrecision;
    }

    /// @notice Calculate KPI-linked interest rate based on impact data and deviations
    /// @dev Implements complex rate adjustment based on baseline deviation:
    ///      - Below baseline: Rate decreases (min rate floor)
    ///      - Above baseline: Rate increases (max rate cap)
    ///      - No report: Apply missed penalty to previous rate
    /// @param _impactData Aggregated KPI impact data for the period
    /// @param _previousRate Previous coupon rate for missed penalty calculation
    /// @param _previousRateDecimals Decimal places for previous rate
    /// @param _reportFound Whether a KPI report was found for the period
    /// @return rate_ Calculated interest rate
    /// @return rateDecimals_ Decimal places for the calculated rate
    function calculateKpiLinkedRate(
        uint256 _impactData,
        uint256 _previousRate,
        uint8 _previousRateDecimals,
        bool _reportFound
    ) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        KpiLinkedRateDataStorage storage kpiRateStorage = kpiLinkedRateStorage();

        // If no report found, apply penalty to previous rate
        if (!_reportFound) {
            uint256 adjustedPreviousRate = _calculateDecimalsAdjustment(
                _previousRate,
                _previousRateDecimals,
                kpiRateStorage.rateDecimals
            );

            rate_ = adjustedPreviousRate + kpiRateStorage.missedPenalty;

            if (rate_ > kpiRateStorage.maxRate) {
                rate_ = kpiRateStorage.maxRate;
            }

            return (rate_, kpiRateStorage.rateDecimals);
        }

        // Calculate rate based on impact data vs baseline
        uint256 impactDeltaRate;
        uint256 factor = 10 ** kpiRateStorage.adjustmentPrecision;

        if (kpiRateStorage.baseLine > _impactData) {
            // Below baseline: rate decreases toward minRate
            impactDeltaRate =
                (factor * (kpiRateStorage.baseLine - _impactData)) /
                (kpiRateStorage.baseLine - kpiRateStorage.maxDeviationFloor);
            if (impactDeltaRate > factor) impactDeltaRate = factor;
            rate_ =
                kpiRateStorage.baseRate -
                (((kpiRateStorage.baseRate - kpiRateStorage.minRate) * impactDeltaRate) / factor);
        } else {
            // Above baseline: rate increases toward maxRate
            impactDeltaRate =
                (factor * (_impactData - kpiRateStorage.baseLine)) /
                (kpiRateStorage.maxDeviationCap - kpiRateStorage.baseLine);
            if (impactDeltaRate > factor) impactDeltaRate = factor;
            rate_ =
                kpiRateStorage.baseRate +
                (((kpiRateStorage.maxRate - kpiRateStorage.baseRate) * impactDeltaRate) / factor);
        }

        return (rate_, kpiRateStorage.rateDecimals);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SUSTAINABILITY PERFORMANCE TARGET RATE — Rate with project-specific impact data
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Initialize sustainability performance target interest rate
    /// @param _baseRate Base interest rate (starting point)
    /// @param _startPeriod Timestamp of rate start period
    /// @param _startRate Rate to use before start period
    /// @param _rateDecimals Decimal places for rate values
    // solhint-disable-next-line ordering
    function initializeSustainabilityRate(
        uint256 _baseRate,
        uint256 _startPeriod,
        uint256 _startRate,
        uint8 _rateDecimals
    ) internal {
        SustainabilityPerformanceTargetRateDataStorage
            storage rateStorage = sustainabilityPerformanceTargetRateStorage();
        rateStorage.baseRate = _baseRate;
        rateStorage.startPeriod = _startPeriod;
        rateStorage.startRate = _startRate;
        rateStorage.rateDecimals = _rateDecimals;
        rateStorage.initialized = true;
    }

    /// @notice Check if sustainability performance target rate has been initialized
    /// @return True if sustainability rate is initialized, false otherwise
    function isSustainabilityRateInitialized() internal view returns (bool) {
        return sustainabilityPerformanceTargetRateStorage().initialized;
    }

    /// @notice Set sustainability interest rate parameters
    /// @dev Without trigger; facet handles that
    /// @param _newInterestRate The new interest rate data
    function setSustainabilityInterestRate(
        ISustainabilityPerformanceTargetRate.InterestRate calldata _newInterestRate
    ) internal {
        SustainabilityPerformanceTargetRateDataStorage
            storage rateStorage = sustainabilityPerformanceTargetRateStorage();
        rateStorage.baseRate = _newInterestRate.baseRate;
        rateStorage.startPeriod = _newInterestRate.startPeriod;
        rateStorage.startRate = _newInterestRate.startRate;
        rateStorage.rateDecimals = _newInterestRate.rateDecimals;
    }

    /// @notice Set sustainability impact data for a specific project
    /// @dev Without trigger; facet handles that
    /// @param _project The project address
    /// @param _newImpactData The new impact data
    function setSustainabilityImpactData(
        address _project,
        ISustainabilityPerformanceTargetRate.ImpactData calldata _newImpactData
    ) internal {
        SustainabilityPerformanceTargetRateDataStorage
            storage rateStorage = sustainabilityPerformanceTargetRateStorage();
        ISustainabilityPerformanceTargetRate.ImpactData storage impactData = rateStorage.impactDataByProject[_project];
        impactData.baseLine = _newImpactData.baseLine;
        impactData.baseLineMode = _newImpactData.baseLineMode;
        impactData.deltaRate = _newImpactData.deltaRate;
        impactData.impactDataMode = _newImpactData.impactDataMode;
    }

    /// @notice Get the sustainability interest rate parameters
    /// @return interestRate_ The interest rate data
    function getSustainabilityInterestRate()
        internal
        view
        returns (ISustainabilityPerformanceTargetRate.InterestRate memory interestRate_)
    {
        SustainabilityPerformanceTargetRateDataStorage
            storage rateStorage = sustainabilityPerformanceTargetRateStorage();
        interestRate_ = ISustainabilityPerformanceTargetRate.InterestRate({
            baseRate: rateStorage.baseRate,
            startPeriod: rateStorage.startPeriod,
            startRate: rateStorage.startRate,
            rateDecimals: rateStorage.rateDecimals
        });
    }

    /// @notice Get impact data for a specific project
    /// @param _project The project address
    /// @return The impact data for the project
    function getSustainabilityImpactData(
        address _project
    ) internal view returns (ISustainabilityPerformanceTargetRate.ImpactData memory) {
        return sustainabilityPerformanceTargetRateStorage().impactDataByProject[_project];
    }

    /// @notice Get the base sustainability performance target interest rate
    /// @return rate_ The base rate
    /// @return rateDecimals_ Decimal places for the rate
    function getBaseRate() internal view returns (uint256 rate_, uint8 rateDecimals_) {
        SustainabilityPerformanceTargetRateDataStorage
            storage sptRateStorage = sustainabilityPerformanceTargetRateStorage();
        rate_ = sptRateStorage.baseRate;
        rateDecimals_ = sptRateStorage.rateDecimals;
    }

    /// @notice Apply impact adjustment to a rate (helper for complex calculations)
    /// @param _impactData The impact data with adjustment details
    /// @param _dataValue The measured impact data value
    /// @param _exists Whether data exists for this period
    /// @return rateAdjustment_ The adjustment to apply (positive for increase, negative for decrease)
    function calculateRateAdjustment(
        ISustainabilityPerformanceTargetRate.ImpactData memory _impactData,
        uint256 _dataValue,
        bool _exists
    ) internal pure returns (int256 rateAdjustment_) {
        // Penalty mode: apply delta if data missing or threshold violated
        if (_impactData.impactDataMode == ISustainabilityPerformanceTargetRate.ImpactDataMode.PENALTY) {
            if (!_exists) {
                return int256(_impactData.deltaRate);
            }

            if (_impactData.baseLineMode == ISustainabilityPerformanceTargetRate.BaseLineMode.MINIMUM) {
                if (_dataValue < _impactData.baseLine) {
                    return int256(_impactData.deltaRate);
                }
            } else {
                if (_dataValue > _impactData.baseLine) {
                    return int256(_impactData.deltaRate);
                }
            }
        } else {
            // Bonus mode: apply delta only if data exists and threshold exceeded
            if (!_exists) {
                return 0;
            }

            if (_impactData.baseLineMode == ISustainabilityPerformanceTargetRate.BaseLineMode.MINIMUM) {
                if (_dataValue > _impactData.baseLine) {
                    return -int256(_impactData.deltaRate);
                }
            } else {
                if (_dataValue < _impactData.baseLine) {
                    return -int256(_impactData.deltaRate);
                }
            }
        }

        return 0;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS — Data Accessors (grouped at end for function ordering compliance)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Check if KPI-linked rate has been initialized
    /// @return True if KPI-linked rate is initialized, false otherwise
    function isKpiLinkedRateInitialized() internal view returns (bool) {
        return kpiLinkedRateStorage().initialized;
    }

    /// @notice Get the KPI-linked interest rate parameters
    /// @return interestRate_ The interest rate data
    function getKpiLinkedInterestRate() internal view returns (IKpiLinkedRate.InterestRate memory interestRate_) {
        KpiLinkedRateDataStorage storage rateStorage = kpiLinkedRateStorage();
        interestRate_ = IKpiLinkedRate.InterestRate({
            maxRate: rateStorage.maxRate,
            baseRate: rateStorage.baseRate,
            minRate: rateStorage.minRate,
            startPeriod: rateStorage.startPeriod,
            startRate: rateStorage.startRate,
            missedPenalty: rateStorage.missedPenalty,
            reportPeriod: rateStorage.reportPeriod,
            rateDecimals: rateStorage.rateDecimals
        });
    }

    /// @notice Get the KPI-linked impact data parameters
    /// @return impactData_ The impact data
    function getKpiLinkedImpactData() internal view returns (IKpiLinkedRate.ImpactData memory impactData_) {
        KpiLinkedRateDataStorage storage rateStorage = kpiLinkedRateStorage();
        impactData_ = IKpiLinkedRate.ImpactData({
            maxDeviationCap: rateStorage.maxDeviationCap,
            baseLine: rateStorage.baseLine,
            maxDeviationFloor: rateStorage.maxDeviationFloor,
            impactDataDecimals: rateStorage.impactDataDecimals,
            adjustmentPrecision: rateStorage.adjustmentPrecision
        });
    }

    /// @notice Get the fixed interest rate and its decimal places
    /// @return rate_ The fixed interest rate value
    /// @return decimals_ The number of decimal places for the rate
    function getFixedRate() internal view returns (uint256 rate_, uint8 decimals_) {
        FixedRateDataStorage storage rateStorage = fixedRateStorage();
        return (rateStorage.rate, rateStorage.decimals);
    }

    /// @notice Check if fixed rate has been initialized
    /// @return True if fixed rate is initialized, false otherwise
    function isFixedRateInitialized() internal view returns (bool) {
        return fixedRateStorage().initialized;
    }

    /// @notice Validate KPI-linked interest rate parameters
    /// @param _newInterestRate The interest rate data to validate
    // solhint-disable-next-line ordering
    function requireValidKpiLinkedRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) internal pure {
        if (
            _newInterestRate.minRate > _newInterestRate.baseRate || _newInterestRate.baseRate > _newInterestRate.maxRate
        ) {
            revert IKpiLinkedRate.WrongInterestRateValues(_newInterestRate);
        }
    }

    /// @notice Validate KPI-linked impact data parameters
    /// @param _newImpactData The impact data to validate
    function requireValidKpiLinkedImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) internal pure {
        if (
            _newImpactData.maxDeviationFloor > _newImpactData.baseLine ||
            _newImpactData.baseLine > _newImpactData.maxDeviationCap
        ) {
            revert IKpiLinkedRate.WrongImpactDataValues(_newImpactData);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _calculateDecimalsAdjustment(
        uint256 _amount,
        uint8 _decimals,
        uint8 _newDecimals
    ) private pure returns (uint256) {
        if (_decimals == _newDecimals) return _amount;

        if (_decimals > _newDecimals) {
            return _amount / (10 ** (_decimals - _newDecimals));
        } else {
            return _amount * (10 ** (_newDecimals - _decimals));
        }
    }
}
