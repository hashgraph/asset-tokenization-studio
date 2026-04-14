// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    SNAPSHOT_TASK_TYPE,
    SNAPSHOT_RESULT_ID,
    KPI_EQUITY_VOTING_DATA
} from "../../constants/values.sol";
import { IVoting } from "../../facets/layer_2/voting/IVoting.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

library VotingStorageWrapper {
    function setVoting(
        IVoting.Voting calldata newVoting
    ) internal returns (bytes32 corporateActionId_, uint256 voteID_) {
        bytes memory data = abi.encode(newVoting);

        (corporateActionId_, voteID_) = CorporateActionsStorageWrapper.addCorporateAction(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            data
        );

        initVotingRights(corporateActionId_, data);
    }

    function initVotingRights(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IVoting.VotingRightsCreationFailed();
        }

        IVoting.Voting memory newVoting = abi.decode(data, (IVoting.Voting));

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newVoting.recordDate, SNAPSHOT_TASK_TYPE);
        ScheduledTasksStorageWrapper.addScheduledSnapshot(newVoting.recordDate, actionId);
    }

    function cancelVoting(uint256 voteId) internal returns (bool success_) {
        IVoting.RegisteredVoting memory registeredVoting;
        bytes32 corporateActionId;
        (registeredVoting, corporateActionId, ) = getVoting(voteId);
        if (registeredVoting.voting.recordDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IVoting.VotingAlreadyRecorded(corporateActionId, voteId);
        }
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        success_ = true;
    }

    function getVoting(
        uint256 voteID
    )
        internal
        view
        returns (IVoting.RegisteredVoting memory registeredVoting_, bytes32 corporateActionId_, bool isDisabled_)
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            voteID - 1
        );

        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        _checkUnexpectedError(data.length == 0, KPI_EQUITY_VOTING_DATA);
        (registeredVoting_.voting) = abi.decode(data, (IVoting.Voting));

        registeredVoting_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(
            corporateActionId_,
            SNAPSHOT_RESULT_ID
        );
    }

    function getVotingFor(uint256 voteID, address account) internal view returns (IVoting.VotingFor memory votingFor_) {
        (IVoting.RegisteredVoting memory registeredVoting, , ) = getVoting(voteID);

        votingFor_.recordDate = registeredVoting.voting.recordDate;
        votingFor_.data = registeredVoting.voting.data;

        (
            votingFor_.tokenBalance,
            votingFor_.decimals,
            votingFor_.recordDateReached
        ) = getSnapshotBalanceForIfDateReached(
            registeredVoting.voting.recordDate,
            registeredVoting.snapshotId,
            account
        );
    }

    function getVotingCount() internal view returns (uint256 votingCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE);
    }

    function getVotingHolders(
        uint256 voteID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory holders_) {
        (IVoting.RegisteredVoting memory registeredVoting, , ) = getVoting(voteID);

        if (registeredVoting.voting.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return holders_;

        if (registeredVoting.snapshotId != 0)
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredVoting.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper.getTokenHolders(pageIndex, pageLength);
    }

    function getTotalVotingHolders(uint256 voteID) internal view returns (uint256) {
        (IVoting.RegisteredVoting memory registeredVoting, , ) = getVoting(voteID);

        if (registeredVoting.voting.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;

        if (registeredVoting.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredVoting.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function getSnapshotBalanceForIfDateReached(
        uint256 date,
        uint256 snapshotId,
        address account
    ) internal view returns (uint256 balance_, uint8 decimals_, bool dateReached_) {
        if (date >= TimeTravelStorageWrapper.getBlockTimestamp()) return (balance_, decimals_, dateReached_);
        dateReached_ = true;

        balance_ = (snapshotId != 0)
            ? SnapshotsStorageWrapper.getTotalBalanceOfAtSnapshot(snapshotId, account)
            : ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(account, date);

        decimals_ = (snapshotId != 0)
            ? SnapshotsStorageWrapper.decimalsAtSnapshot(snapshotId)
            : ERC20StorageWrapper.decimalsAdjustedAt(date);
    }
}
