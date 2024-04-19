pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution
import {
    CorporateActionsStorageWrapper
} from '../../layer_1/corporateActions/CorporateActionsStorageWrapper.sol';
import {
    DIVIDEND_CORPORATE_ACTION_TYPE,
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    COUPON_CORPORATE_ACTION_TYPE,
    SNAPSHOT_RESULT_ID
} from '../constants/values.sol';
import {
    IEquityStorageWrapper
} from '../interfaces/equity/IEquityStorageWrapper.sol';
import {IBondStorageWrapper} from '../interfaces/bond/IBondStorageWrapper.sol';
import {
    ICorporateActionsStorageWrapperSecurity
} from '../interfaces/corporateActions/ICorporateActionsStorageWrapperSecurity.sol';
import {IEquity} from '../interfaces/equity/IEquity.sol';
import {
    ScheduledSnapshotsStorageWrapper
} from '../scheduledSnapshots/ScheduledSnapshotsStorageWrapper.sol';

abstract contract CorporateActionsStorageWrapperSecurity is
    ICorporateActionsStorageWrapperSecurity,
    IEquityStorageWrapper,
    IBondStorageWrapper,
    CorporateActionsStorageWrapper,
    ScheduledSnapshotsStorageWrapper
{
    modifier checkDates(uint256 firstDate, uint256 secondDate) {
        if (secondDate < firstDate) {
            revert WrongDates(firstDate, secondDate);
        }
        _;
    }

    function _addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    )
        internal
        virtual
        override
        returns (
            bool success_,
            bytes32 corporateActionId_,
            uint256 corporateActionIndexByType_
        )
    {
        (success_, corporateActionId_, corporateActionIndexByType_) = super
            ._addCorporateAction(_actionType, _data);

        if (_actionType == DIVIDEND_CORPORATE_ACTION_TYPE) {
            _initDividend(success_, corporateActionId_, _data);
        } else if (_actionType == VOTING_RIGHTS_CORPORATE_ACTION_TYPE) {
            _initVotingRights(success_, corporateActionId_, _data);
        } else if (_actionType == COUPON_CORPORATE_ACTION_TYPE) {
            _initCoupon(success_, corporateActionId_, _data);
        }
    }

    function _initDividend(
        bool _success,
        bytes32 _actionId,
        bytes memory _data
    ) private {
        if (!_success) {
            revert DividendCreationFailed();
        }

        IEquity.Dividend memory newDividend = abi.decode(
            _data,
            (IEquity.Dividend)
        );

        _addScheduledSnapshot(newDividend.recordDate, abi.encode(_actionId));
    }

    function _initVotingRights(
        bool _success,
        bytes32 _actionId,
        bytes memory _data
    ) private {
        if (!_success) {
            revert VotingRightsCreationFailed();
        }

        IEquity.Voting memory newVoting = abi.decode(_data, (IEquity.Voting));

        _addScheduledSnapshot(newVoting.recordDate, abi.encode(_actionId));
    }

    function _initCoupon(
        bool _success,
        bytes32 _actionId,
        bytes memory _data
    ) private {
        if (!_success) {
            revert CouponCreationFailed();
        }

        uint256 recordDate = abi.decode(_data, (uint256));

        _addScheduledSnapshot(recordDate, abi.encode(_actionId));
    }

    function _onScheduledSnapshotTriggered(
        uint256 snapShotID,
        bytes memory data
    ) internal virtual override {
        bytes32 actionId;
        if (data.length > 0) actionId = abi.decode(data, (bytes32));

        _addSnapshotToAction(actionId, snapShotID);
    }

    function _addSnapshotToAction(
        bytes32 actionId,
        uint256 snapshotId
    ) internal virtual {
        bytes memory result = abi.encodePacked(snapshotId);

        _updateCorporateActionResult(actionId, SNAPSHOT_RESULT_ID, result);
    }

    function _getSnapshotID(
        bytes32 actionId
    ) internal view virtual returns (uint256) {
        bytes memory data = _getResult(actionId, SNAPSHOT_RESULT_ID);

        uint256 bytesLength = data.length;

        if (bytesLength < 32) return 0;

        uint256 snapshotId;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            snapshotId := mload(add(data, 0x20))
        }

        return snapshotId;
    }
}
