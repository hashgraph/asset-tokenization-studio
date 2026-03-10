// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Votes } from "../../ERC1400/ERC20Votes/IERC20Votes.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import { Checkpoints } from "../../../../infrastructure/utils/Checkpoints.sol";
// solhint-disable max-line-length
import {
    IScheduledCrossOrderedTasks
} from "../../../asset/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol";
// solhint-enable max-line-length
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { ERC20VotesStorageWrapper } from "../../../../domain/asset/ERC20VotesStorageWrapper.sol";
import { ABAFStorageWrapper } from "../../../../domain/asset/ABAFStorageWrapper.sol";
import { HoldOps } from "../../../../domain/orchestrator/HoldOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ERC20Votes is IERC20Votes, TimestampProvider {
    error AlreadyInitialized();
    error BrokenClockMode();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20Votes(bool _activated) external override {
        if (ERC20VotesStorageWrapper.isInitialized()) revert AlreadyInitialized();
        ERC20VotesStorageWrapper.initialize(_activated);
    }

    function delegate(address _delegatee) external override {
        PauseStorageWrapper.requireNotPaused();

        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
        ERC20VotesStorageWrapper.takeAbafCheckpoint(ABAFStorageWrapper.getAbaf(), _getBlockNumber());

        address currentDelegate = ERC20VotesStorageWrapper.getDelegate(msg.sender);
        if (currentDelegate == _delegatee) return;

        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
        ERC20VotesStorageWrapper.takeAbafCheckpoint(ABAFStorageWrapper.getAbaf(), _getBlockNumber());

        uint256 delegatorBalance = HoldOps.getTotalBalanceForAdjustedAt(msg.sender, _getBlockTimestamp());

        ERC20VotesStorageWrapper.delegateAndEmit(msg.sender, _delegatee, currentDelegate);
        ERC20VotesStorageWrapper.moveVotingPower(currentDelegate, _delegatee, delegatorBalance, _getBlockNumber());
    }

    function clock() external view override returns (uint48) {
        return SafeCast.toUint48(_getBlockNumber());
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() external view override returns (string memory) {
        if (SafeCast.toUint48(_getBlockNumber()) != _getBlockNumber()) {
            revert BrokenClockMode();
        }
        return "mode=blocknumber&from=default";
    }

    function getVotes(address _account) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getVotes(_account, _getBlockNumber());
    }

    function getPastVotes(address _account, uint256 _timepoint) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getPastVotes(_account, _timepoint, _getBlockNumber());
    }

    function getPastTotalSupply(uint256 _timepoint) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getPastTotalSupply(_timepoint, _getBlockNumber());
    }

    function delegates(address _account) external view override returns (address) {
        return ERC20VotesStorageWrapper.getDelegate(_account);
    }

    function checkpoints(
        address _account,
        uint256 _pos
    ) external view override returns (Checkpoints.Checkpoint memory) {
        return ERC20VotesStorageWrapper.getCheckpoint(_account, _pos);
    }

    function numCheckpoints(address _account) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getNumCheckpoints(_account);
    }

    function isActivated() external view returns (bool) {
        return ERC20VotesStorageWrapper.isActivated();
    }
}
