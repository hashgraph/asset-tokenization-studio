// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import {IEquity} from '../interfaces/equity/IEquity.sol';
import {
    DIVIDEND_CORPORATE_ACTION_TYPE,
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE
} from '../constants/values.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {_CORPORATE_ACTION_ROLE} from '../../layer_1/constants/roles.sol';
import {EquityStorageWrapper} from './EquityStorageWrapper.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/diamond/IStaticFunctionSelectors.sol';

abstract contract Equity is
    IEquity,
    IStaticFunctionSelectors,
    EquityStorageWrapper
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initializeEquity(
        EquityDetailsData calldata _equityDetailsData
    ) internal returns (bool success_) {
        EquityDataStorage storage equityStorage = _equityStorage();
        equityStorage.initialized = true;
        success_ = _storeEquityDetails(_equityDetailsData);
    }

    function getEquityDetails()
        external
        view
        override
        returns (EquityDetailsData memory equityDetailsData_)
    {
        return _getEquityDetails();
    }

    function setDividends(
        Dividend calldata _newDividend
    )
        external
        virtual
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        checkDates(_newDividend.recordDate, _newDividend.executionDate)
        checkTimestamp(_newDividend.recordDate)
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

    /**
     * @dev returns the properties and related snapshots (if any) of a dividend.
     *
     * @param _dividendID The dividend Id
     */
    function getDividends(
        uint256 _dividendID
    )
        external
        view
        virtual
        override
        checkIndexForCorporateActionByType(
            DIVIDEND_CORPORATE_ACTION_TYPE,
            _dividendID - 1
        )
        returns (RegisteredDividend memory registeredDividend_)
    {
        return _getDividends(_dividendID);
    }

    /**
     * @dev returns the dividends for an account.
     *
     * @param _dividendID The dividend Id
     * @param _account The account
     */
    function getDividendsFor(
        uint256 _dividendID,
        address _account
    )
        external
        view
        virtual
        override
        checkIndexForCorporateActionByType(
            DIVIDEND_CORPORATE_ACTION_TYPE,
            _dividendID - 1
        )
        returns (DividendFor memory dividendFor_)
    {
        return _getDividendsFor(_dividendID, _account);
    }

    /**
     * @dev returns the dividends count.
     *
     */
    function getDividendsCount()
        external
        view
        virtual
        override
        returns (uint256 dividendCount_)
    {
        return _getDividendsCount();
    }

    function setVoting(
        Voting calldata _newVoting
    )
        external
        virtual
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        checkTimestamp(_newVoting.recordDate)
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

    function getVoting(
        uint256 _voteID
    )
        external
        view
        virtual
        override
        checkIndexForCorporateActionByType(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            _voteID - 1
        )
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
        virtual
        override
        checkIndexForCorporateActionByType(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            _voteID - 1
        )
        returns (VotingFor memory votingFor_)
    {
        return _getVotingFor(_voteID, _account);
    }

    function getVotingCount()
        external
        view
        virtual
        override
        returns (uint256 votingCount_)
    {
        return _getVotingCount();
    }
}
