// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import {
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE
} from "../../../constants/values.sol";
import { IEquity } from "./IEquity.sol";
import { Common } from "../../../domain/Common.sol";

abstract contract Equity is IEquity, Common {
    function cancelVoting(
        uint256 _voteId
    ) external override onlyUnpaused onlyRole(_CORPORATE_ACTION_ROLE) returns (bool success_) {
        (success_) = _cancelVoting(_voteId);
    }

    function cancelScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentId
    ) external override onlyUnpaused onlyRole(_CORPORATE_ACTION_ROLE) returns (bool success_) {
        (success_) = _cancelScheduledBalanceAdjustment(_balanceAdjustmentId);
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
        (corporateActionID, voteID_) = _setVoting(_newVoting);
        emit VotingSet(corporateActionID, voteID_, _msgSender(), _newVoting.recordDate, _newVoting.data);
    }

    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidTimestamp(_newBalanceAdjustment.executionDate)
        validateFactor(_newBalanceAdjustment.factor)
        returns (uint256 balanceAdjustmentID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, balanceAdjustmentID_) = _setScheduledBalanceAdjustment(_newBalanceAdjustment);
        emit ScheduledBalanceAdjustmentSet(
            corporateActionID,
            balanceAdjustmentID_,
            _msgSender(),
            _newBalanceAdjustment.executionDate,
            _newBalanceAdjustment.factor,
            _newBalanceAdjustment.decimals
        );
    }

    function getEquityDetails() external view override returns (EquityDetailsData memory equityDetailsData_) {
        return _getEquityDetails();
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
        (registeredVoting_, , isDisabled_) = _getVoting(_voteID);
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
        return _getVotingFor(_voteID, _account);
    }

    function getVotingCount() external view override returns (uint256 votingCount_) {
        return _getVotingCount();
    }

    function getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return _getVotingHolders(_voteID, _pageIndex, _pageLength);
    }

    function getTotalVotingHolders(uint256 _voteID) external view returns (uint256) {
        return _getTotalVotingHolders(_voteID);
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
        (balanceAdjustment_, , isDisabled_) = _getScheduledBalanceAdjustment(_balanceAdjustmentID);
    }

    function getScheduledBalanceAdjustmentCount() external view override returns (uint256 balanceAdjustmentCount_) {
        return _getScheduledBalanceAdjustmentsCount();
    }
}
