// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20VOTES_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ERC1594StorageWrapper } from "../ERC1594/ERC1594StorageWrapper.sol";
import { IERC20Votes } from "../../../layer_1/interfaces/ERC1400/IERC20Votes.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";

// solhint-disable custom-errors
abstract contract ERC20VotesStorageWrapper is ERC1594StorageWrapper {
    struct ERC20VotesStorage {
        bool activated;
        string contractName;
        string contractVersion;
        mapping(address => address) delegates;
        mapping(address => IERC20Votes.Checkpoint[]) checkpoints;
        IERC20Votes.Checkpoint[] totalSupplyCheckpoints;
        IERC20Votes.Checkpoint[] abafCheckpoints;
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
            if (erc20VotesStorage.abafCheckpoints[pos - 1].fromBlock == _clock()) {
                if (erc20VotesStorage.abafCheckpoints[pos - 1].votes != abaf)
                    revert IERC20Votes.AbafChangeForBlockForbidden(_clock());
                return;
            }

        _erc20VotesStorage().abafCheckpoints.push(IERC20Votes.Checkpoint({ fromBlock: _clock(), votes: abaf }));
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
        address currentDelegate = _delegates(delegator);

        if (currentDelegate == delegatee) return;

        _triggerScheduledCrossOrderedTasks(0);

        _takeAbafCheckpoint();

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
        IERC20Votes.Checkpoint[] storage ckpts,
        function(uint256, uint256) view returns (uint256) op,
        uint256 delta
    ) internal returns (uint256 oldWeight, uint256 newWeight) {
        uint256 pos = ckpts.length;

        unchecked {
            IERC20Votes.Checkpoint memory oldCkpt = pos == 0 ? IERC20Votes.Checkpoint(0, 0) : ckpts[pos - 1];

            oldWeight = oldCkpt.votes * _calculateFactorBetween(oldCkpt.fromBlock, _clock());
            newWeight = op(oldWeight, delta);

            if (pos > 0 && oldCkpt.fromBlock == _clock()) {
                ckpts[pos - 1].votes = newWeight;
            } else {
                ckpts.push(IERC20Votes.Checkpoint({ fromBlock: _clock(), votes: newWeight }));
            }
        }
    }

    /*function _hashTypedDataV4(
        bytes32 structHash
    ) internal view virtual returns (bytes32) {
        return
            ECDSA.toTypedDataHash(
                getDomainHash(
                    _erc20VotesStorage().contractName,
                    _erc20VotesStorage().contractVersion,
                    _blockChainid(),
                    address(this)
                ),
                structHash
            );
    }*/

    function _clock() internal view virtual returns (uint48) {
        return SafeCast.toUint48(_blockNumber());
    }

    // solhint-disable-next-line func-name-mixedcase
    function _CLOCK_MODE() internal view virtual returns (string memory) {
        // Check that the clock was not modified
        require(_clock() == _blockNumber(), "ERC20Votes: broken clock mode");
        return "mode=blocknumber&from=default";
    }

    function _checkpoints(address account, uint256 pos) internal view virtual returns (IERC20Votes.Checkpoint memory) {
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
        IERC20Votes.Checkpoint[] storage ckpts
    ) internal view returns (uint256) {
        (uint256 blockNumber, uint256 votes) = _checkpointsLookup(ckpts, timepoint);

        return votes * _calculateFactorBetween(blockNumber, timepoint);
    }

    function _checkpointsLookup(
        IERC20Votes.Checkpoint[] storage ckpts,
        uint256 timepoint
    ) internal view returns (uint256 block_, uint256 vote_) {
        uint256 length = ckpts.length;

        uint256 low = 0;
        uint256 high = length;

        if (length > 5) {
            uint256 mid = length - Math.sqrt(length);
            if (ckpts[mid].fromBlock > timepoint) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        while (low < high) {
            uint256 mid = Math.average(low, high);
            if (ckpts[mid].fromBlock > timepoint) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        if (high == 0) return (0, 0);

        unchecked {
            return (ckpts[high - 1].fromBlock, ckpts[high - 1].votes);
        }
    }

    function _calculateFactorBetween(uint256 _fromBlock, uint256 _toBlock) internal view returns (uint256) {
        (, uint256 abafAtBlockFrom) = _checkpointsLookup(_erc20VotesStorage().abafCheckpoints, _fromBlock);
        (, uint256 abafAtBlockTo) = _checkpointsLookup(_erc20VotesStorage().abafCheckpoints, _toBlock);

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
