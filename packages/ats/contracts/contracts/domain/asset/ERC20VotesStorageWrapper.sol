// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20VOTES_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { KPI_VOTES_CALC_FACTOR } from "../../constants/values.sol";
import { IERC20Votes } from "../../facets/layer_1/ERC1400/ERC20Votes/IERC20Votes.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import { Checkpoints } from "../../infrastructure/utils/Checkpoints.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/**
 * @notice Purpose of this struct
 * @param activated Indicates whether the ERC20Votes feature is activated
 * @param DEPRECATED_contractName Deprecated field for contract name
 * @param DEPRECATED_contractVersion Deprecated field for contract version
 * @param delegates Mapping of addresses to their voting delegates
 * @param checkpoints Mapping of addresses to their voting power checkpoint history
 * @param totalSupplyCheckpoints Checkpoint history of total supply voting power
 * @param abafCheckpoints Checkpoint history of ABF values
 * @param initialized Flag indicating if the storage has been initialized
 */
struct ERC20VotesStorageData {
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

/**
 * @title ERC20 Votes Storage Wrapper Library
 * @notice Manages voting power tracking and delegation logic for ERC20 tokens
 * @dev Implements checkpoint-based voting power calculation with adjustable balance factors
 * @author Tokeny Solutions
 */
library ERC20VotesStorageWrapper {
    using Checkpoints for Checkpoints.Checkpoint[];

    /**
     * @notice Initialises the ERC20 votes storage with activation status
     * @dev Sets the activated flag and marks the storage as initialised
     * @param activated Whether to activate voting functionality
     */
    function initializeERC20Votes(bool activated) internal {
        setActivate(activated);
        erc20VotesStorage().initialized = true;
    }

    /**
     * @notice Sets the activation status of voting functionality
     * @dev Updates the activated flag in storage
     * @param activated New activation status
     */
    function setActivate(bool activated) internal {
        erc20VotesStorage().activated = activated;
    }

    /**
     * @notice Delegates voting power to another address
     * @dev Delegates caller's voting power to specified delegatee
     * @param delegatee Address to delegate voting power to
     */
    function delegate(address delegatee) internal {
        delegate(EvmAccessors.getMsgSender(), delegatee);
    }

    /**
     * @notice Records an ABF checkpoint at the current block
     * @dev Stores the current Adjustable Balance Adjustment Factor value
     */
    function takeAbafCheckpoint() internal {
        ERC20VotesStorageData storage votesStorage = erc20VotesStorage();
        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();
        uint256 pos = votesStorage.abafCheckpoints.length;
        uint256 clockAddress = clock();
        if (pos != 0 && votesStorage.abafCheckpoints[pos - 1].from == clockAddress) {
            if (votesStorage.abafCheckpoints[pos - 1].value != abaf)
                revert IERC20Votes.AbafChangeForBlockForbidden(clockAddress);
            return;
        }
        votesStorage.abafCheckpoints.push(Checkpoints.Checkpoint({ from: clockAddress, value: abaf }));
    }

    /**
     * @notice Handles voting power adjustments after token transfers.
     * @dev Updates checkpoints and delegates based on token movements.
     *      Voting power is partition-agnostic; the partition parameter is unused.
     * @param partition The ERC-1400 partition identifier; unused — voting is partition-agnostic.
     * @param from Source address of the transfer; `address(0)` indicates a mint.
     * @param to Destination address of the transfer; `address(0)` indicates a burn.
     * @param amount Amount of tokens transferred.
     */
    function afterTokenTransfer(
        bytes32 partition, // solhint-disable-line no-unused-vars
        address from,
        address to,
        uint256 amount
    ) internal {
        ERC20VotesStorageData storage votesStorage = erc20VotesStorage();
        if (!isActivated()) return;
        takeAbafCheckpoint();
        if (from == address(0)) {
            writeCheckpoint(votesStorage.totalSupplyCheckpoints, true, amount);
            moveVotingPower(address(0), delegates(to), amount);
            return;
        }
        if (to == address(0)) {
            writeCheckpoint(votesStorage.totalSupplyCheckpoints, false, amount);
            moveVotingPower(delegates(from), address(0), amount);
            return;
        }
        moveVotingPower(delegates(from), delegates(to), amount);
    }

    /**
     * @notice Delegates voting power from one address to another
     * @dev Triggers scheduled tasks and updates delegate mappings
     * @param delegator Address whose voting power is being delegated
     * @param delegatee Address receiving the delegated voting power
     */
    function delegate(address delegator, address delegatee) internal {
        ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks();
        takeAbafCheckpoint();
        address currentDelegate = delegates(delegator);
        if (currentDelegate == delegatee) return;
        ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0);
        takeAbafCheckpoint();
        erc20VotesStorage().delegates[delegator] = delegatee;
        emit IERC20Votes.DelegateChanged(delegator, currentDelegate, delegatee);
        moveVotingPower(
            currentDelegate,
            delegatee,
            ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(delegator, TimeTravelStorageWrapper.getBlockTimestamp())
        );
    }

