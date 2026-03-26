// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE
} from "../../../constants/values.sol";
import { IVoting } from "../../../facets/layer_2/voting/IVoting.sol";
import { IVotingStorageWrapper } from "./IVotingStorageWrapper.sol";
import { BondStorageWrapper } from "../bond/BondStorageWrapper.sol";

abstract contract VotingStorageWrapper is IVotingStorageWrapper, BondStorageWrapper {
    function _setVoting(
        IVoting.Voting calldata _newVoting
    ) internal override returns (bytes32 corporateActionId_, uint256 voteID_) {
        bytes memory data = abi.encode(_newVoting);

        (corporateActionId_, voteID_) = _addCorporateAction(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, data);

        _initVotingRights(corporateActionId_, data);
    }

    function _cancelVoting(uint256 _voteId) internal override returns (bool success_) {
        IVoting.RegisteredVoting memory registeredVoting;
        bytes32 corporateActionId;
        (registeredVoting, corporateActionId, ) = _getVoting(_voteId);
        if (registeredVoting.voting.recordDate <= _blockTimestamp()) {
            revert IVotingStorageWrapper.VotingAlreadyRecorded(corporateActionId, _voteId);
        }
        _cancelCorporateAction(corporateActionId);
        success_ = true;
        emit VotingCancelled(_voteId, _msgSender());
    }

    function _initVotingRights(bytes32 _actionId, bytes memory _data) internal override {
        if (_actionId == bytes32(0)) {
            revert IVotingStorageWrapper.VotingRightsCreationFailed();
        }

        IVoting.Voting memory newVoting = abi.decode(_data, (IVoting.Voting));

        _addScheduledCrossOrderedTask(newVoting.recordDate, SNAPSHOT_TASK_TYPE);
        _addScheduledSnapshot(newVoting.recordDate, _actionId);
    }

    function _getVoting(
        uint256 _voteID
    )
        internal
        view
        override
        returns (IVoting.RegisteredVoting memory registeredVoting_, bytes32 corporateActionId_, bool isDisabled_)
    {
        corporateActionId_ = _getCorporateActionIdByTypeIndex(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1);

        bytes memory data;
        (, , data, isDisabled_) = _getCorporateAction(corporateActionId_);

        assert(data.length > 0);
        (registeredVoting_.voting) = abi.decode(data, (IVoting.Voting));

        registeredVoting_.snapshotId = _getUintResultAt(corporateActionId_, SNAPSHOT_RESULT_ID);
    }

    function _getVotingFor(
        uint256 _voteID,
        address _account
    ) internal view override returns (IVoting.VotingFor memory votingFor_) {
        (IVoting.RegisteredVoting memory registeredVoting, , bool isDisabled_) = _getVoting(_voteID);

        votingFor_.recordDate = registeredVoting.voting.recordDate;
        votingFor_.data = registeredVoting.voting.data;
        votingFor_.isDisabled = isDisabled_;

        (
            votingFor_.tokenBalance,
            votingFor_.decimals,
            votingFor_.recordDateReached
        ) = _getSnapshotTakenBalance(
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
        IVoting.RegisteredVoting memory registeredVoting;
        (registeredVoting, , ) = _getVoting(_voteID);

        if (registeredVoting.voting.recordDate >= _blockTimestamp()) return new address[](0);

        if (registeredVoting.snapshotId != 0)
            return _tokenHoldersAt(registeredVoting.snapshotId, _pageIndex, _pageLength);

        return _getTokenHolders(_pageIndex, _pageLength);
    }

    function _getTotalVotingHolders(uint256 _voteID) internal view override returns (uint256) {
        IVoting.RegisteredVoting memory registeredVoting;
        (registeredVoting, , ) = _getVoting(_voteID);

        if (registeredVoting.voting.recordDate >= _blockTimestamp()) return 0;

        if (registeredVoting.snapshotId != 0) return _totalTokenHoldersAt(registeredVoting.snapshotId);

        return _getTotalTokenHolders();
    }
}
