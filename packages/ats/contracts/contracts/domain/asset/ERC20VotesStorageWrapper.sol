// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KPI_VOTES_CALC_FACTOR } from "../../constants/values.sol";
import { IERC20Votes } from "../../facets/layer_1/ERC1400/ERC20Votes/IERC20Votes.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import { Checkpoints } from "../../infrastructure/utils/Checkpoints.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksOps } from "../orchestrator/ScheduledTasksOps.sol";
import { TokenCoreOps } from "../orchestrator/TokenCoreOps.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/// @custom:hash storage Erc20votes
bytes32 constant STORAGE_LOCATION_ERC20VOTES = 0xb9759d8916f84f61d52de275f833cafd6ef9b06c1939ba841dc78330c7f3bf00;

/**
 * @notice Storage struct for ERC20Votes checkpoint tracking and delegation state.
 * @dev Maintains voting power history via block-based checkpoints, including total supply
 *      checkpoints, account-specific checkpoints, delegation mappings, and ABAF
 *      (adjusted balance adjustment factor) snapshots used for vote calculation.
 * @custom:storage-location erc7201:security.token.standard.storage.Erc20votes
 */
struct ERC20VotesStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool initialized;
    bool activated;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(address => address) delegates;
    mapping(address => Checkpoints.Checkpoint[]) checkpoints;
    Checkpoints.Checkpoint[] totalSupplyCheckpoints;
    Checkpoints.Checkpoint[] abafCheckpoints;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title ERC20VotesStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Storage wrapper providing ERC20 voting power tracking, checkpoint history,
 *         and delegation management with time-based vote adjustment factors.
 */
