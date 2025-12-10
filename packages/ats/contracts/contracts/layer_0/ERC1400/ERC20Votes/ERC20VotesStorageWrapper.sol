// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20VOTES_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ERC1594StorageWrapper } from "../ERC1594/ERC1594StorageWrapper.sol";
import { IERC20Votes } from "../../../layer_1/interfaces/ERC1400/IERC20Votes.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import { CheckpointsLib } from "../../common/libraries/CheckpointsLib.sol";

// solhint-disable custom-errors
abstract contract ERC20VotesStorageWrapper is ERC1594StorageWrapper {
    using CheckpointsLib for CheckpointsLib.Checkpoint[];

    struct ERC20VotesStorage {
        bool activated;
        string contractName;
        string contractVersion;
        mapping(address => address) delegates;
        mapping(address => CheckpointsLib.Checkpoint[]) checkpoints;
        CheckpointsLib.Checkpoint[] totalSupplyCheckpoints;
        CheckpointsLib.Checkpoint[] abafCheckpoints;
        bool initialized;
    }

    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);

    event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);

    function _setActivate(bool _activated) internal virtual {
        _erc20VotesStorage().activated = _activated;
    }

    function _delegate(address delegatee) internal virtual {
        _delegate(_msgSender(), delegatee);
    }

    function _takeAbafCheckpoint() internal {
        ERC20VotesStorage storage erc20VotesStorage = _erc20VotesStorage();

        uint256 abaf = _getAbaf();
        abaf = (abaf == 0) ? 1 : abaf;

        uint256 pos = erc20VotesStorage.abafCheckpoints.length;

        if (pos != 0)
            if (erc20VotesStorage.abafCheckpoints[pos - 1].from == _clock()) {
                if (erc20VotesStorage.abafCheckpoints[pos - 1].value != abaf)
                    revert IERC20Votes.AbafChangeForBlockForbidden(_clock());
                return;
            }

        _erc20VotesStorage().abafCheckpoints.push(CheckpointsLib.Checkpoint({ from: _clock(), value: abaf }));
    }

    function _afterTokenTransfer(
        bytes32 /*partition*/,
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        ERC20VotesStorage storage erc20VotesStorage = _erc20VotesStorage();

        if (_isActivated()) {
            _takeAbafCheckpoint();
            if (from == address(0)) {
                _writeCheckpoint(erc20VotesStorage.totalSupplyCheckpoints, _add, amount);
                _moveVotingPower(address(0), _delegates(to), amount);
            } else if (to == address(0)) {
                _writeCheckpoint(erc20VotesStorage.totalSupplyCheckpoints, _subtract, amount);
                _moveVotingPower(_delegates(from), address(0), amount);
            } else _moveVotingPower(_delegates(from), _delegates(to), amount);
        }
    }

    function _delegate(address delegator, address delegatee) internal virtual {
        _triggerScheduledCrossOrderedTasks(0);

        _takeAbafCheckpoint();

        address currentDelegate = _delegates(delegator);

        if (currentDelegate == delegatee) return;

        uint256 delegatorBalance = _balanceOfAdjustedAt(delegator, _blockTimestamp()) +
            _getLockedAmountForAdjustedAt(delegator, _blockTimestamp()) +
            _getHeldAmountForAdjusted(delegator) +
            _getClearedAmountForAdjusted(delegator);

        _erc20VotesStorage().delegates[delegator] = delegatee;

        emit DelegateChanged(delegator, currentDelegate, delegatee);

        _moveVotingPower(currentDelegate, delegatee, delegatorBalance);
    }

    function _moveVotingPower(address src, address dst, uint256 amount) internal {
        if (src != dst && amount > 0) {
            if (src != address(0)) {
                _moveVotingPower(src, _subtract, amount);
            }

            if (dst != address(0)) {
                _moveVotingPower(dst, _add, amount);
            }
        }
    }

    function _moveVotingPower(
        address account,
        function(uint256, uint256) view returns (uint256) op,
        uint256 amount
    ) internal {
        (uint256 oldWeight, uint256 newWeight) = _writeCheckpoint(
            _erc20VotesStorage().checkpoints[account],
            op,
            amount
        );
        emit DelegateVotesChanged(account, oldWeight, newWeight);
    }

    function _writeCheckpoint(
        CheckpointsLib.Checkpoint[] storage ckpts,
        function(uint256, uint256) view returns (uint256) op,
        uint256 delta
    ) internal returns (uint256 oldWeight, uint256 newWeight) {
        uint256 pos = ckpts.length;

        unchecked {
            CheckpointsLib.Checkpoint memory oldCkpt = pos == 0 ? CheckpointsLib.Checkpoint(0, 0) : ckpts[pos - 1];

            oldWeight = oldCkpt.value * _calculateFactorBetween(oldCkpt.from, _clock());
            newWeight = op(oldWeight, delta);

            if (pos > 0 && oldCkpt.from == _clock()) {
                ckpts[pos - 1].value = newWeight;
            } else {
                ckpts.push(CheckpointsLib.Checkpoint({ from: _clock(), value: newWeight }));
            }
        }
    }

    function _clock() internal view virtual returns (uint48) {
        return SafeCast.toUint48(_blockNumber());
    }

    // solhint-disable-next-line func-name-mixedcase
    function _CLOCK_MODE() internal view virtual returns (string memory) {
        // Check that the clock was not modified
        require(_clock() == _blockNumber(), "ERC20Votes: broken clock mode");
        return "mode=blocknumber&from=default";
    }

    function _checkpoints(
        address account,
        uint256 pos
    ) internal view virtual returns (CheckpointsLib.Checkpoint memory) {
        return _erc20VotesStorage().checkpoints[account][pos];
    }

    function _numCheckpoints(address account) internal view virtual returns (uint256) {
        return _erc20VotesStorage().checkpoints[account].length;
    }

    function _delegates(address account) internal view virtual returns (address) {
        return _erc20VotesStorage().delegates[account];
    }

    function _getVotes(address account) internal view virtual returns (uint256) {
        return _getVotesAdjusted(_clock(), _erc20VotesStorage().checkpoints[account]);
    }

    function _getPastVotes(address account, uint256 timepoint) internal view virtual returns (uint256) {
        require(timepoint < _clock(), "ERC20Votes: future lookup");
        return _getVotesAdjusted(timepoint, _erc20VotesStorage().checkpoints[account]);
    }

    function _getPastTotalSupply(uint256 timepoint) internal view virtual returns (uint256) {
        require(timepoint < _clock(), "ERC20Votes: future lookup");
        return _getVotesAdjusted(timepoint, _erc20VotesStorage().totalSupplyCheckpoints);
    }

    function _getVotesAdjusted(
        uint256 timepoint,
        CheckpointsLib.Checkpoint[] storage ckpts
    ) internal view returns (uint256) {
        (uint256 blockNumber, uint256 votes) = ckpts.checkpointsLookup(timepoint);

        return votes * _calculateFactorBetween(blockNumber, timepoint);
    }

    function _calculateFactorBetween(uint256 _fromBlock, uint256 _toBlock) internal view returns (uint256) {
        (, uint256 abafAtBlockFrom) = _erc20VotesStorage().abafCheckpoints.checkpointsLookup(_fromBlock);
        (, uint256 abafAtBlockTo) = _erc20VotesStorage().abafCheckpoints.checkpointsLookup(_toBlock);

        if (abafAtBlockFrom == 0 || abafAtBlockTo == 0) return 1;

        return abafAtBlockTo / abafAtBlockFrom;
    }

    function _isActivated() internal view returns (bool) {
        return _erc20VotesStorage().activated;
    }

    function _add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    function _subtract(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    function _erc20VotesStorage() internal pure returns (ERC20VotesStorage storage erc20votesStorage_) {
        bytes32 position = _ERC20VOTES_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20votesStorage_.slot := position
        }
    }
}
