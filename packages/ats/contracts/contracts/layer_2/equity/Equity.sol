// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {_CORPORATE_ACTION_ROLE} from '../../layer_1/constants/roles.sol';
import {
    DIVIDEND_CORPORATE_ACTION_TYPE,
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE
} from '../constants/values.sol';
import {IEquity} from '../interfaces/equity/IEquity.sol';
import {Common} from '../../layer_1/common/Common.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

abstract contract Equity is IEquity, Common {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function setDividends(
        Dividend calldata _newDividend
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        validateDates(_newDividend.recordDate, _newDividend.executionDate)
        onlyValidTimestamp(_newDividend.recordDate)
        returns (bool success_, uint256 dividendID_)
    {
        bytes32 corporateActionID;
        (success_, corporateActionID, dividendID_) = _setDividends(
            _newDividend
        );
        emit DividendSet(
            corporateActionID,
            dividendID_,
            _msgSender(),
            _newDividend.recordDate,
            _newDividend.executionDate,
            _newDividend.amount
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
        returns (bool success_, uint256 voteID_)
    {
        bytes32 corporateActionID;
        (success_, corporateActionID, voteID_) = _setVoting(_newVoting);
        emit VotingSet(
            corporateActionID,
            voteID_,
            _msgSender(),
            _newVoting.recordDate,
            _newVoting.data
        );
    }

    function getEquityDetails()
        external
        view
        override
        returns (EquityDetailsData memory equityDetailsData_)
    {
        return _getEquityDetails();
    }

    function getDividends(
        uint256 _dividendID
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1)
        returns (RegisteredDividend memory registeredDividend_)
    {
        return _getDividends(_dividendID);
    }

    function getDividendsFor(
        uint256 _dividendID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1)
        returns (DividendFor memory dividendFor_)
    {
        return _getDividendsFor(_dividendID, _account);
    }

    function getDividendsCount()
        external
        view
        override
        returns (uint256 dividendCount_)
    {
        return _getDividendsCount();
    }

    function getDividendHolders(
        uint256 _dividendID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return _getDividendHolders(_dividendID, _pageIndex, _pageLength);
    }

    function getTotalDividendHolders(
        uint256 _dividendID
    ) external view returns (uint256) {
        return _getTotalDividendHolders(_dividendID);
    }

    function getVoting(
        uint256 _voteID
    )
        external
        view
        override
        onlyMatchingActionType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1)
        returns (RegisteredVoting memory registeredVoting_)
    {
        return _getVoting(_voteID);
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

    function getVotingCount()
        external
        view
        override
        returns (uint256 votingCount_)
    {
        return _getVotingCount();
    }

    function getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return _getVotingHolders(_voteID, _pageIndex, _pageLength);
    }

    function getTotalVotingHolders(
        uint256 _voteID
    ) external view returns (uint256) {
        return _getTotalVotingHolders(_voteID);
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initializeEquity(
        EquityDetailsData calldata _equityDetailsData
    ) internal {
        EquityDataStorage storage equityStorage = _equityStorage();
        equityStorage.initialized = true;
        _storeEquityDetails(_equityDetailsData);
    }
}
