// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20VOTES_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IERC20Votes } from "../../facets/layer_1/ERC1400/ERC20Votes/IERC20Votes.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import { Checkpoints } from "../../infrastructure/utils/Checkpoints.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { IERC20VotesStorageWrapper } from "./ERC20Votes/IERC20VotesStorageWrapper.sol";

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
    function initialize_ERC20Votes(bool activated) internal {
        ERC20VotesStorage storage erc20VotesStorage = erc20VotesStorage_();
        setActivate(activated);
        erc20VotesStorage.initialized = true;
    }

    function setActivate(bool activated) internal {
        erc20VotesStorage_().activated = activated;
    }

    function delegate(address delegatee) internal {
        delegate(msg.sender, delegatee);
    }

    function takeAbafCheckpoint() internal {
        ERC20VotesStorage storage erc20VotesStorage = erc20VotesStorage_();

        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();

        uint256 pos = erc20VotesStorage.abafCheckpoints.length;

        if (pos != 0)
            if (erc20VotesStorage.abafCheckpoints[pos - 1].from == clock()) {
                if (erc20VotesStorage.abafCheckpoints[pos - 1].value != abaf)
                    revert IERC20Votes.AbafChangeForBlockForbidden(clock());
                return;
            }

        erc20VotesStorage_().abafCheckpoints.push(Checkpoints.Checkpoint({ from: clock(), value: abaf }));
    }

    function afterTokenTransfer(bytes32 /*partition*/, address from, address to, uint256 amount) internal {
        ERC20VotesStorage storage erc20VotesStorage = erc20VotesStorage_();

        if (isActivated()) {
            takeAbafCheckpoint();
            if (from == address(0)) {
                writeCheckpoint(erc20VotesStorage.totalSupplyCheckpoints, true, amount);
                moveVotingPower(address(0), delegates(to), amount);
            } else if (to == address(0)) {
                writeCheckpoint(erc20VotesStorage.totalSupplyCheckpoints, false, amount);
                moveVotingPower(delegates(from), address(0), amount);
            } else moveVotingPower(delegates(from), delegates(to), amount);
        }
    }

    function delegate(address delegator, address delegatee) internal {
        ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks();

        takeAbafCheckpoint();

        address currentDelegate = delegates(delegator);

        if (currentDelegate == delegatee) return;

        ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0);

        takeAbafCheckpoint();

        uint256 delegatorBalance = ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(delegator, block.timestamp);

        erc20VotesStorage_().delegates[delegator] = delegatee;

        emit DelegateChanged(delegator, currentDelegate, delegatee);

        moveVotingPower(currentDelegate, delegatee, delegatorBalance);
    }

    function moveVotingPower(address src, address dst, uint256 amount) internal {
        if (src != dst && amount > 0) {
            if (src != address(0)) {
                moveVotingPower(src, true, amount);
            }

            if (dst != address(0)) {
                moveVotingPower(dst, false, amount);
            }
        }
    }

    function moveVotingPower(address account, bool isAdd, uint256 amount) internal {
        (uint256 oldWeight, uint256 newWeight) = writeCheckpoint(
            erc20VotesStorage_().checkpoints[account],
            isAdd,
            amount
        );
        emit DelegateVotesChanged(account, oldWeight, newWeight);
    }

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
            } else {
                ckpts.push(Checkpoints.Checkpoint({ from: clock(), value: newWeight }));
            }
        }
    }

    function clock() internal view returns (uint48) {
        return SafeCast.toUint48(block.number);
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() internal view returns (string memory) {
        // Check that the clock was not modified
        require(clock() == block.number, "ERC20Votes: broken clock mode");
        return "mode=blocknumber&from=default";
    }

    function checkpoints(address account, uint256 pos) internal view returns (Checkpoints.Checkpoint memory) {
        return erc20VotesStorage_().checkpoints[account][pos];
    }

    function numCheckpoints(address account) internal view returns (uint256) {
        return erc20VotesStorage_().checkpoints[account].length;
    }

    function delegates(address account) internal view returns (address) {
        return erc20VotesStorage_().delegates[account];
    }

    function getVotes(address account) internal view returns (uint256) {
        return getVotesAdjustedAt(clock(), erc20VotesStorage_().checkpoints[account]);
    }

    function getPastVotes(address account, uint256 timepoint) internal view returns (uint256) {
        require(timepoint < clock(), "ERC20Votes: future lookup");
        return getVotesAdjustedAt(timepoint, erc20VotesStorage_().checkpoints[account]);
    }

    function getPastTotalSupply(uint256 timepoint) internal view returns (uint256) {
        require(timepoint < clock(), "ERC20Votes: future lookup");
        return getVotesAdjustedAt(timepoint, erc20VotesStorage_().totalSupplyCheckpoints);
    }

    function getVotesAdjustedAt(
        uint256 timepoint,
        Checkpoints.Checkpoint[] storage ckpts
    ) internal view returns (uint256) {
        (uint256 blockNumber, uint256 votes) = ckpts.checkpointsLookup(timepoint);

        return votes * calculateFactorBetween(blockNumber, timepoint);
    }

    function calculateFactorBetween(uint256 fromBlock, uint256 toBlock) internal view returns (uint256) {
        (, uint256 abafAtBlockFrom) = erc20VotesStorage_().abafCheckpoints.checkpointsLookup(fromBlock);
        (, uint256 abafAtBlockTo) = erc20VotesStorage_().abafCheckpoints.checkpointsLookup(toBlock);
        assert(abafAtBlockFrom <= abafAtBlockTo);

        if (abafAtBlockFrom == 0) return 1;

        return abafAtBlockTo / abafAtBlockFrom;
    }

    function isActivated() internal view returns (bool) {
        return erc20VotesStorage_().activated;
    }

    function isERC20VotesInitialized() internal view returns (bool) {
        return erc20VotesStorage_().initialized;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    function subtract(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    function erc20VotesStorage_() internal pure returns (ERC20VotesStorage storage erc20votesStorage_) {
        bytes32 position = _ERC20VOTES_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20votesStorage_.slot := position
        }
    }
}
