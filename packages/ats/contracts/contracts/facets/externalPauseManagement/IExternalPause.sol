// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title  IExternalPause
 * @notice Minimal interface for querying an external pause contract.
 * @dev    Implemented by third-party pause controllers whose address is registered on the
 *         token. The token calls `isPaused` to check whether operations should be
 *         suspended before executing any state-changing function.
 */
interface IExternalPause {
    /**
     * @notice Returns whether the external pause controller currently signals a paused state.
     * @return `true` if the token should treat itself as paused; `false` otherwise.
     */
    function isPaused() external view returns (bool);
}