library ERC20VotesStorageWrapper {
    using Checkpoints for Checkpoints.Checkpoint[];

    /**
     * @notice Initialises ERC20Votes storage with a specified activation state.
     * @param activated Whether voting is active immediately upon initialisation.
     */
    function initializeERC20Votes(bool activated) internal {
        setActivate(activated);
        erc20VotesStorage_().initialized = true;
    }

    /**
     * @notice Updates the activation state of voting power tracking.
     * @param activated Whether voting power is tracked (true) or inactive (false).
     */
    function setActivate(bool activated) internal {
        erc20VotesStorage_().activated = activated;
    }

    /**
     * @notice Delegates the caller's voting power to a specified delegatee.
     * @param delegatee The address to receive the caller's delegated votes.
     */
    function delegate(address delegatee) internal {
        delegate(EvmAccessors.getMsgSender(), delegatee);
    }

    /**
     * @notice Records a checkpoint of the current ABAF (adjusted balance adjustment factor)
     *         at the present block, or reverts if ABAF changed within the same block.
     * @dev Prevents multiple ABAF changes in a single block; reverts with
     *      `AbafChangeForBlockForbidden` if a checkpoint exists at this block with a
     *      different ABAF value.
     */
    function takeAbafCheckpoint() internal {
        ERC20VotesStorage storage erc20VotesStorage = erc20VotesStorage_();

        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();

        uint256 pos = erc20VotesStorage.abafCheckpoints.length;
        uint256 clockAddress = clock();

        if (pos != 0 && erc20VotesStorage.abafCheckpoints[pos - 1].from == clockAddress) {
            if (erc20VotesStorage.abafCheckpoints[pos - 1].value != abaf)
                revert IERC20Votes.AbafChangeForBlockForbidden(clockAddress);
            return;
        }
        erc20VotesStorage.abafCheckpoints.push(Checkpoints.Checkpoint({ from: clockAddress, value: abaf }));
    }

    /**
     * @notice Updates voting power checkpoints following a token transfer.
     * @dev Dispatches to specialised branches: mint (from = 0), burn (to = 0), or standard
     *      transfer. Updates total supply and account checkpoints, then moves voting power
     *      from source delegate to destination delegate.
     * @param from The account sending tokens (or address(0) for mints).
     * @param to The account receiving tokens (or address(0) for burns).
     * @param amount The number of tokens transferred.
     */
    function afterTokenTransfer(bytes32 /*partition*/, address from, address to, uint256 amount) internal {
        ERC20VotesStorage storage erc20VotesStorage = erc20VotesStorage_();

        if (!isActivated()) return;
        takeAbafCheckpoint();
        if (from == address(0)) {
            writeCheckpoint(erc20VotesStorage.totalSupplyCheckpoints, true, amount);
            moveVotingPower(address(0), delegates(to), amount);
            return;
        }
        if (to == address(0)) {
            writeCheckpoint(erc20VotesStorage.totalSupplyCheckpoints, false, amount);
            moveVotingPower(delegates(from), address(0), amount);
            return;
        }
        moveVotingPower(delegates(from), delegates(to), amount);
    }

    /**
     * @notice Delegates voting power from one account to another.
     * @dev Triggers scheduled tasks before and after checkpoint updates. Moves the delegator's
     *      full voting power from their current delegate to the new delegatee. Emits
     *      `DelegateChanged` upon successful delegation.
     * @param delegator The account whose votes are being delegated.
     * @param delegatee The address to receive the delegated voting power.
     */
    function delegate(address delegator, address delegatee) internal {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();

        takeAbafCheckpoint();

        address currentDelegate = delegates(delegator);

        if (currentDelegate == delegatee) return;

        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();

        takeAbafCheckpoint();

        erc20VotesStorage_().delegates[delegator] = delegatee;

        emit IERC20Votes.DelegateChanged(delegator, currentDelegate, delegatee);

        moveVotingPower(
            currentDelegate,
            delegatee,
            TokenCoreOps.getTotalBalanceForAdjustedAt(delegator, TimeTravelStorageWrapper.getBlockTimestamp())
        );
    }

    /**
     * @notice Transfers voting power from one account to another.
     * @dev No-op if source equals destination or amount is zero. Subtracts from source
     *      (if non-zero address) and adds to destination (if non-zero address) via
     *      checkpoint writes.
     * @param src The account losing voting power.
     * @param dst The account gaining voting power.
     * @param amount The amount of voting power to transfer.
     */
    function moveVotingPower(address src, address dst, uint256 amount) internal {
        if (src == dst || amount == 0) return;

        if (src != address(0)) {
            moveVotingPower(src, false, amount); // subtract from src
        }

        if (dst != address(0)) {
            moveVotingPower(dst, true, amount); // add to dst
        }
    }

    /**
     * @notice Records a checkpoint change for an account's voting power.
     * @dev Adds or subtracts the given amount from the account's checkpoint, applies the
     *      ABAF factor to both old and new weights, then emits `DelegateVotesChanged`.
     * @param account The account whose voting power is changing.
     * @param isAdd Whether to add (true) or subtract (false) the amount.
     * @param amount The number of tokens being added or removed.
     */
    function moveVotingPower(address account, bool isAdd, uint256 amount) internal {
        (uint256 oldWeight, uint256 newWeight) = writeCheckpoint(
            erc20VotesStorage_().checkpoints[account],
            isAdd,
            amount
        );
        emit IERC20Votes.DelegateVotesChanged(account, oldWeight, newWeight);
    }

    /**
     * @notice Writes or updates a voting power checkpoint for the current block.
     * @dev If a checkpoint already exists at this block, updates its value in-place;
     *      otherwise appends a new checkpoint. Applies the ABAF factor to weights.
     * @param ckpts The checkpoint array being updated.
     * @param isAdd Whether to add (true) or subtract (false) delta to the old weight.
     * @param delta The amount to add or subtract.
     * @return oldWeight The weight before the change, adjusted by ABAF factor.
     * @return newWeight The weight after the change, adjusted by ABAF factor.
     */
    function writeCheckpoint(
        Checkpoints.Checkpoint[] storage ckpts,
        bool isAdd,
        uint256 delta
    ) internal returns (uint256 oldWeight, uint256 newWeight) {
        uint256 pos = ckpts.length;
        Checkpoints.Checkpoint memory oldCkpt;

        unchecked {
            oldCkpt = pos == 0 ? Checkpoints.Checkpoint(0, 0) : ckpts[pos - 1];
        }

        oldWeight = oldCkpt.value * calculateFactorBetween(oldCkpt.from, clock());

        newWeight = isAdd ? add(oldWeight, delta) : subtract(oldWeight, delta);

        unchecked {
            if (pos > 0 && oldCkpt.from == clock()) {
                ckpts[pos - 1].value = newWeight;
                return (oldWeight, newWeight);
            }
        }

        ckpts.push(Checkpoints.Checkpoint({ from: clock(), value: newWeight }));
    }

    /**
     * @notice Returns the current block number as the checkpoint timepoint.
     * @return The current block number cast to uint48.
     */
    function clock() internal view returns (uint48) {
        return SafeCast.toUint48(TimeTravelStorageWrapper.getBlockNumber());
    }

    /**
     * @notice Returns the clock mode string for EIP-6372 compliance.
     * @dev Verifies that the clock is not modified (block number consistency) before
     *      returning the mode string. Reverts with `BrokenClockMode` if the block number
     *      changes mid-call. Name is mandated by EIP-5805 / EIP-6372 to be exactly
     *      `CLOCK_MODE` (uppercase); the solhint waiver is unavoidable.
     * @return mode_ A string denoting the clock mode: "mode=blocknumber&from=default".
     */
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() internal view returns (string memory mode_) {
        // Check that the clock was not modified
        if (clock() != TimeTravelStorageWrapper.getBlockNumber()) revert IERC20Votes.BrokenClockMode();
        return "mode=blocknumber&from=default";
    }

    /**
     * @notice Retrieves a specific checkpoint for an account at a given position.
     * @param account The account whose checkpoint history is queried.
     * @param pos The index of the checkpoint in the account's checkpoint array.
     * @return checkpoint_ A checkpoint object containing the block number and voting power value.
     */
    function checkpoints(
        address account,
        uint256 pos
    ) internal view returns (Checkpoints.Checkpoint memory checkpoint_) {
        return erc20VotesStorage_().checkpoints[account][pos];
    }

    /**
     * @notice Returns the number of checkpoints for a given account.
     * @param account The account whose checkpoint count is queried.
     * @return The total number of checkpoints recorded for the account.
     */
    function numCheckpoints(address account) internal view returns (uint256) {
        return erc20VotesStorage_().checkpoints[account].length;
    }

    /**
     * @notice Returns the current delegate of an account.
     * @param account The account whose delegate is queried.
     * @return The address to which the account has delegated its voting power.
     */
    function delegates(address account) internal view returns (address) {
        return erc20VotesStorage_().delegates[account];
    }

    /**
     * @notice Returns the current voting power of an account at the present block.
     * @param account The account whose voting power is queried.
     * @return The account's current voting power, adjusted by the ABAF factor.
     */
    function getVotes(address account) internal view returns (uint256) {
        return getVotesAdjustedAt(clock(), erc20VotesStorage_().checkpoints[account]);
    }

    /**
     * @notice Returns the voting power of an account at a historical timepoint.
     * @dev Reverts with `FutureLookup` if the timepoint is at or beyond the current block.
     * @param account The account whose historical voting power is queried.
     * @param timepoint The block number at which to query voting power.
     * @return The account's voting power at the specified timepoint, adjusted by ABAF.
     */
    function getPastVotes(address account, uint256 timepoint) internal view returns (uint256) {
        if (timepoint >= clock()) revert IERC20Votes.FutureLookup(timepoint, clock());
        return getVotesAdjustedAt(timepoint, erc20VotesStorage_().checkpoints[account]);
    }

    /**
     * @notice Returns the total voting power supply at a historical timepoint.
     * @dev Reverts with `FutureLookup` if the timepoint is at or beyond the current block.
     * @param timepoint The block number at which to query total voting power.
     * @return The total voting power at the specified timepoint, adjusted by ABAF.
     */
    function getPastTotalSupply(uint256 timepoint) internal view returns (uint256) {
        if (timepoint >= clock()) revert IERC20Votes.FutureLookup(timepoint, clock());
        return getVotesAdjustedAt(timepoint, erc20VotesStorage_().totalSupplyCheckpoints);
    }

    /**
     * @notice Retrieves voting power at a specific timepoint and adjusts it by ABAF factor.
     * @dev Helper that looks up the checkpoint value at the timepoint, then multiplies by
     *      the ABAF ratio between the checkpoint block and the query timepoint.
     * @param timepoint The block number at which to query voting power.
     * @param ckpts The checkpoint array to search.
     * @return The voting power at the timepoint, adjusted by the ABAF factor.
     */
    function getVotesAdjustedAt(
        uint256 timepoint,
        Checkpoints.Checkpoint[] storage ckpts
    ) internal view returns (uint256) {
        (uint256 blockNumber, uint256 votes) = ckpts.checkpointsLookup(timepoint);

        return votes * calculateFactorBetween(blockNumber, timepoint);
    }

    /**
     * @notice Calculates the ABAF adjustment factor between two block numbers.
     * @dev Retrieves ABAF values at both blocks and computes the ratio (toBlock / fromBlock).
     *      Reverts if ABAF decreases (constraint violation). Returns 1 if ABAF at fromBlock
     *      is zero (indicating no adjustment).
     * @param fromBlock The starting block for the ABAF lookup.
     * @param toBlock The ending block for the ABAF lookup.
     * @return The adjustment factor (ratio of toBlock ABAF to fromBlock ABAF).
     */
    function calculateFactorBetween(uint256 fromBlock, uint256 toBlock) internal view returns (uint256) {
        (, uint256 abafAtBlockFrom) = erc20VotesStorage_().abafCheckpoints.checkpointsLookup(fromBlock);
        (, uint256 abafAtBlockTo) = erc20VotesStorage_().abafCheckpoints.checkpointsLookup(toBlock);
        _checkUnexpectedError(abafAtBlockFrom > abafAtBlockTo, KPI_VOTES_CALC_FACTOR);

        if (abafAtBlockFrom == 0) return 1;

        return abafAtBlockTo / abafAtBlockFrom;
    }

    /**
     * @notice Returns whether ERC20Votes voting is currently activated.
     * @return True if voting power tracking is active; false otherwise.
     */
    function isActivated() internal view returns (bool) {
        return erc20VotesStorage_().activated;
    }

    /**
     * @notice Returns whether ERC20Votes storage has been initialised.
     * @return True if the storage has been initialised; false otherwise.
     */
    function isERC20VotesInitialized() internal view returns (bool) {
        return erc20VotesStorage_().initialized;
    }

    /**
     * @notice Adds two unsigned integers.
     * @param a The first addend.
     * @param b The second addend.
     * @return The sum of a and b.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    /**
     * @notice Subtracts two unsigned integers with underflow protection.
     * @dev Returns zero if b exceeds a, preventing underflow when delegating zero-balance
     *      accounts. This graceful degradation allows voting power transitions without
     *      reverting on temporary negative balances.
     * @param a The minuend.
     * @param b The subtrahend.
     * @return The difference (a - b), or zero if b > a.
     */
    function subtract(uint256 a, uint256 b) internal pure returns (uint256) {
        // Handle underflow gracefully - voting power cannot go negative
        // Returns 0 when b > a (e.g., delegating zero-balance accounts)
        return a > b ? a - b : 0;
    }

    /**
     * @notice Retrieves a reference to the ERC20Votes storage location.
     * @dev Uses the ERC-7201 storage location formula to position storage at a
     *      deterministic address based on STORAGE_LOCATION_ERC20VOTES.
     * @return erc20votesStorage_ The storage struct at the designated location.
     */
    function erc20VotesStorage_() internal pure returns (ERC20VotesStorage storage erc20votesStorage_) {
        bytes32 position = STORAGE_LOCATION_ERC20VOTES;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20votesStorage_.slot := position
        }
    }
}
