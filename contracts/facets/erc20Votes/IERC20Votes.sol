// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { IERC5805 } from "./IERC5805.sol";
import { Checkpoints } from "../../infrastructure/utils/Checkpoints.sol";

/// @custom:hash resolverKey Erc20votes
bytes32 constant RESOLVER_KEY_ERC20VOTES = 0x9619bb38c76aac49afb1df75430aefc1314778fe926136a688bf3ae3b5f8c3b7;

/// @title IERC20Votes
/// @author Asset Tokenization Studio Team
/// @notice Interface for the ERC-20 Votes extension that enables on-chain governance delegation
///         and checkpoint-based vote tracking.
interface IERC20Votes is IERC5805 {
    /// @notice Emitted once when the ERC-20Votes capability is initialised on a token.
    /// @dev Fires exclusively from `initializeERC20Votes` after the storage write succeeds.
    /// @param activated Whether the ERC-20Votes feature is active after initialisation.
    event ERC20VotesInitialized(bool activated);

    /// @notice Emitted when an account changes their delegate
    /// @param delegator The account that changed their delegation
    /// @param fromDelegate The previous delegate address
    /// @param toDelegate The new delegate address
    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);

    /// @notice Emitted when delegate votes change due to balance changes
    /// @param delegate The delegate whose votes changed
    /// @param previousBalance The previous vote balance
    /// @param newBalance The new vote balance
    event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);

    /// @notice Raised when attempting to change ABAF for a block that is forbidden
    /// @param blockNumber The block number that is forbidden
    error AbafChangeForBlockForbidden(uint256 blockNumber);
    /// @notice Raised when the clock mode is broken
    error BrokenClockMode();
    /// @notice Raised when querying past votes or supply with a future timepoint
    /// @param timepoint The requested future timepoint
    /// @param currentClock The current clock value
    error FutureLookup(uint256 timepoint, uint256 currentClock);

    /// @notice Initialises the ERC-20Votes capability on the token.
    /// @param _activated Whether the voting feature should be active after initialisation.
    function initializeERC20Votes(bool _activated) external;

    /// @notice Returns whether the ERC-20Votes voting feature is currently active.
    /// @return True if the voting feature is active, false otherwise.
    function isActivated() external view returns (bool);

    /// @notice Returns the checkpoint at a given position for an account's vote history.
    /// @param _account Address whose checkpoint history is queried.
    /// @param _pos Zero-based index into the account's checkpoint array.
    /// @return The checkpoint struct at the given position.
    function checkpoints(address _account, uint256 _pos) external view returns (Checkpoints.Checkpoint memory);

    /// @notice Returns the total number of vote checkpoints recorded for an account.
    /// @param _account Address whose checkpoint count is queried.
    /// @return The number of checkpoints stored for the account.
    function numCheckpoints(address _account) external view returns (uint256);
}
