// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Votes } from "../../interfaces/ERC1400/IERC20Votes.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import { LibCheckpoints } from "../../../../infrastructure/lib/LibCheckpoints.sol";
// solhint-disable max-line-length
import {
    IScheduledCrossOrderedTasks
} from "../../../assetCapabilities/interfaces/scheduledTasks/scheduledCrossOrderedTasks/IScheduledCrossOrderedTasks.sol";
// solhint-enable max-line-length
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibERC20Votes } from "../../../../lib/domain/LibERC20Votes.sol";
import { LibABAF } from "../../../../lib/domain/LibABAF.sol";
import { HoldOps } from "../../../../lib/orchestrator/HoldOps.sol";
import { TimestampProvider } from "../../../../infrastructure/lib/TimestampProvider.sol";

abstract contract ERC20Votes is IERC20Votes, TimestampProvider {
    error AlreadyInitialized();
    error BrokenClockMode();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20Votes(bool _activated) external override {
        if (LibERC20Votes.isInitialized()) revert AlreadyInitialized();
        LibERC20Votes.initialize(_activated);
    }

    function delegate(address _delegatee) external override {
        LibPause.requireNotPaused();

        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
        LibERC20Votes.takeAbafCheckpoint(LibABAF.getAbaf(), _getBlockNumber());

        address currentDelegate = LibERC20Votes.getDelegate(msg.sender);
        if (currentDelegate == _delegatee) return;

        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
        LibERC20Votes.takeAbafCheckpoint(LibABAF.getAbaf(), _getBlockNumber());

        uint256 delegatorBalance = HoldOps.getTotalBalanceForAdjustedAt(msg.sender, _getBlockTimestamp());

        LibERC20Votes.delegateAndEmit(msg.sender, _delegatee, currentDelegate);
        LibERC20Votes.moveVotingPower(currentDelegate, _delegatee, delegatorBalance, _getBlockNumber());
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
        return LibERC20Votes.getVotes(_account, _getBlockNumber());
    }

    function getPastVotes(address _account, uint256 _timepoint) external view override returns (uint256) {
        return LibERC20Votes.getPastVotes(_account, _timepoint, _getBlockNumber());
    }

    function getPastTotalSupply(uint256 _timepoint) external view override returns (uint256) {
        return LibERC20Votes.getPastTotalSupply(_timepoint, _getBlockNumber());
    }

    function delegates(address _account) external view override returns (address) {
        return LibERC20Votes.getDelegate(_account);
    }

    function checkpoints(
        address _account,
        uint256 _pos
    ) external view override returns (LibCheckpoints.Checkpoint memory) {
        return LibERC20Votes.getCheckpoint(_account, _pos);
    }

    function numCheckpoints(address _account) external view override returns (uint256) {
        return LibERC20Votes.getNumCheckpoints(_account);
    }

    function isActivated() external view returns (bool) {
        return LibERC20Votes.isActivated();
    }
}
