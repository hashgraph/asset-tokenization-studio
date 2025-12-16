// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _KPI_LINKED_RATE_STORAGE_POSITION } from "../../../layer_2/constants/storagePositions.sol";
import { IKpiLinkedRate } from "../../../layer_2/interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol";
import { PauseStorageWrapper } from "../../core/pause/PauseStorageWrapper.sol";

abstract contract KpiLinkedRateStorageWrapper is PauseStorageWrapper {
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
        address kpiOracle;
        bool initialized;
    }

    modifier checkInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) override {
        if (
            _newInterestRate.minRate > _newInterestRate.baseRate || _newInterestRate.baseRate > _newInterestRate.maxRate
        ) {
            revert IKpiLinkedRate.WrongInterestRateValues(_newInterestRate);
        }
        _;
    }

    modifier checkImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) override {
        if (
            _newImpactData.maxDeviationFloor > _newImpactData.baseLine ||
            _newImpactData.baseLine > _newImpactData.maxDeviationCap
        ) {
            revert IKpiLinkedRate.WrongImpactDataValues(_newImpactData);
        }
        _;
    }

    function _setInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) internal override {
        _triggerScheduledCrossOrderedTasks(0);

        KpiLinkedRateDataStorage storage kpiLinkedRateDataStorage = _kpiLinkedRateStorage();
        kpiLinkedRateDataStorage.maxRate = _newInterestRate.maxRate;
        kpiLinkedRateDataStorage.baseRate = _newInterestRate.baseRate;
        kpiLinkedRateDataStorage.minRate = _newInterestRate.minRate;
        kpiLinkedRateDataStorage.startPeriod = _newInterestRate.startPeriod;
        kpiLinkedRateDataStorage.startRate = _newInterestRate.startRate;
        kpiLinkedRateDataStorage.missedPenalty = _newInterestRate.missedPenalty;
        kpiLinkedRateDataStorage.reportPeriod = _newInterestRate.reportPeriod;
        kpiLinkedRateDataStorage.rateDecimals = _newInterestRate.rateDecimals;
    }
    function _setImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) internal override {
        _triggerScheduledCrossOrderedTasks(0);

        KpiLinkedRateDataStorage storage kpiLinkedRateDataStorage = _kpiLinkedRateStorage();
        kpiLinkedRateDataStorage.maxDeviationCap = _newImpactData.maxDeviationCap;
        kpiLinkedRateDataStorage.baseLine = _newImpactData.baseLine;
        kpiLinkedRateDataStorage.maxDeviationFloor = _newImpactData.maxDeviationFloor;
        kpiLinkedRateDataStorage.impactDataDecimals = _newImpactData.impactDataDecimals;
        kpiLinkedRateDataStorage.adjustmentPrecision = _newImpactData.adjustmentPrecision;
    }

    function _setKpiOracle(address _kpiOracle) internal override {
        _triggerScheduledCrossOrderedTasks(0);

        _kpiLinkedRateStorage().kpiOracle = _kpiOracle;
    }

    function _getInterestRate() internal view override returns (IKpiLinkedRate.InterestRate memory interestRate_) {
        interestRate_ = IKpiLinkedRate.InterestRate({
            maxRate: _kpiLinkedRateStorage().maxRate,
            baseRate: _kpiLinkedRateStorage().baseRate,
            minRate: _kpiLinkedRateStorage().minRate,
            startPeriod: _kpiLinkedRateStorage().startPeriod,
            startRate: _kpiLinkedRateStorage().startRate,
            missedPenalty: _kpiLinkedRateStorage().missedPenalty,
            reportPeriod: _kpiLinkedRateStorage().reportPeriod,
            rateDecimals: _kpiLinkedRateStorage().rateDecimals
        });
    }

    function _getImpactData() internal view override returns (IKpiLinkedRate.ImpactData memory impactData_) {
        impactData_ = IKpiLinkedRate.ImpactData({
            maxDeviationCap: _kpiLinkedRateStorage().maxDeviationCap,
            baseLine: _kpiLinkedRateStorage().baseLine,
            maxDeviationFloor: _kpiLinkedRateStorage().maxDeviationFloor,
            impactDataDecimals: _kpiLinkedRateStorage().impactDataDecimals,
            adjustmentPrecision: _kpiLinkedRateStorage().adjustmentPrecision
        });
    }

    function _getKpiOracle() internal view override returns (address kpiOracle_) {
        kpiOracle_ = _kpiLinkedRateStorage().kpiOracle;
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
}
