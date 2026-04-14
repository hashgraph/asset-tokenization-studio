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
import { EquityStorageWrapper } from "../../../domain/asset/EquityStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract Equity is IEquity, Modifiers {
    function setDividend(
        Dividend calldata _newDividend
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidDates(_newDividend.recordDate, _newDividend.executionDate)
        onlyValidTimestamp(_newDividend.recordDate)
        returns (uint256 dividendID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, dividendID_) = EquityStorageWrapper.setDividends(_newDividend);
        emit IEquity.DividendSet(
            corporateActionID,
            dividendID_,
            EvmAccessors.getMsgSender(),
            _newDividend.recordDate,
            _newDividend.executionDate,
            _newDividend.amount,
            _newDividend.amountDecimals
        );
    }

    function setVoting(
        Voting calldata _newVoting
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidTimestamp(_newVoting.recordDate)
        returns (uint256 voteID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, voteID_) = EquityStorageWrapper.setVoting(_newVoting);
        emit IEquity.VotingSet(
            corporateActionID,
            voteID_,
            EvmAccessors.getMsgSender(),
            _newVoting.recordDate,
            _newVoting.data
        );
    }

    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidTimestamp(_newBalanceAdjustment.executionDate)
        onlyValidFactor(_newBalanceAdjustment.factor)
        returns (uint256 balanceAdjustmentID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, balanceAdjustmentID_) = EquityStorageWrapper.setScheduledBalanceAdjustment(
            _newBalanceAdjustment
        );
        emit IEquity.ScheduledBalanceAdjustmentSet(
            corporateActionID,
            balanceAdjustmentID_,
            EvmAccessors.getMsgSender(),
            _newBalanceAdjustment.executionDate,
            _newBalanceAdjustment.factor,
            _newBalanceAdjustment.decimals
        );
    }

    function cancelDividend(
        uint256 _dividendId
    ) external override onlyUnpaused onlyRole(_CORPORATE_ACTION_ROLE) returns (bool success_) {
        (success_) = EquityStorageWrapper.cancelDividend(_dividendId);
        if (success_) {
            emit IEquity.DividendCancelled(_dividendId, EvmAccessors.getMsgSender());
        }
    }

    function cancelVoting(
        uint256 _voteId
    ) external override onlyUnpaused onlyRole(_CORPORATE_ACTION_ROLE) returns (bool success_) {
        (success_) = EquityStorageWrapper.cancelVoting(_voteId);
        if (success_) {
            emit IEquity.VotingCancelled(_voteId, EvmAccessors.getMsgSender());
        }
    }

    function cancelScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentId
    ) external override onlyUnpaused onlyRole(_CORPORATE_ACTION_ROLE) returns (bool success_) {
        (success_) = EquityStorageWrapper.cancelScheduledBalanceAdjustment(_balanceAdjustmentId);
        if (success_) {
            emit IEquity.ScheduledBalanceAdjustmentCancelled(_balanceAdjustmentId, EvmAccessors.getMsgSender());
        }
    }

    function getEquityDetails() external view override returns (EquityDetailsData memory equityDetailsData_) {
        return EquityStorageWrapper.getEquityDetails();
    }

    function getDividend(
        uint256 _dividendID
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1)
        returns (RegisteredDividend memory registeredDividend_, bool isDisabled_)
    {
        (registeredDividend_, , isDisabled_) = EquityStorageWrapper.getDividends(_dividendID);
    }

    function getDividendFor(
        uint256 _dividendID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1)
        returns (DividendFor memory dividendFor_)
    {
        return EquityStorageWrapper.getDividendsFor(_dividendID, _account);
    }

    function getDividendAmountFor(
        uint256 _dividendID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1)
        returns (DividendAmountFor memory dividendAmountFor_)
    {
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

    function getVoting(
        uint256 _voteID
    )
        external
        view
        override
        onlyMatchingActionType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1)
        returns (RegisteredVoting memory registeredVoting_, bool isDisabled_)
    {
        (registeredVoting_, , isDisabled_) = EquityStorageWrapper.getVoting(_voteID);
    }

    function getVotingFor(
        uint256 _voteID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1)
        returns (VotingFor memory votingFor_)
    {
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
    )
        external
        view
        override
        onlyMatchingActionType(BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE, _balanceAdjustmentID - 1)
        returns (ScheduledBalanceAdjustment memory balanceAdjustment_, bool isDisabled_)
    {
        (balanceAdjustment_, , isDisabled_) = EquityStorageWrapper.getScheduledBalanceAdjustment(_balanceAdjustmentID);
    }

    function getScheduledBalanceAdjustmentCount() external view override returns (uint256 balanceAdjustmentCount_) {
        return EquityStorageWrapper.getScheduledBalanceAdjustmentsCount();
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initializeEquity(EquityDetailsData calldata _equityDetailsData) internal {
        EquityStorageWrapper.initializeEquityDetails(_equityDetailsData);
    }
}