    /**
     * @notice Moves voting power between two addresses
     * @dev Handles both subtraction from source and addition to destination
     * @param src Source address to subtract voting power from
     * @param dst Destination address to add voting power to
     * @param amount Amount of voting power to move
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
     * @notice Adjusts voting power for a specific account
     * @dev Writes checkpoint data and emits vote change events
     * @param account Account whose voting power is changing
     * @param isAdd Whether to add or subtract voting power
     * @param amount Amount of voting power to adjust
     */
    function moveVotingPower(address account, bool isAdd, uint256 amount) internal {
        (uint256 oldWeight, uint256 newWeight) = writeCheckpoint(
            erc20VotesStorage().checkpoints[account],
            isAdd,
            amount
        );
        emit IERC20Votes.DelegateVotesChanged(account, oldWeight, newWeight);
    }

    /**
     * @notice Writes a checkpoint entry for voting power changes
     * @dev Creates or updates checkpoint records with calculated weights
     * @param ckpts Checkpoint array to update
     * @param isAdd Whether this is an addition or subtraction
     * @param delta Amount to adjust by
     * @return oldWeight Previous voting weight
     * @return newWeight Updated voting weight
     */
    function writeCheckpoint(
        Checkpoints.Checkpoint[] storage ckpts,
        bool isAdd,
        uint256 delta
    ) internal returns (uint256 oldWeight, uint256 newWeight) {
        uint256 pos = ckpts.length;
        unchecked {
            Checkpoints.Checkpoint memory oldCkpt = pos == 0 ? Checkpoints.Checkpoint(0, 0) : ckpts[pos - 1];
            oldWeight = oldCkpt.value * calculateFactorBetween(oldCkpt.from, clock());
            newWeight = isAdd ? add(oldWeight, delta) : subtract(oldWeight, delta);
            if (pos > 0 && oldCkpt.from == clock()) {
                ckpts[pos - 1].value = newWeight;
                return (oldWeight, newWeight);
            }
            ckpts.push(Checkpoints.Checkpoint({ from: clock(), value: newWeight }));
        }
    }

    /**
     * @notice Gets the current block number as a timestamp
     * @dev Converts block number to appropriate timestamp format
     * @return Current block number as uint48
     */
    function clock() internal view returns (uint48) {
        return SafeCast.toUint48(TimeTravelStorageWrapper.getBlockNumber());
    }

    /**
     * @notice Returns the clock mode string for voting calculations
     * @dev Verifies clock integrity and returns mode identifier
     * @return Clock mode descriptor string
     */
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() internal view returns (string memory) {
        // Check that the clock was not modified
        if (clock() != TimeTravelStorageWrapper.getBlockNumber()) revert IERC20Votes.BrokenClockMode();
        return "mode=blocknumber&from=default";
    }

    /**
     * @notice Retrieves a specific checkpoint for an account
     * @dev Accesses checkpoint data by index position
     * @param account Account to retrieve checkpoint for
     * @param pos Index position of checkpoint
     * @return Checkpoint data at specified position
     */
    function checkpoints(address account, uint256 pos) internal view returns (Checkpoints.Checkpoint memory) {
        return erc20VotesStorage().checkpoints[account][pos];
    }

    /**
     * @notice Gets the number of checkpoints for an account
     * @dev Returns length of checkpoint array
     * @param account Account to check
     * @return Number of checkpoints
     */
    function numCheckpoints(address account) internal view returns (uint256) {
        return erc20VotesStorage().checkpoints[account].length;
    }

    /**
     * @notice Gets the delegate for a specific account
     * @dev Returns delegate mapping value
     * @param account Account to check delegate for
     * @return Delegate address
     */
    function delegates(address account) internal view returns (address) {
        return erc20VotesStorage().delegates[account];
    }

