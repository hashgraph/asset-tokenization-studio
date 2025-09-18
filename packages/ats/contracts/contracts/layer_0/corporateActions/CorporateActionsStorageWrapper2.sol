// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {LibCommon} from '../../layer_0/common/libraries/LibCommon.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {
    DIVIDEND_CORPORATE_ACTION_TYPE,
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    COUPON_CORPORATE_ACTION_TYPE,
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
    SNAPSHOT_TASK_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE,
    SNAPSHOT_RESULT_ID
} from '../constants/values.sol';
import {
    AdjustBalancesStorageWrapper2
} from '../adjustBalances/AdjustBalancesStorageWrapper2.sol';
import {IEquity} from '../../layer_2/interfaces/equity/IEquity.sol';
import {IBondRead} from '../../layer_2/interfaces/bond/IBondRead.sol';
import {
    ICorporateActionsStorageWrapper,
    CorporateActionDataStorage
} from '../../layer_1/interfaces/corporateActions/ICorporateActionsStorageWrapper.sol';
import {
    IEquityStorageWrapper
} from '../../layer_2/interfaces/equity/IEquityStorageWrapper.sol';
import {
    IBondStorageWrapper
} from '../../layer_2/interfaces/bond/IBondStorageWrapper.sol';

abstract contract CorporateActionsStorageWrapper2 is
    AdjustBalancesStorageWrapper2
{
    using LibCommon for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    modifier onlyMatchingActionType(bytes32 _actionType, uint256 _index) {
        _checkMatchingActionType(_actionType, _index);
        _;
    }

    // Internal
    function _addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    )
        internal
        returns (
            bool success_,
            bytes32 corporateActionId_,
            uint256 corporateActionIndexByType_
        )
    {
        CorporateActionDataStorage
            storage corporateActions_ = _corporateActionsStorage();
        corporateActionId_ = bytes32(corporateActions_.actions.length() + 1);
        // TODO: Review when it can return false.
        success_ =
            corporateActions_.actions.add(corporateActionId_) &&
            corporateActions_.actionsByType[_actionType].add(
                corporateActionId_
            );
        corporateActions_
            .actionsData[corporateActionId_]
            .actionType = _actionType;
        corporateActions_.actionsData[corporateActionId_].data = _data;
        corporateActionIndexByType_ = _getCorporateActionCountByType(
            _actionType
        );
        _initByActionType(_actionType, success_, corporateActionId_, _data);
    }

    function _onScheduledTaskTriggered(bytes memory _data) internal {
        if (_data.length == 0) return;
        if (abi.decode(_data, (bytes32)) == SNAPSHOT_TASK_TYPE) {
            _triggerScheduledSnapshots(1);
            return;
        }
        _triggerScheduledBalanceAdjustments(1);
    }

    function _onScheduledBalanceAdjustmentTriggered(
        bytes memory _data
    ) internal {
        if (_data.length == 0) return;
        (, bytes memory balanceAdjustmentData) = _getCorporateAction(
            abi.decode(_data, (bytes32))
        );
        if (balanceAdjustmentData.length == 0) return;
        IEquity.ScheduledBalanceAdjustment memory balanceAdjustment = abi
            .decode(
                balanceAdjustmentData,
                (IEquity.ScheduledBalanceAdjustment)
            );
        _adjustBalances(balanceAdjustment.factor, balanceAdjustment.decimals);
    }

    function _getSnapshotID(bytes32 _actionId) internal view returns (uint256) {
        bytes memory data = _getResult(_actionId, SNAPSHOT_RESULT_ID);

        uint256 bytesLength = data.length;

        if (bytesLength < 32) return 0;

        uint256 snapshotId;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            snapshotId := mload(add(data, 0x20))
        }

        return snapshotId;
    }

    function _initByActionType(
        bytes32 _actionType,
        bool _success,
        bytes32 _corporateActionId,
        bytes memory _data
    ) private {
        if (_actionType == DIVIDEND_CORPORATE_ACTION_TYPE) {
            return _initDividend(_success, _corporateActionId, _data);
        }
        if (_actionType == VOTING_RIGHTS_CORPORATE_ACTION_TYPE) {
            return _initVotingRights(_success, _corporateActionId, _data);
        }
        if (_actionType == COUPON_CORPORATE_ACTION_TYPE) {
            return _initCoupon(_success, _corporateActionId, _data);
        }
        if (_actionType == BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE) {
            return _initBalanceAdjustment(_success, _corporateActionId, _data);
        }
    }

    function _initDividend(
        bool _success,
        bytes32 _actionId,
        bytes memory _data
    ) private {
        if (!_success) {
            revert IEquityStorageWrapper.DividendCreationFailed();
        }

        IEquity.Dividend memory newDividend = abi.decode(
            _data,
            (IEquity.Dividend)
        );

        _addScheduledTask(
            newDividend.recordDate,
            abi.encode(SNAPSHOT_TASK_TYPE)
        );
        _addScheduledSnapshot(newDividend.recordDate, abi.encode(_actionId));
    }

    function _initVotingRights(
        bool _success,
        bytes32 _actionId,
        bytes memory _data
    ) private {
        if (!_success) {
            revert IEquityStorageWrapper.VotingRightsCreationFailed();
        }

        IEquity.Voting memory newVoting = abi.decode(_data, (IEquity.Voting));

        _addScheduledTask(newVoting.recordDate, abi.encode(SNAPSHOT_TASK_TYPE));
        _addScheduledSnapshot(newVoting.recordDate, abi.encode(_actionId));
    }

    function _initCoupon(
        bool _success,
        bytes32 _actionId,
        bytes memory _data
    ) private {
        if (!_success) {
            revert IBondStorageWrapper.CouponCreationFailed();
        }

        IBondRead.Coupon memory newCoupon = abi.decode(
            _data,
            (IBondRead.Coupon)
        );

        _addScheduledTask(newCoupon.recordDate, abi.encode(SNAPSHOT_TASK_TYPE));
        _addScheduledSnapshot(newCoupon.recordDate, abi.encode(_actionId));
    }

    function _initBalanceAdjustment(
        bool _success,
        bytes32 _actionId,
        bytes memory _data
    ) private {
        if (!_success) {
            revert IEquityStorageWrapper.BalanceAdjustmentCreationFailed();
        }

        IEquity.ScheduledBalanceAdjustment memory newBalanceAdjustment = abi
            .decode(_data, (IEquity.ScheduledBalanceAdjustment));

        _addScheduledTask(
            newBalanceAdjustment.executionDate,
            abi.encode(BALANCE_ADJUSTMENT_TASK_TYPE)
        );
        _addScheduledBalanceAdjustment(
            newBalanceAdjustment.executionDate,
            abi.encode(_actionId)
        );
    }

    function _checkMatchingActionType(
        bytes32 _actionType,
        uint256 _index
    ) private view {
        if (_getCorporateActionCountByType(_actionType) <= _index)
            revert ICorporateActionsStorageWrapper.WrongIndexForAction(
                _index,
                _actionType
            );
    }
}
