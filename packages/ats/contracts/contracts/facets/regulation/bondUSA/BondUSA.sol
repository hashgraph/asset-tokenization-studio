// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondUSA } from "../interfaces/IBondUSA.sol";
import { IBond } from "../../assetCapabilities/interfaces/bond/IBond.sol";
import { IBondRead } from "../../assetCapabilities/interfaces/bond/IBondRead.sol";
import { IKyc } from "../../features/interfaces/IKyc.sol";
import { RegulationData, AdditionalSecurityData } from "../constants/regulation.sol";
import { _CORPORATE_ACTION_ROLE, _BOND_MANAGER_ROLE, _MATURITY_REDEEMER_ROLE } from "../../../constants/roles.sol";
// solhint-disable max-line-length
import {
    ISustainabilityPerformanceTargetRate
} from "../../assetCapabilities/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
// solhint-enable max-line-length

import { BondRateType, bondStorage } from "../../../storage/AssetStorage.sol";
import {
    KpiLinkedRateDataStorage,
    SustainabilityPerformanceTargetRateDataStorage
} from "../../../storage/ScheduledStorage.sol";
import { LibBond } from "../../../lib/domain/LibBond.sol";
import { LibSecurity } from "../../../lib/domain/LibSecurity.sol";
import { TokenCoreOps } from "../../../lib/orchestrator/TokenCoreOps.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibControlList } from "../../../lib/core/LibControlList.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibClearing } from "../../../lib/domain/LibClearing.sol";
import { LibKyc } from "../../../lib/core/LibKyc.sol";
import { LibCompliance } from "../../../lib/core/LibCompliance.sol";
import { LibCorporateActions } from "../../../lib/core/LibCorporateActions.sol";
import { LibInterestRate } from "../../../lib/domain/LibInterestRate.sol";
import { LibKpis } from "../../../lib/domain/LibKpis.sol";
import { LibProceedRecipients } from "../../../lib/domain/LibProceedRecipients.sol";
import { IClearing } from "../../features/interfaces/clearing/IClearing.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";

