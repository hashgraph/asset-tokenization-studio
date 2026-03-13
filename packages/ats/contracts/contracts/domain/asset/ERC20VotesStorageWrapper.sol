// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20VOTES_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IERC20Votes } from "../../facets/layer_1/ERC1400/ERC20Votes/IERC20Votes.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import { Checkpoints } from "../../infrastructure/utils/Checkpoints.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";

// solhint-disable custom-errors

struct ERC20VotesStorage {
    bool activated;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractName;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractVersion;
    mapping(address => address) delegates;
    mapping(address => Checkpoints.Checkpoint[]) checkpoints;
    Checkpoints.Checkpoint[] totalSupplyCheckpoints;
    Checkpoints.Checkpoint[] abafCheckpoints;
    bool initialized;
}

library ERC20VotesStorageWrapper {
    using Checkpoints for Checkpoints.Checkpoint[];

    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);

    event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC20Votes(bool activated) internal {
        ERC20VotesStorage storage erc20VotesStorage = _erc20VotesStorage_();
        _setActivate(activated);
        erc20VotesStorage.initialized = true;
    }

    function _setActivate(bool activated) internal {
        _erc20VotesStorage_().activated = activated;
    }

    function _delegate(address delegatee) internal {
        _delegate(msg.sender, delegatee);
    }

    function _takeAbafCheckpoint() internal {
        ERC20VotesStorage storage erc20VotesStorage = _erc20VotesStorage_();

        uint256 abaf = AdjustBalancesStorageWrapper._getAbaf();

        uint256 pos = erc20VotesStorage.abafCheckpoints.length;

        if (pos != 0)
            if (erc20VotesStorage.abafCheckpoints[pos - 1].from == _clock()) {
                if (erc20VotesStorage.abafCheckpoints[pos - 1].value != abaf)
                    revert IERC20Votes.AbafChangeForBlockForbidden(_clock());
                return;
            }

        _erc20VotesStorage_().abafCheckpoints.push(Checkpoints.Checkpoint({ from: _clock(), value: abaf }));
    }

    function _afterTokenTransfer(bytes32 /*partition*/, address from, address to, uint256 amount) internal {
        ERC20VotesStorage storage erc20VotesStorage = _erc20VotesStorage_();

        if (_isActivated()) {
            _takeAbafCheckpoint();
            if (from == address(0)) {
                _writeCheckpoint(erc20VotesStorage.totalSupplyCheckpoints, true, amount);
                _moveVotingPower(address(0), _delegates(to), amount);
            } else if (to == address(0)) {
                _writeCheckpoint(erc20VotesStorage.totalSupplyCheckpoints, false, amount);
                _moveVotingPower(_delegates(from), address(0), amount);
            } else _moveVotingPower(_delegates(from), _delegates(to), amount);
        }
    }

    function _delegate(address delegator, address delegatee) internal {
        ScheduledTasksStorageWrapper._callTriggerPendingScheduledCrossOrderedTasks();

        _takeAbafCheckpoint();

        address currentDelegate = _delegates(delegator);

        if (currentDelegate == delegatee) return;

        ScheduledTasksStorageWrapper._triggerScheduledCrossOrderedTasks(0);

        _takeAbafCheckpoint();

        uint256 delegatorBalance = ERC3643StorageWrapper._getTotalBalanceForAdjustedAt(delegator, block.timestamp);

        _erc20VotesStorage_().delegates[delegator] = delegatee;

        emit DelegateChanged(delegator, currentDelegate, delegatee);

        _moveVotingPower(currentDelegate, delegatee, delegatorBalance);
    }

    function _moveVotingPower(address src, address dst, uint256 amount) internal {
        if (src != dst && amount > 0) {
            if (src != address(0)) {
                _moveVotingPower(src, true, amount);
            }

            if (dst != address(0)) {
                _moveVotingPower(dst, false, amount);
            }
        }
    }

    function _moveVotingPower(address account, bool isAdd, uint256 amount) internal {
        (uint256 oldWeight, uint256 newWeight) = _writeCheckpoint(
            _erc20VotesStorage_().checkpoints[account],
            isAdd,
            amount
        );
        emit DelegateVotesChanged(account, oldWeight, newWeight);
    }

    function _writeCheckpoint(
        Checkpoints.Checkpoint[] storage ckpts,
        bool isAdd,
        uint256 delta
    ) internal returns (uint256 oldWeight, uint256 newWeight) {
        uint256 pos = ckpts.length;

        unchecked {
            Checkpoints.Checkpoint memory oldCkpt = pos == 0 ? Checkpoints.Checkpoint(0, 0) : ckpts[pos - 1];

            oldWeight = oldCkpt.value * _calculateFactorBetween(oldCkpt.from, _clock());
            newWeight = isAdd ? _add(oldWeight, delta) : _subtract(oldWeight, delta);

            if (pos > 0 && oldCkpt.from == _clock()) {
                ckpts[pos - 1].value = newWeight;
            } else {
                ckpts.push(Checkpoints.Checkpoint({ from: _clock(), value: newWeight }));
            }
        }
    }

    function _clock() internal view returns (uint48) {
        return SafeCast.toUint48(block.number);
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() internal view returns (string memory) {
        // Check that the clock was not modified
        require(_clock() == block.number, "ERC20Votes: broken clock mode");
        return "mode=blocknumber&from=default";
    }

    function _checkpoints(address account, uint256 pos) internal view returns (Checkpoints.Checkpoint memory) {
        return _erc20VotesStorage_().checkpoints[account][pos];
    }

    function _numCheckpoints(address account) internal view returns (uint256) {
        return _erc20VotesStorage_().checkpoints[account].length;
    }

    function _delegates(address account) internal view returns (address) {
        return _erc20VotesStorage_().delegates[account];
    }

    function _getVotes(address account) internal view returns (uint256) {
        return _getVotesAdjustedAt(_clock(), _erc20VotesStorage_().checkpoints[account]);
    }

    function _getPastVotes(address account, uint256 timepoint) internal view returns (uint256) {
        require(timepoint < _clock(), "ERC20Votes: future lookup");
        return _getVotesAdjustedAt(timepoint, _erc20VotesStorage_().checkpoints[account]);
    }

    function _getPastTotalSupply(uint256 timepoint) internal view returns (uint256) {
        require(timepoint < _clock(), "ERC20Votes: future lookup");
        return _getVotesAdjustedAt(timepoint, _erc20VotesStorage_().totalSupplyCheckpoints);
    }

    function _getVotesAdjustedAt(
        uint256 timepoint,
        Checkpoints.Checkpoint[] storage ckpts
    ) internal view returns (uint256) {
        (uint256 blockNumber, uint256 votes) = ckpts.checkpointsLookup(timepoint);

        return votes * _calculateFactorBetween(blockNumber, timepoint);
    }

    function _calculateFactorBetween(uint256 fromBlock, uint256 toBlock) internal view returns (uint256) {
        (, uint256 abafAtBlockFrom) = _erc20VotesStorage_().abafCheckpoints.checkpointsLookup(fromBlock);
        (, uint256 abafAtBlockTo) = _erc20VotesStorage_().abafCheckpoints.checkpointsLookup(toBlock);
        assert(abafAtBlockFrom <= abafAtBlockTo);

        if (abafAtBlockFrom == 0) return 1;

        return abafAtBlockTo / abafAtBlockFrom;
    }

    function _isActivated() internal view returns (bool) {
        return _erc20VotesStorage_().activated;
    }

    function _isERC20VotesInitialized() internal view returns (bool) {
        return _erc20VotesStorage_().initialized;
    }

    function _add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    function _subtract(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    function _erc20VotesStorage_() internal pure returns (ERC20VotesStorage storage erc20votesStorage_) {
        bytes32 position = _ERC20VOTES_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20votesStorage_.slot := position
        }
    }
}
