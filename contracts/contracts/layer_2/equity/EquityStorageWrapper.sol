// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import {_EQUITY_STORAGE_POSITION} from '../constants/storagePositions.sol';
import {IEquity} from '../interfaces/equity/IEquity.sol';
import {
    CorporateActionsStorageWrapperSecurity
} from '../corporateActions/CorporateActionsStorageWrapperSecurity.sol';
import {
    DIVIDEND_CORPORATE_ACTION_TYPE,
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE
} from '../constants/values.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

abstract contract EquityStorageWrapper is
    CorporateActionsStorageWrapperSecurity
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct EquityDataStorage {
        IEquity.EquityDetailsData equityDetailsData;
        bool initialized;
    }

    function _storeEquityDetails(
        IEquity.EquityDetailsData memory _equityDetailsData
    ) internal returns (bool) {
        _equityStorage().equityDetailsData = _equityDetailsData;
        return true;
    }

    function _getEquityDetails()
        internal
        view
        returns (IEquity.EquityDetailsData memory equityDetails_)
    {
        equityDetails_ = _equityStorage().equityDetailsData;
    }

    function _setDividends(
        IEquity.Dividend calldata _newDividend
    )
        internal
        virtual
        returns (bool success_, bytes32 corporateActionId_, uint256 dividendId_)
    {
        (success_, corporateActionId_, dividendId_) = _addCorporateAction(
            DIVIDEND_CORPORATE_ACTION_TYPE,
            abi.encode(_newDividend)
        );
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a dividend.
     *
     * @param _dividendID The dividend Id
     * @param _dividendID The dividend Id
     */
    function _getDividends(
        uint256 _dividendID
    )
        internal
        view
        virtual
        returns (IEquity.RegisteredDividend memory registeredDividend_)
    {
        bytes32 actionId = _corporateActionsStorage()
            .actionsByType[DIVIDEND_CORPORATE_ACTION_TYPE]
            .at(_dividendID - 1);

        (, bytes memory data) = _getCorporateAction(actionId);

        if (data.length > 0) {
            (registeredDividend_.dividend) = abi.decode(
                data,
                (IEquity.Dividend)
            );
        }

        registeredDividend_.snapshotId = _getSnapshotID(actionId);
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
    ) internal view virtual returns (IEquity.DividendFor memory dividendFor_) {
        IEquity.RegisteredDividend memory registeredDividend = _getDividends(
            _dividendID
        );

        dividendFor_.amount = registeredDividend.dividend.amount;
        dividendFor_.recordDate = registeredDividend.dividend.recordDate;
        dividendFor_.executionDate = registeredDividend.dividend.executionDate;

        if (registeredDividend.dividend.recordDate < _blockTimestamp()) {
            dividendFor_.recordDateReached = true;

            dividendFor_.tokenBalance = (registeredDividend.snapshotId != 0)
                ? _balanceOfAtSnapshot(registeredDividend.snapshotId, _account)
                : _balanceOf(_account);
        }
    }

    function _getDividendsCount()
        internal
        view
        virtual
        returns (uint256 dividendCount_)
    {
        return _getCorporateActionCountByType(DIVIDEND_CORPORATE_ACTION_TYPE);
    }

    function _setVoting(
        IEquity.Voting calldata _newVoting
    )
        internal
        virtual
        returns (bool success_, bytes32 corporateActionId_, uint256 voteID_)
    {
        (success_, corporateActionId_, voteID_) = _addCorporateAction(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            abi.encode(_newVoting)
        );
    }

    function _getVoting(
        uint256 _voteID
    )
        internal
        view
        virtual
        returns (IEquity.RegisteredVoting memory registeredVoting_)
    {
        bytes32 actionId = _corporateActionsStorage()
            .actionsByType[VOTING_RIGHTS_CORPORATE_ACTION_TYPE]
            .at(_voteID - 1);

        (, bytes memory data) = _getCorporateAction(actionId);

        if (data.length > 0) {
            (registeredVoting_.voting) = abi.decode(data, (IEquity.Voting));
        }

        registeredVoting_.snapshotId = _getSnapshotID(actionId);
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
    ) internal view virtual returns (IEquity.VotingFor memory votingFor_) {
        IEquity.RegisteredVoting memory registeredVoting = _getVoting(_voteID);

        votingFor_.recordDate = registeredVoting.voting.recordDate;
        votingFor_.data = registeredVoting.voting.data;

        if (registeredVoting.voting.recordDate < _blockTimestamp()) {
            votingFor_.recordDateReached = true;

            votingFor_.tokenBalance = (registeredVoting.snapshotId != 0)
                ? _balanceOfAtSnapshot(registeredVoting.snapshotId, _account)
                : _balanceOf(_account);
        }
    }

    function _getVotingCount()
        internal
        view
        virtual
        returns (uint256 votingCount_)
    {
        return
            _getCorporateActionCountByType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE);
    }

    function _equityStorage()
        internal
        pure
        virtual
        returns (EquityDataStorage storage equityData_)
    {
        bytes32 position = _EQUITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            equityData_.slot := position
        }
    }
}