abstract contract BondUSA is IBond, IBondUSA, TimestampProvider {
    // ═══════════════════════════════════════════════════════════════════════════════
    // ERROR DEFINITIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    error AlreadyInitialized();
    error WrongTimestamp(uint256 timeStamp);
    error InterestRateIsFixed();
    error InterestRateIsKpiLinked();
    error InterestRateIsSustainabilityPerformanceTarget();

    // ═══════════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_bondUSA(
        IBondRead.BondDetailsData calldata _bondDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData,
        BondRateType _rateType
    ) external override {
        if (_isBondInitialized()) revert AlreadyInitialized();

        _validateBondInitData(_bondDetailsData);
        LibBond.initializeBond(_bondDetailsData);
        LibSecurity.initializeSecurity(_regulationData, _additionalSecurityData);

        // Persist rate type — read once per getCoupon / setCoupon dispatch
        bondStorage().rateType = _rateType;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    function setCoupon(IBondRead.Coupon calldata _newCoupon) external virtual override returns (uint256 couponID_) {
        BondRateType rateType = bondStorage().rateType;

        if (rateType == BondRateType.Fixed) {
            couponID_ = _setCouponFixed(_newCoupon);
        } else if (rateType == BondRateType.KpiLinked) {
            couponID_ = _setCouponKpiLinked(_newCoupon);
        } else if (rateType == BondRateType.Spt) {
            couponID_ = _setCouponSpt(_newCoupon);
        } else {
            couponID_ = _setCouponVariable(_newCoupon);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // MATURITY DATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    function updateMaturityDate(uint256 _newMaturityDate) external override returns (bool success_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_BOND_MANAGER_ROLE);
        _requireAfterCurrentMaturityDate(_newMaturityDate);

        emit IBond.MaturityDateUpdated(address(this), _newMaturityDate, LibBond.getMaturityDate());
        success_ = LibBond.setMaturityDate(_newMaturityDate);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // REDEMPTION
    // ═══════════════════════════════════════════════════════════════════════════════

    function fullRedeemAtMaturity(address _tokenHolder) external override {
        _validateRedeemAtMaturity(_tokenHolder);

        bytes32[] memory partitions = LibERC1410.partitionsOf(_tokenHolder);
        for (uint256 i = 0; i < partitions.length; i++) {
            bytes32 partition = partitions[i];
            uint256 balance = LibERC1410.balanceOfByPartition(partition, _tokenHolder);
            if (balance > 0) {
                TokenCoreOps.redeemByPartition(
                    partition,
                    _tokenHolder,
                    msg.sender,
                    balance,
                    "",
                    "",
                    _getBlockTimestamp(),
                    _getBlockNumber()
                );
            }
        }
    }

    function redeemAtMaturityByPartition(address _tokenHolder, bytes32 _partition, uint256 _amount) external override {
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        _validateRedeemAtMaturity(_tokenHolder);

        TokenCoreOps.redeemByPartition(
            _partition,
            _tokenHolder,
            msg.sender,
            _amount,
            "",
            "",
            _getBlockTimestamp(),
            _getBlockNumber()
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _validateRedeemAtMaturity(address _tokenHolder) internal view {
        LibPause.requireNotPaused();
        LibERC1410.requireValidAddress(_tokenHolder);
        LibControlList.requireListedAllowed(_tokenHolder);
        LibAccess.checkRole(_MATURITY_REDEEMER_ROLE);
        if (LibClearing.isClearingActivated()) revert IClearing.ClearingIsActivated();
        LibKyc.requireValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder);
        LibCompliance.requireNotRecovered(_tokenHolder);
        _requireAfterCurrentMaturityDate(_getBlockTimestamp());
    }

    function _validateBondInitData(IBondRead.BondDetailsData calldata _bondDetailsData) internal view {
        LibCorporateActions.validateDates(_bondDetailsData.startingDate, _bondDetailsData.maturityDate);
        _requireValidTimestamp(_bondDetailsData.startingDate);
    }

    function _requireAfterCurrentMaturityDate(uint256 _maturityDate) internal view {
        if (_maturityDate <= LibBond.getMaturityDate()) {
            revert BondMaturityDateWrong();
        }
    }

    function _requireValidTimestamp(uint256 _timestamp) internal view {
        if (_timestamp <= _getBlockTimestamp()) {
            revert WrongTimestamp(_timestamp);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _isBondInitialized() internal view returns (bool) {
        return LibBond.isBondInitialized();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRIVATE — RATE-SPECIFIC setCoupon IMPLEMENTATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @dev Variable-rate setCoupon: accepts any rate value, stores as-is.
    function _setCouponVariable(IBondRead.Coupon calldata _newCoupon) private returns (uint256 couponID_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_CORPORATE_ACTION_ROLE);
        LibCorporateActions.validateDates(_newCoupon.startDate, _newCoupon.endDate);
        LibCorporateActions.validateDates(_newCoupon.recordDate, _newCoupon.executionDate);
        LibCorporateActions.validateDates(_newCoupon.fixingDate, _newCoupon.executionDate);
        _requireValidTimestamp(_newCoupon.recordDate);
        _requireValidTimestamp(_newCoupon.fixingDate);

        bytes32 corporateActionID;
        (corporateActionID, couponID_) = LibBond.setCoupon(_newCoupon);
    }

    /// @dev Fixed-rate setCoupon: injects the stored fixed rate; rate params in input must be zero.
    function _setCouponFixed(IBondRead.Coupon calldata _newCoupon) private returns (uint256 couponID_) {
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert InterestRateIsFixed();
        }

        (uint256 rate_, uint8 decimals_) = LibInterestRate.getFixedRate();

        IBondRead.Coupon memory modifiedCoupon = IBondRead.Coupon({
            recordDate: _newCoupon.recordDate,
            executionDate: _newCoupon.executionDate,
            rate: rate_,
            rateDecimals: decimals_,
            startDate: _newCoupon.startDate,
            endDate: _newCoupon.endDate,
            fixingDate: _newCoupon.fixingDate,
            rateStatus: IBondRead.RateCalculationStatus.SET
        });

        LibPause.requireNotPaused();
        LibAccess.checkRole(_CORPORATE_ACTION_ROLE);
        LibCorporateActions.validateDates(modifiedCoupon.startDate, modifiedCoupon.endDate);
        LibCorporateActions.validateDates(modifiedCoupon.recordDate, modifiedCoupon.executionDate);
        LibCorporateActions.validateDates(modifiedCoupon.fixingDate, modifiedCoupon.executionDate);
        _requireValidTimestamp(modifiedCoupon.recordDate);
        _requireValidTimestamp(modifiedCoupon.fixingDate);

        bytes32 corporateActionID;
        (corporateActionID, couponID_) = LibBond.setCoupon(modifiedCoupon);
    }

    /// @dev KPI-linked-rate setCoupon: rate params must be zero; rate is calculated dynamically on read.
    function _setCouponKpiLinked(IBondRead.Coupon calldata _newCoupon) private returns (uint256 couponID_) {
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert InterestRateIsKpiLinked();
        }

        LibPause.requireNotPaused();
        LibAccess.checkRole(_CORPORATE_ACTION_ROLE);
        LibCorporateActions.validateDates(_newCoupon.startDate, _newCoupon.endDate);
        LibCorporateActions.validateDates(_newCoupon.recordDate, _newCoupon.executionDate);
        LibCorporateActions.validateDates(_newCoupon.fixingDate, _newCoupon.executionDate);
        _requireValidTimestamp(_newCoupon.recordDate);
        _requireValidTimestamp(_newCoupon.fixingDate);

        bytes32 corporateActionID;
        (corporateActionID, couponID_) = LibBond.setCoupon(_newCoupon);
    }

    /// @dev SPT-rate setCoupon: rate params must be zero; rate is calculated dynamically on read.
    function _setCouponSpt(IBondRead.Coupon calldata _newCoupon) private returns (uint256 couponID_) {
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert InterestRateIsSustainabilityPerformanceTarget();
        }

        LibPause.requireNotPaused();
        LibAccess.checkRole(_CORPORATE_ACTION_ROLE);
        LibCorporateActions.validateDates(_newCoupon.startDate, _newCoupon.endDate);
        LibCorporateActions.validateDates(_newCoupon.recordDate, _newCoupon.executionDate);
        LibCorporateActions.validateDates(_newCoupon.fixingDate, _newCoupon.executionDate);
        _requireValidTimestamp(_newCoupon.recordDate);
        _requireValidTimestamp(_newCoupon.fixingDate);

        bytes32 corporateActionID;
        (corporateActionID, couponID_) = LibBond.setCoupon(_newCoupon);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL — KPI-LINKED RATE CALCULATION (write-side, for getCoupon override)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Calculate KPI-linked interest rate based on impact data
    /// @param _couponID The coupon ID (for accessing previous coupon rate)
    /// @param _coupon   The coupon data structure
    // solhint-disable-next-line ordering
    function _calculateKpiLinkedInterestRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        KpiLinkedRateDataStorage storage kpiLinkedRateStorage = LibInterestRate.getKpiLinkedRate();

        if (_coupon.fixingDate < kpiLinkedRateStorage.startPeriod) {
            return (kpiLinkedRateStorage.startRate, kpiLinkedRateStorage.rateDecimals);
        }

        address[] memory projects = LibProceedRecipients.getProceedRecipients(
            0,
            LibProceedRecipients.getProceedRecipientsCount()
        );
        uint256 impactData = 0;
        bool reportFound = false;

        for (uint256 index = 0; index < projects.length; ) {
            (uint256 value, bool exists) = LibKpis.getLatestKpiData(
                _coupon.fixingDate - kpiLinkedRateStorage.reportPeriod,
                _coupon.fixingDate,
                projects[index]
            );

            if (exists) {
                impactData += value;
                if (!reportFound) reportFound = true;
            }

            unchecked {
                ++index;
            }
        }

        (uint256 previousRate, uint8 previousRateDecimals) = _getPreviousCouponRate(_couponID);

        return LibInterestRate.calculateKpiLinkedRate(impactData, previousRate, previousRateDecimals, reportFound);
    }

    /// @notice Get the rate and decimals of the previous coupon
    function _getPreviousCouponRate(uint256 _couponID) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 previousCouponId = LibBond.getPreviousCouponInOrderedList(_couponID, _getBlockTimestamp());

        if (previousCouponId == 0) {
            return (0, 0);
        }

        // Recursively get the previous coupon through getCoupon to ensure rate is calculated
        IBondRead.RegisteredCoupon memory previousCoupon = IBondRead(address(this)).getCoupon(previousCouponId);

        if (previousCoupon.coupon.rateStatus == IBondRead.RateCalculationStatus.SET) {
            return (previousCoupon.coupon.rate, previousCoupon.coupon.rateDecimals);
        }

        return (0, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL — SPT RATE CALCULATION (write-side, for getCoupon override)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Calculate sustainability performance target interest rate based on project impact data
    /// @param _couponID The coupon ID (for accessing previous coupon fixing date)
    /// @param _coupon   The coupon data structure
    function _calculateSustainabilityRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        SustainabilityPerformanceTargetRateDataStorage storage sptRateStorage = LibInterestRate.getSustainabilityRate();

        if (_coupon.fixingDate < sptRateStorage.startPeriod) {
            return (sptRateStorage.startRate, sptRateStorage.rateDecimals);
        }

        (uint256 baseRate, uint8 decimals) = LibInterestRate.getBaseRate();

        uint256 periodStart = _getPreviousFixingDate(_couponID);

        address[] memory projects = LibProceedRecipients.getProceedRecipients(
            0,
            LibProceedRecipients.getProceedRecipientsCount()
        );

        int256 totalRateAdjustment = 0;

        for (uint256 index = 0; index < projects.length; ) {
            address project = projects[index];

            ISustainabilityPerformanceTargetRate.ImpactData memory impactData = LibInterestRate
                .getSustainabilityImpactData(project);

            (uint256 value, bool exists) = LibKpis.getLatestKpiData(periodStart, _coupon.fixingDate, project);

            int256 adjustment = LibInterestRate.calculateRateAdjustment(impactData, value, exists);
            totalRateAdjustment += adjustment;

            unchecked {
                ++index;
            }
        }

        int256 finalRate = int256(baseRate) + totalRateAdjustment;
        if (finalRate < 0) {
            finalRate = 0;
        }

        return (uint256(finalRate), decimals);
    }

    /// @notice Get the fixing date of the previous coupon
    function _getPreviousFixingDate(uint256 _couponID) internal view returns (uint256 fixingDate_) {
        uint256 previousCouponId = LibBond.getPreviousCouponInOrderedList(_couponID, _getBlockTimestamp());

        if (previousCouponId == 0) {
            return 0;
        }

        IBondRead.Coupon memory previousCoupon = LibBond.getCoupon(previousCouponId).coupon;
        return previousCoupon.fixingDate;
    }
}
