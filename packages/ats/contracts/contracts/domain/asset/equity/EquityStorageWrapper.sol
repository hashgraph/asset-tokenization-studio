// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _EQUITY_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import {
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE
} from "../../../constants/values.sol";
import { IEquity } from "../../../facets/layer_2/equity/IEquity.sol";
import { IEquityStorageWrapper } from "../../../domain/asset/equity/IEquityStorageWrapper.sol";
import { DividendStorageWrapper } from "../dividend/DividendStorageWrapper.sol";

abstract contract EquityStorageWrapper is IEquityStorageWrapper, DividendStorageWrapper {
    struct EquityDataStorage {
        bool votingRight; //TODO remove in future refactor
        bool informationRight; //TODO remove in future refactor
        bool liquidationRight; //TODO remove in future refactor
        bool subscriptionRight; //TODO remove in future refactor
        bool conversionRight; //TODO remove in future refactor
        bool redemptionRight; //TODO remove in future refactor
        bool putRight; //TODO remove in future refactor
        IEquity.DividendType dividendRight; //TODO remove in future refactor
        bytes3 currency;
        /// @deprecated Kept for storage layout compatibility. Use NominalValueStorageWrapper instead.
        // solhint-disable-next-line var-name-mixedcase
        uint256 DEPRECATED_nominalValue;
        bool initialized;
        /// @deprecated Kept for storage layout compatibility. Use NominalValueStorageWrapper instead.
        // solhint-disable-next-line var-name-mixedcase
        uint8 DEPRECATED_nominalValueDecimals;
    }

    function _setVotingRight(bool _votingRight) internal override {
        _equityStorage().votingRight = _votingRight;
    }

    function _setInformationRight(bool _informationRight) internal override {
        _equityStorage().informationRight = _informationRight;
    }

    function _setLiquidationRight(bool _liquidationRight) internal override {
        _equityStorage().liquidationRight = _liquidationRight;
    }

    function _setSubscriptionRight(bool _subscriptionRight) internal override {
        _equityStorage().subscriptionRight = _subscriptionRight;
    }

    function _setConversionRight(bool _conversionRight) internal override {
        _equityStorage().conversionRight = _conversionRight;
    }

    function _setRedemptionRight(bool _redemptionRight) internal override {
        _equityStorage().redemptionRight = _redemptionRight;
    }

    function _setPutRight(bool _putRight) internal override {
        _equityStorage().putRight = _putRight;
    }

    function _setDividendRight(IEquity.DividendType _dividendRight) internal override {
        _equityStorage().dividendRight = _dividendRight;
    }

    function _setEquityCurrency(bytes3 _currency) internal override {
        _equityStorage().currency = _currency;
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_equity(IEquity.EquityDetailsData calldata _equityDetailsData) internal override {
        EquityDataStorage storage equityStorage = _equityStorage();
        equityStorage.initialized = true;
        _setVotingRight(_equityDetailsData.votingRight);
        _setInformationRight(_equityDetailsData.informationRight);
        _setLiquidationRight(_equityDetailsData.liquidationRight);
        _setSubscriptionRight(_equityDetailsData.subscriptionRight);
        _setConversionRight(_equityDetailsData.conversionRight);
        _setRedemptionRight(_equityDetailsData.redemptionRight);
        _setPutRight(_equityDetailsData.putRight);
        _setDividendRight(_equityDetailsData.dividendRight);
        _setEquityCurrency(_equityDetailsData.currency);
    }

    function _setScheduledBalanceAdjustment(
        IEquity.ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    ) internal override returns (bytes32 corporateActionId_, uint256 balanceAdjustmentID_) {
        bytes memory data = abi.encode(_newBalanceAdjustment);

        (corporateActionId_, balanceAdjustmentID_) = _addCorporateAction(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            data
        );

        _initBalanceAdjustment(corporateActionId_, data);
    }

    function _cancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentId) internal override returns (bool success_) {
        IEquity.ScheduledBalanceAdjustment memory balanceAdjustment;
        bytes32 corporateActionId;
        (balanceAdjustment, corporateActionId, ) = _getScheduledBalanceAdjustment(_balanceAdjustmentId);
        if (balanceAdjustment.executionDate <= _blockTimestamp()) {
            revert IEquityStorageWrapper.BalanceAdjustmentAlreadyExecuted(corporateActionId, _balanceAdjustmentId);
        }
        _cancelCorporateAction(corporateActionId);
        success_ = true;
        emit ScheduledBalanceAdjustmentCancelled(_balanceAdjustmentId, _msgSender());
    }

    function _initBalanceAdjustment(bytes32 _actionId, bytes memory _data) internal override {
        if (_actionId == bytes32(0)) {
            revert IEquityStorageWrapper.BalanceAdjustmentCreationFailed();
        }

        IEquity.ScheduledBalanceAdjustment memory newBalanceAdjustment = abi.decode(
            _data,
            (IEquity.ScheduledBalanceAdjustment)
        );

        _addScheduledCrossOrderedTask(newBalanceAdjustment.executionDate, BALANCE_ADJUSTMENT_TASK_TYPE);
        _addScheduledBalanceAdjustment(newBalanceAdjustment.executionDate, _actionId);
    }

    /// @dev DEPRECATED – MIGRATION: Remove this function and the DEPRECATED_ fields from
    /// EquityDataStorage once all legacy tokens have been migrated.
    function _migrateEquityNominalValue() internal override {
        if (_equityStorage().DEPRECATED_nominalValue == 0) return;
        _equityStorage().DEPRECATED_nominalValue = 0;
        _equityStorage().DEPRECATED_nominalValueDecimals = 0;
    }

    function _getEquityDetails() internal view override returns (IEquity.EquityDetailsData memory equityDetails_) {
        equityDetails_ = IEquity.EquityDetailsData({
            votingRight: _equityStorage().votingRight,
            informationRight: _equityStorage().informationRight,
            liquidationRight: _equityStorage().liquidationRight,
            subscriptionRight: _equityStorage().subscriptionRight,
            conversionRight: _equityStorage().conversionRight,
            redemptionRight: _equityStorage().redemptionRight,
            putRight: _equityStorage().putRight,
            dividendRight: _equityStorage().dividendRight,
            currency: _equityStorage().currency,
            nominalValue: _getNominalValue(),
            nominalValueDecimals: _getNominalValueDecimals()
        });
    }

    function _getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    )
        internal
        view
        override
        returns (
            IEquity.ScheduledBalanceAdjustment memory balanceAdjustment_,
            bytes32 corporateActionId_,
            bool isDisabled_
        )
    {
        corporateActionId_ = _getCorporateActionIdByTypeIndex(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            _balanceAdjustmentID - 1
        );

        bytes memory data;
        (, , data, isDisabled_) = _getCorporateAction(corporateActionId_);

        assert(data.length > 0);
        (balanceAdjustment_) = abi.decode(data, (IEquity.ScheduledBalanceAdjustment));
    }

    function _getScheduledBalanceAdjustmentsCount() internal view override returns (uint256 balanceAdjustmentCount_) {
        return _getCorporateActionCountByType(BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE);
    }

    function _getSnapshotBalanceForIfDateReached(
        uint256 _date,
        uint256 _snapshotId,
        address _account
    ) internal view override returns (uint256 balance_, uint8 decimals_, bool dateReached_) {
        if (_date < _blockTimestamp()) {
            dateReached_ = true;

            balance_ = (_snapshotId != 0)
                ? _getTotalBalanceOfAtSnapshot(_snapshotId, _account)
                : _getTotalBalanceForAdjustedAt(_account, _date);

            decimals_ = (_snapshotId != 0) ? _decimalsAtSnapshot(_snapshotId) : _decimalsAdjustedAt(_date);
        }
    }

    /// @dev DEPRECATED – MIGRATION: Remove once all legacy tokens have been migrated.
    function _equityNominalValue() internal view virtual override returns (uint256) {
        return _equityStorage().DEPRECATED_nominalValue;
    }

    /// @dev DEPRECATED – MIGRATION: Remove once all legacy tokens have been migrated.
    function _equityNominalValueDecimals() internal view virtual override returns (uint8) {
        return _equityStorage().DEPRECATED_nominalValueDecimals;
    }

    function _equityStorage() internal pure returns (EquityDataStorage storage equityData_) {
        bytes32 position = _EQUITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            equityData_.slot := position
        }
    }
}
