// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { IERC5805 } from "./IERC5805.sol";
import { Checkpoints } from "../../../../infrastructure/utils/Checkpoints.sol";

/**
 * @title IERC20 Votes Interface
 * @notice Interface for ERC-5805 on-chain voting power, extending ERC-6372 (clock) and IVotes
 *         with checkpoint queries, activation control, and ABF-aware error types.
 * @dev Extends `IERC5805`, which itself combines `IERC6372` and `IVotes`. Adds project-specific
 *      events, custom errors, and the initialisation / checkpoint query surface.
 * @author io.builders
 */
interface IERC20Votes is IERC5805 {
    /**
     * @notice Emitted when an account changes its voting delegate.
     * @param delegator    The account that changed its delegation.
     * @param fromDelegate The previous delegate address.
     * @param toDelegate   The new delegate address.
     */
    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);

    /**
     * @notice Emitted when a delegate's vote balance changes due to token transfers or re-delegation.
     * @param delegate        The delegate whose vote balance changed.
     * @param previousBalance The vote balance before the change.
     * @param newBalance      The vote balance after the change.
     */
    event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);

    /**
     * @notice Thrown when an attempt is made to modify the Adjustable Balance Factor (ABF)
     *         for a block that has already been checkpointed.
     * @dev Only one ABF value is permitted per block; re-writing is forbidden.
     * @param blockNumber The block number for which the ABF change was rejected.
     */
    error AbafChangeForBlockForbidden(uint256 blockNumber);

    /**
     * @notice Thrown when the EIP-6372 clock value is inconsistent with the expected source.
     * @dev Indicates that the clock has been tampered with or the override is misconfigured.
     */
    error BrokenClockMode();

    /**
     * @notice Thrown when a historical query is attempted for a timepoint in the future.
     * @param timepoint    The requested timepoint that exceeds the current clock.
     * @param currentClock The current clock value at the time of the query.
     */
    error FutureLookup(uint256 timepoint, uint256 currentClock);

    /**
     * @notice Initialises ERC20 voting support.
     * @dev Can only be called once. Reverts if the storage has already been initialised.
     * @param _activated Whether voting functionality is active after initialisation.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20Votes(bool _activated) external;

    /**
     * @notice Returns whether ERC20 voting functionality is activated.
     * @return True if voting is active; false otherwise.
     */
    function isActivated() external view returns (bool);

    /**
     * @notice Returns a specific voting power checkpoint for `_account` by index.
     * @param _account The address whose checkpoint history is queried.
     * @param _pos     The zero-based index of the checkpoint to retrieve.
     * @return The checkpoint at position `_pos` for `_account`.
     */
    function checkpoints(address _account, uint256 _pos) external view returns (Checkpoints.Checkpoint memory);

    /**
     * @notice Returns the total number of voting power checkpoints recorded for `_account`.
     * @param _account The address whose checkpoint count is queried.
     * @return The number of checkpoints for `_account`.
     */
    function numCheckpoints(address _account) external view returns (uint256);
}