    /**
     * @notice Gets current voting power for an account
     * @dev Calculates voting power based on latest checkpoint
     * @param account Account to get votes for
     * @return Current voting power
     */
    function getVotes(address account) internal view returns (uint256) {
        return getVotesAdjustedAt(clock(), erc20VotesStorage().checkpoints[account]);
    }

    /**
     * @notice Gets historical voting power for an account
     * @dev Calculates voting power at a specific timepoint
     * @param account Account to get votes for
     * @param timepoint Block number to query at
     * @return Voting power at specified timepoint
     */
    function getPastVotes(address account, uint256 timepoint) internal view returns (uint256) {
        if (timepoint >= clock()) revert IERC20Votes.FutureLookup(timepoint, clock());
        return getVotesAdjustedAt(timepoint, erc20VotesStorage().checkpoints[account]);
    }

    /**
     * @notice Gets historical total supply voting power
     * @dev Calculates total supply voting power at a specific timepoint
     * @param timepoint Block number to query at
     * @return Total supply voting power at specified timepoint
     */
    function getPastTotalSupply(uint256 timepoint) internal view returns (uint256) {
        if (timepoint >= clock()) revert IERC20Votes.FutureLookup(timepoint, clock());
        return getVotesAdjustedAt(timepoint, erc20VotesStorage().totalSupplyCheckpoints);
    }

    /**
     * @notice Calculates adjusted voting power at a specific timepoint
     * @dev Applies adjustment factors to raw checkpoint values
     * @param timepoint Block number to calculate at
     * @param ckpts Checkpoint array to reference
     * @return Adjusted voting power value
     */
    function getVotesAdjustedAt(
        uint256 timepoint,
        Checkpoints.Checkpoint[] storage ckpts
    ) internal view returns (uint256) {
        (uint256 blockNumber, uint256 votes) = ckpts.checkpointsLookup(timepoint);
        return votes * calculateFactorBetween(blockNumber, timepoint);
    }

    /**
     * @notice Calculates adjustment factor between two blocks
     * @dev Computes ratio of ABF values between block numbers
     * @param fromBlock Starting block number
     * @param toBlock Ending block number
     * @return Adjustment factor multiplier
     */
    function calculateFactorBetween(uint256 fromBlock, uint256 toBlock) internal view returns (uint256) {
        (, uint256 abafAtBlockFrom) = erc20VotesStorage().abafCheckpoints.checkpointsLookup(fromBlock);
        (, uint256 abafAtBlockTo) = erc20VotesStorage().abafCheckpoints.checkpointsLookup(toBlock);
        _checkUnexpectedError(abafAtBlockFrom > abafAtBlockTo, KPI_VOTES_CALC_FACTOR);
        if (abafAtBlockFrom == 0) return 1;
        return abafAtBlockTo / abafAtBlockFrom;
    }

    /**
     * @notice Checks if voting functionality is activated
     * @dev Returns activation status from storage
     * @return Activation status
     */
    function isActivated() internal view returns (bool) {
        return erc20VotesStorage().activated;
    }

    /**
     * @notice Checks if ERC20 votes storage is initialized
     * @dev Returns initialization status from storage
     * @return Initialization status
     */
    function isERC20VotesInitialized() internal view returns (bool) {
        return erc20VotesStorage().initialized;
    }

    /**
     * @notice Safely adds two unsigned integers
     * @dev Performs addition without overflow checks
     * @param a First operand
     * @param b Second operand
     * @return Sum of operands
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    /**
     * @notice Safely subtracts two unsigned integers
     * @dev Handles underflow by returning zero when b > a
     * @param a Minuend
     * @param b Subtrahend
     * @return Difference or zero if underflow would occur
     */
    function subtract(uint256 a, uint256 b) internal pure returns (uint256) {
        // Handle underflow gracefully - voting power cannot go negative
        // Returns 0 when b > a (e.g., delegating zero-balance accounts)
        return a > b ? a - b : 0;
    }

    /**
     * @notice Gets the ERC20 votes storage data location
     * @dev Returns storage pointer using predefined position
     * @return erc20votesStorage_ The ERC20 votes storage data pointer.
     */
    function erc20VotesStorage() private pure returns (ERC20VotesStorageData storage erc20votesStorage_) {
        bytes32 position = _ERC20VOTES_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20votesStorage_.slot := position
        }
    }
}
