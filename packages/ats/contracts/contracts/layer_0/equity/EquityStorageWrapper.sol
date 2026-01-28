// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _EQUITY_STORAGE_POSITION } from "../../layer_2/constants/storagePositions.sol";
import {
    DIVIDEND_CORPORATE_ACTION_TYPE,
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE
} from "../../layer_2/constants/values.sol";
import { IEquity } from "../../layer_2/interfaces/equity/IEquity.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IEquityStorageWrapper } from "../../layer_2/interfaces/equity/IEquityStorageWrapper.sol";
import { BondStorageWrapper } from "../bond/BondStorageWrapper.sol";

abstract contract EquityStorageWrapper is IEquityStorageWrapper, BondStorageWrapper {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct EquityDataStorage {
        bool votingRight;
        bool informationRight;
        bool liquidationRight;
        bool subscriptionRight;
        bool conversionRight;
        bool redemptionRight;
        bool putRight;
        IEquity.DividendType dividendRight;
        bytes3 currency;
        uint256 nominalValue;
        bool initialized;
        uint8 nominalValueDecimals;
    }

    function _storeEquityDetails(IEquity.EquityDetailsData memory _equityDetailsData) internal override {
        _equityStorage().votingRight = _equityDetailsData.votingRight;
        _equityStorage().informationRight = _equityDetailsData.informationRight;
        _equityStorage().liquidationRight = _equityDetailsData.liquidationRight;
        _equityStorage().subscriptionRight = _equityDetailsData.subscriptionRight;
        _equityStorage().conversionRight = _equityDetailsData.conversionRight;
        _equityStorage().redemptionRight = _equityDetailsData.redemptionRight;
        _equityStorage().putRight = _equityDetailsData.putRight;
        _equityStorage().dividendRight = _equityDetailsData.dividendRight;
        _equityStorage().currency = _equityDetailsData.currency;
        _equityStorage().nominalValue = _equityDetailsData.nominalValue;
        _equityStorage().nominalValueDecimals = _equityDetailsData.nominalValueDecimals;
    }

    function _setDividends(
        IEquity.Dividend calldata _newDividend
    ) internal override returns (bytes32 corporateActionId_, uint256 dividendId_) {
        bytes memory data = abi.encode(_newDividend);

        (corporateActionId_, dividendId_) = _addCorporateAction(DIVIDEND_CORPORATE_ACTION_TYPE, data);

        _initDividend(corporateActionId_, data);
    }

    function _initDividend(bytes32 _actionId, bytes memory _data) internal override {
        if (_actionId == bytes32(0)) {
            revert IEquityStorageWrapper.DividendCreationFailed();
        }

        IEquity.Dividend memory newDividend = abi.decode(_data, (IEquity.Dividend));

        _addScheduledCrossOrderedTask(newDividend.recordDate, SNAPSHOT_TASK_TYPE);
        _addScheduledSnapshot(newDividend.recordDate, _actionId);
    }

    function _setVoting(
        IEquity.Voting calldata _newVoting
    ) internal override returns (bytes32 corporateActionId_, uint256 voteID_) {
        bytes memory data = abi.encode(_newVoting);

        (corporateActionId_, voteID_) = _addCorporateAction(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, data);

        _initVotingRights(corporateActionId_, data);
    }

    function _initVotingRights(bytes32 _actionId, bytes memory _data) internal override {
        if (_actionId == bytes32(0)) {
            revert IEquityStorageWrapper.VotingRightsCreationFailed();
        }

        IEquity.Voting memory newVoting = abi.decode(_data, (IEquity.Voting));

        _addScheduledCrossOrderedTask(newVoting.recordDate, SNAPSHOT_TASK_TYPE);
        _addScheduledSnapshot(newVoting.recordDate, _actionId);
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
            nominalValue: _equityStorage().nominalValue,
            nominalValueDecimals: _equityStorage().nominalValueDecimals
        });
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a dividend.
     *
     * @param _dividendID The dividend Id
     * @param _dividendID The dividend Id
     */
    function _getDividends(
        uint256 _dividendID
    ) internal view override returns (IEquity.RegisteredDividend memory registeredDividend_) {
        bytes32 actionId = _getCorporateActionIdByTypeIndex(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1);

        (, , bytes memory data) = _getCorporateAction(actionId);

        assert(data.length > 0);
        (registeredDividend_.dividend) = abi.decode(data, (IEquity.Dividend));

        registeredDividend_.snapshotId = _getUintResultAt(actionId, SNAPSHOT_RESULT_ID);
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a dividend.
     *
     * @param _dividendID The dividend Id
     * @param _account The account
     */
    function _getDividendsFor(
        uint256 _dividendID,
        address _account
    ) internal view override returns (IEquity.DividendFor memory dividendFor_) {
        IEquity.RegisteredDividend memory registeredDividend = _getDividends(_dividendID);

        dividendFor_.amount = registeredDividend.dividend.amount;
        dividendFor_.amountDecimals = registeredDividend.dividend.amountDecimals;
        dividendFor_.recordDate = registeredDividend.dividend.recordDate;
        dividendFor_.executionDate = registeredDividend.dividend.executionDate;

        (
            dividendFor_.tokenBalance,
            dividendFor_.decimals,
            dividendFor_.recordDateReached
        ) = _getSnapshotBalanceForIfDateReached(
            registeredDividend.dividend.recordDate,
            registeredDividend.snapshotId,
            _account
        );
    }

    function _getDividendAmountFor(
        uint256 _dividendID,
        address _account
    ) internal view override returns (IEquity.DividendAmountFor memory dividendAmountFor_) {
        IEquity.DividendFor memory dividendFor = _getDividendsFor(_dividendID, _account);

        if (!dividendFor.recordDateReached) return dividendAmountFor_;

        dividendAmountFor_.recordDateReached = true;

        dividendAmountFor_.numerator = dividendFor.tokenBalance * dividendFor.amount;

        dividendAmountFor_.denominator = 10 ** (dividendFor.decimals + dividendFor.amountDecimals);
    }

    function _getDividendsCount() internal view override returns (uint256 dividendCount_) {
        return _getCorporateActionCountByType(DIVIDEND_CORPORATE_ACTION_TYPE);
    }

    function _getDividendHolders(
        uint256 _dividendID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (address[] memory holders_) {
        IEquity.RegisteredDividend memory registeredDividend = _getDividends(_dividendID);

        if (registeredDividend.dividend.recordDate >= _blockTimestamp()) return new address[](0);

        if (registeredDividend.snapshotId != 0)
            return _tokenHoldersAt(registeredDividend.snapshotId, _pageIndex, _pageLength);

        return _getTokenHolders(_pageIndex, _pageLength);
    }

    function _getTotalDividendHolders(uint256 _dividendID) internal view override returns (uint256) {
        IEquity.RegisteredDividend memory registeredDividend = _getDividends(_dividendID);

        if (registeredDividend.dividend.recordDate >= _blockTimestamp()) return 0;

        if (registeredDividend.snapshotId != 0) return _totalTokenHoldersAt(registeredDividend.snapshotId);

        return _getTotalTokenHolders();
    }

    function _getVoting(
        uint256 _voteID
    ) internal view override returns (IEquity.RegisteredVoting memory registeredVoting_) {
        bytes32 actionId = _getCorporateActionIdByTypeIndex(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1);

        (, , bytes memory data) = _getCorporateAction(actionId);

        assert(data.length > 0);
        (registeredVoting_.voting) = abi.decode(data, (IEquity.Voting));

        registeredVoting_.snapshotId = _getUintResultAt(actionId, SNAPSHOT_RESULT_ID);
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a voting.
     *
     * @param _voteID The dividend Id
     * @param _account The account

     */
    function _getVotingFor(
        uint256 _voteID,
        address _account
    ) internal view override returns (IEquity.VotingFor memory votingFor_) {
        IEquity.RegisteredVoting memory registeredVoting = _getVoting(_voteID);

        votingFor_.recordDate = registeredVoting.voting.recordDate;
        votingFor_.data = registeredVoting.voting.data;

        (
            votingFor_.tokenBalance,
            votingFor_.decimals,
            votingFor_.recordDateReached
        ) = _getSnapshotBalanceForIfDateReached(
            registeredVoting.voting.recordDate,
            registeredVoting.snapshotId,
            _account
        );
    }

    function _getVotingCount() internal view override returns (uint256 votingCount_) {
        return _getCorporateActionCountByType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE);
    }

    function _getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (address[] memory holders_) {
        IEquity.RegisteredVoting memory registeredVoting = _getVoting(_voteID);

        if (registeredVoting.voting.recordDate >= _blockTimestamp()) return new address[](0);

        if (registeredVoting.snapshotId != 0)
            return _tokenHoldersAt(registeredVoting.snapshotId, _pageIndex, _pageLength);

        return _getTokenHolders(_pageIndex, _pageLength);
    }

    function _getTotalVotingHolders(uint256 _voteID) internal view override returns (uint256) {
        IEquity.RegisteredVoting memory registeredVoting = _getVoting(_voteID);

        if (registeredVoting.voting.recordDate >= _blockTimestamp()) return 0;

        if (registeredVoting.snapshotId != 0) return _totalTokenHoldersAt(registeredVoting.snapshotId);

        return _getTotalTokenHolders();
    }

    function _getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    ) internal view override returns (IEquity.ScheduledBalanceAdjustment memory balanceAdjustment_) {
        bytes32 actionId = _getCorporateActionIdByTypeIndex(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            _balanceAdjustmentID - 1
        );

        (, , bytes memory data) = _getCorporateAction(actionId);

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

    function _equityStorage() internal pure returns (EquityDataStorage storage equityData_) {
        bytes32 position = _EQUITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            equityData_.slot := position
        }
    }
}
