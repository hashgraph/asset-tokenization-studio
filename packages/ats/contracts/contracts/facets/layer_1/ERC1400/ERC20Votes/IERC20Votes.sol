// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { IERC5805 } from "./IERC5805.sol";
import { Checkpoints } from "../../../../infrastructure/utils/Checkpoints.sol";

interface IERC20Votes is IERC5805 {
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

    function initializeERC20Votes(bool _activated) external;

    /**
     * @notice Marks the ERC20Votes facet as ready following a Diamond upgrade.
     * @dev Called during upgrade re-initialisation. No storage migration is performed;
     *      existing state carries over unchanged. Reverts if the facet was not previously
     *      registered at one of the accepted config versions, or is already marked ready at
     *      the current config version.
     * @param fromVersions Accepted previous config versions for this upgrade path.
     */
    function reinitializeERC20Votes(uint256[] calldata fromVersions) external;

    function isActivated() external view returns (bool);

    function checkpoints(address _account, uint256 _pos) external view returns (Checkpoints.Checkpoint memory);

    function numCheckpoints(address _account) external view returns (uint256);
}
