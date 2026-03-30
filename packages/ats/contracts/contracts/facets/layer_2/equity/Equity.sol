// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import {
    DIVIDEND_CORPORATE_ACTION_TYPE,
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE
} from "../../../constants/values.sol";
import { IEquity } from "./IEquity.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { CorporateActionsStorageWrapper } from "../../../domain/core/CorporateActionsStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../../../domain/asset/AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { EquityStorageWrapper, EquityDataStorage } from "../../../domain/asset/EquityStorageWrapper.sol";
import { IEquityStorageWrapper } from "../../../domain/asset/equity/IEquityStorageWrapper.sol";

abstract contract Equity is IEquity, Modifiers {
    function setDividends(
        Dividend calldata _newDividend
    ) external override onlyUnpaused onlyRole(_CORPORATE_ACTION_ROLE) returns (uint256 dividendID_) {
        CorporateActionsStorageWrapper.requireValidDates(_newDividend.recordDate, _newDividend.executionDate);
        ScheduledTasksStorageWrapper.requireValidTimestamp(_newDividend.recordDate);
        bytes32 corporateActionID;
        (corporateActionID, dividendID_) = EquityStorageWrapper.setDividends(_newDividend);
        emit IEquityStorageWrapper.DividendSet(
            corporateActionID,
            dividendID_,
            msg.sender,
            _newDividend.recordDate,
            _newDividend.executionDate,
            _newDividend.amount,
            _newDividend.amountDecimals
        );
    }

    function setVoting(
        Voting calldata _newVoting
    ) external override onlyUnpaused onlyRole(_CORPORATE_ACTION_ROLE) returns (uint256 voteID_) {
        ScheduledTasksStorageWrapper.requireValidTimestamp(_newVoting.recordDate);
        bytes32 corporateActionID;
        (corporateActionID, voteID_) = EquityStorageWrapper.setVoting(_newVoting);
        emit IEquityStorageWrapper.VotingSet(
            corporateActionID,
            voteID_,
            msg.sender,
            _newVoting.recordDate,
            _newVoting.data
        );
    }

    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    ) external override onlyUnpaused onlyRole(_CORPORATE_ACTION_ROLE) returns (uint256 balanceAdjustmentID_) {
        ScheduledTasksStorageWrapper.requireValidTimestamp(_newBalanceAdjustment.executionDate);
        AdjustBalancesStorageWrapper.requireValidFactor(_newBalanceAdjustment.factor);
        bytes32 corporateActionID;
        (corporateActionID, balanceAdjustmentID_) = EquityStorageWrapper.setScheduledBalanceAdjustment(
            _newBalanceAdjustment
        );
        emit IEquityStorageWrapper.ScheduledBalanceAdjustmentSet(
            corporateActionID,
            balanceAdjustmentID_,
            msg.sender,
            _newBalanceAdjustment.executionDate,
            _newBalanceAdjustment.factor,
            _newBalanceAdjustment.decimals
        );
    }

    function getEquityDetails() external view override returns (EquityDetailsData memory equityDetailsData_) {
        return EquityStorageWrapper.getEquityDetails();
    }

    function getDividends(
        uint256 _dividendID
    ) external view override returns (RegisteredDividend memory registeredDividend_) {
        CorporateActionsStorageWrapper.requireMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1);
        return EquityStorageWrapper.getDividends(_dividendID);
    }

    function getDividendsFor(
        uint256 _dividendID,
        address _account
    ) external view override returns (DividendFor memory dividendFor_) {
        CorporateActionsStorageWrapper.requireMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1);
        return EquityStorageWrapper.getDividendsFor(_dividendID, _account);
    }

    function getDividendAmountFor(
        uint256 _dividendID,
        address _account
    ) external view override returns (DividendAmountFor memory dividendAmountFor_) {
        CorporateActionsStorageWrapper.requireMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1);
        return EquityStorageWrapper.getDividendAmountFor(_dividendID, _account);
    }

    function getDividendsCount() external view override returns (uint256 dividendCount_) {
        return EquityStorageWrapper.getDividendsCount();
    }

    function getDividendHolders(
        uint256 _dividendID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return EquityStorageWrapper.getDividendHolders(_dividendID, _pageIndex, _pageLength);
    }

    function getTotalDividendHolders(uint256 _dividendID) external view returns (uint256) {
        return EquityStorageWrapper.getTotalDividendHolders(_dividendID);
    }

    function getVoting(uint256 _voteID) external view override returns (RegisteredVoting memory registeredVoting_) {
        CorporateActionsStorageWrapper.requireMatchingActionType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1);
        return EquityStorageWrapper.getVoting(_voteID);
    }

    function getVotingFor(
        uint256 _voteID,
        address _account
    ) external view override returns (VotingFor memory votingFor_) {
        CorporateActionsStorageWrapper.requireMatchingActionType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1);
        return EquityStorageWrapper.getVotingFor(_voteID, _account);
    }

    function getVotingCount() external view override returns (uint256 votingCount_) {
        return EquityStorageWrapper.getVotingCount();
    }

    function getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return EquityStorageWrapper.getVotingHolders(_voteID, _pageIndex, _pageLength);
    }

    function getTotalVotingHolders(uint256 _voteID) external view returns (uint256) {
        return EquityStorageWrapper.getTotalVotingHolders(_voteID);
    }

    function getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    ) external view override returns (ScheduledBalanceAdjustment memory balanceAdjustment_) {
        CorporateActionsStorageWrapper.requireMatchingActionType(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            _balanceAdjustmentID - 1
        );
        return EquityStorageWrapper.getScheduledBalanceAdjustment(_balanceAdjustmentID);
    }

    function getScheduledBalanceAdjustmentCount() external view override returns (uint256 balanceAdjustmentCount_) {
        return EquityStorageWrapper.getScheduledBalanceAdjustmentsCount();
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initializeEquity(EquityDetailsData calldata _equityDetailsData) internal {
        EquityDataStorage storage equityStorage = EquityStorageWrapper.equityStorage();
        equityStorage.initialized = true;
        EquityStorageWrapper.storeEquityDetails(_equityDetailsData);
    }
}
