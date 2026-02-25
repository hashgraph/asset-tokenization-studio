// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LibCheckpoints } from "../../infrastructure/lib/LibCheckpoints.sol";
import { ERC20VotesStorage, erc20VotesStorage } from "../../storage/TokenStorage.sol";
import { IERC20Votes } from "../../facets/features/interfaces/ERC1400/IERC20Votes.sol";

/// @title LibERC20Votes
/// @notice Leaf library for ERC20Votes delegation and checkpoint functionality
/// @dev Extracted from ERC20VotesStorageWrapper for library-based diamond migration
library LibERC20Votes {
    using LibCheckpoints for LibCheckpoints.Checkpoint[];

    // ═══════════════════════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Emitted when a delegator changes their delegate
    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);

    /// @notice Emitted when the vote balance of a delegate changes
    event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);

    // ═══════════════════════════════════════════════════════════════════════════════
    // PUBLIC STATE MODIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Sets a delegate for the caller
    /// @param delegatee The address to delegate voting power to
    function setDelegate(address delegatee) internal {
        _delegate(msg.sender, delegatee);
    }

    /// @notice Initializes ERC20Votes with activation state
    /// @param activated Whether voting is activated
    function initialize(bool activated) internal {
        ERC20VotesStorage storage s = erc20VotesStorage();
        s.activated = activated;
        s.initialized = true;
    }

    /// @notice Writes a total supply checkpoint (add/subtract)
    /// @param isAdd True for addition, false for subtraction
    /// @param amount The amount to adjust
    /// @param currentBlockNumber The current block number
    function writeTotalSupplyCheckpoint(bool isAdd, uint256 amount, uint256 currentBlockNumber) internal {
        _writeCheckpoint(
            erc20VotesStorage().totalSupplyCheckpoints,
            isAdd ? _add : _subtract,
            amount,
            currentBlockNumber
        );
    }

    /// @notice Moves voting power between accounts (internal)
    /// @param src The source account
    /// @param dst The destination account
    /// @param amount The amount of voting power to move
    /// @param currentBlockNumber The current block number
    function moveVotingPower(address src, address dst, uint256 amount, uint256 currentBlockNumber) internal {
        if (src != dst && amount > 0) {
            if (src != address(0)) {
                _moveVotingPower(src, _subtract, amount, currentBlockNumber);
            }

            if (dst != address(0)) {
                _moveVotingPower(dst, _add, amount, currentBlockNumber);
            }
        }
    }

    /// @notice Records ABAF checkpoint for the current block
    /// @param currentAbaf The current ABAF value
    /// @param currentBlockNumber The current block number
    function takeAbafCheckpoint(uint256 currentAbaf, uint256 currentBlockNumber) internal {
        ERC20VotesStorage storage votes = erc20VotesStorage();
        uint256 pos = votes.abafCheckpoints.length;

        if (pos != 0)
            if (votes.abafCheckpoints[pos - 1].from == currentBlockNumber) {
                if (votes.abafCheckpoints[pos - 1].value != currentAbaf)
                    revert IERC20Votes.AbafChangeForBlockForbidden(currentBlockNumber);
                return;
            }

        votes.abafCheckpoints.push(LibCheckpoints.Checkpoint({ from: currentBlockNumber, value: currentAbaf }));
    }

    /// @notice Sets delegate and emits DelegateChanged event
    /// @dev Used by ERC20VotesFacetBase which orchestrates the full delegate flow
    /// @param delegator The account delegating
    /// @param delegatee The new delegate
    /// @param previousDelegate The previous delegate (for event)
    function delegateAndEmit(address delegator, address delegatee, address previousDelegate) internal {
        erc20VotesStorage().delegates[delegator] = delegatee;
        emit DelegateChanged(delegator, previousDelegate, delegatee);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Gets the current delegate of an account
    /// @param account The account to query
    /// @return The address of the delegate (address(0) if not delegated)
    function getDelegate(address account) internal view returns (address) {
        return erc20VotesStorage().delegates[account];
    }

    /// @notice Gets the current voting power of an account
    /// @param account The account to query
    /// @param currentBlockNumber The current block number
    /// @return The current voting power
    function getVotes(address account, uint256 currentBlockNumber) internal view returns (uint256) {
        return _getVotes(account, currentBlockNumber);
    }

    /// @notice Gets the voting power at a past block
    /// @param account The account to query
    /// @param blockNumber The block number to query
    /// @param currentBlockNumber The current block number
    /// @return The voting power at the specified block
    function getPastVotes(
        address account,
        uint256 blockNumber,
        uint256 currentBlockNumber
    ) internal view returns (uint256) {
        return _getPastVotes(account, blockNumber, currentBlockNumber);
    }

    /// @notice Gets the total voting power at a past block
    /// @param blockNumber The block number to query
    /// @param currentBlockNumber The current block number
    /// @return The total voting power at the specified block
    function getPastTotalSupply(uint256 blockNumber, uint256 currentBlockNumber) internal view returns (uint256) {
        return _getPastTotalSupply(blockNumber, currentBlockNumber);
    }

    /// @notice Gets a checkpoint for an account at a specific position
    /// @param account The account to query
    /// @param pos The position in the checkpoints array
    /// @return The checkpoint at the specified position
    function getCheckpoint(address account, uint256 pos) internal view returns (LibCheckpoints.Checkpoint memory) {
        return erc20VotesStorage().checkpoints[account][pos];
    }

    /// @notice Gets the number of checkpoints for an account
    /// @param account The account to query
    /// @return The number of checkpoints
    function getNumCheckpoints(address account) internal view returns (uint256) {
        return erc20VotesStorage().checkpoints[account].length;
    }

    /// @notice Checks if ERC20Votes feature is activated
    /// @return True if the voting feature is activated
    function isActivated() internal view returns (bool) {
        return erc20VotesStorage().activated;
    }

    /// @notice Checks if ERC20Votes has been initialized
    /// @return True if initialized
    function isInitialized() internal view returns (bool) {
        return erc20VotesStorage().initialized;
    }

    /// @notice Internal delegation logic
    /// @param delegator The account performing the delegation
    /// @param delegatee The account to delegate to
    function _delegate(address delegator, address delegatee) private {
        address currentDelegate = erc20VotesStorage().delegates[delegator];

        if (currentDelegate == delegatee) return;

        erc20VotesStorage().delegates[delegator] = delegatee;

        emit DelegateChanged(delegator, currentDelegate, delegatee);
    }

    /// @notice Moves voting power and emits event
    /// @param account The account whose voting power is changing
    /// @param op The operation to apply (addition or subtraction)
    /// @param amount The amount to apply
    /// @param currentBlockNumber The current block number
    function _moveVotingPower(
        address account,
        function(uint256, uint256) view returns (uint256) op,
        uint256 amount,
        uint256 currentBlockNumber
    ) private {
        (uint256 oldWeight, uint256 newWeight) = _writeCheckpoint(
            erc20VotesStorage().checkpoints[account],
            op,
            amount,
            currentBlockNumber
        );
        emit DelegateVotesChanged(account, oldWeight, newWeight);
    }

    /// @notice Writes a checkpoint to the checkpoints array
    /// @param ckpts The checkpoints array
    /// @param op The operation to apply
    /// @param delta The amount to apply
    /// @param currentBlockNumber The current block number
    /// @return oldWeight The weight before the operation
    /// @return newWeight The weight after the operation
    function _writeCheckpoint(
        LibCheckpoints.Checkpoint[] storage ckpts,
        function(uint256, uint256) view returns (uint256) op,
        uint256 delta,
        uint256 currentBlockNumber
    ) private returns (uint256 oldWeight, uint256 newWeight) {
        uint256 pos = ckpts.length;

        unchecked {
            LibCheckpoints.Checkpoint memory oldCkpt = pos == 0 ? LibCheckpoints.Checkpoint(0, 0) : ckpts[pos - 1];

            oldWeight = oldCkpt.value * _calculateFactorBetween(oldCkpt.from, currentBlockNumber);
            newWeight = op(oldWeight, delta);

            if (pos > 0 && oldCkpt.from == currentBlockNumber) {
                ckpts[pos - 1].value = newWeight;
            } else {
                ckpts.push(LibCheckpoints.Checkpoint({ from: currentBlockNumber, value: newWeight }));
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRIVATE QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Gets the current voting power of an account
    /// @param account The account to query
    /// @param currentBlockNumber The current block number
    /// @return The current voting power
    function _getVotes(address account, uint256 currentBlockNumber) private view returns (uint256) {
        return _getVotesAdjustedAt(currentBlockNumber, erc20VotesStorage().checkpoints[account]);
    }

    /// @notice Gets the voting power at a past block
    /// @param account The account to query
    /// @param timepoint The block number to query
    /// @param currentBlockNumber The current block number
    /// @return The voting power at the specified block
    function _getPastVotes(
        address account,
        uint256 timepoint,
        uint256 currentBlockNumber
    ) private view returns (uint256) {
        if (timepoint >= currentBlockNumber) revert IERC20Votes.ERC20VotesFutureLookup(timepoint, currentBlockNumber);
        return _getVotesAdjustedAt(timepoint, erc20VotesStorage().checkpoints[account]);
    }

    /// @notice Gets the total voting power at a past block
    /// @param timepoint The block number to query
    /// @param currentBlockNumber The current block number
    /// @return The total voting power at the specified block
    function _getPastTotalSupply(uint256 timepoint, uint256 currentBlockNumber) private view returns (uint256) {
        if (timepoint >= currentBlockNumber) revert IERC20Votes.ERC20VotesFutureLookup(timepoint, currentBlockNumber);
        return _getVotesAdjustedAt(timepoint, erc20VotesStorage().totalSupplyCheckpoints);
    }

    /// @notice Gets the adjusted voting power at a timepoint
    /// @param timepoint The timepoint to query
    /// @param ckpts The checkpoints array
    /// @return The adjusted voting power
    function _getVotesAdjustedAt(
        uint256 timepoint,
        LibCheckpoints.Checkpoint[] storage ckpts
    ) private view returns (uint256) {
        (uint256 blockNumber, uint256 votes) = ckpts.checkpointsLookup(timepoint);
        return votes * _calculateFactorBetween(blockNumber, timepoint);
    }

    /// @notice Calculates the adjustment factor between two blocks
    /// @param fromBlock The source block
    /// @param toBlock The target block
    /// @return The adjustment factor
    function _calculateFactorBetween(uint256 fromBlock, uint256 toBlock) private view returns (uint256) {
        ERC20VotesStorage storage votes = erc20VotesStorage();
        (, uint256 abafAtBlockFrom) = votes.abafCheckpoints.checkpointsLookup(fromBlock);
        (, uint256 abafAtBlockTo) = votes.abafCheckpoints.checkpointsLookup(toBlock);
        assert(abafAtBlockFrom <= abafAtBlockTo);

        if (abafAtBlockFrom == 0) return 1;

        return abafAtBlockTo / abafAtBlockFrom;
    }

    /// @notice Adds two numbers
    /// @param a The first number
    /// @param b The second number
    /// @return The sum
    function _add(uint256 a, uint256 b) private pure returns (uint256) {
        return a + b;
    }

    /// @notice Subtracts two numbers
    /// @param a The first number
    /// @param b The second number to subtract
    /// @return The difference
    function _subtract(uint256 a, uint256 b) private pure returns (uint256) {
        return a - b;
    }
}
