// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Votes } from "./IERC20Votes.sol";
import { Checkpoints } from "../../../../infrastructure/utils/Checkpoints.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ERC20VotesStorageWrapper } from "../../../../domain/asset/ERC20VotesStorageWrapper.sol";

/**
 * @title ERC20 Votes
 * @notice Abstract contract implementing ERC-5805 on-chain voting power for tokenised assets.
 * @dev Delegates all state management to `ERC20VotesStorageWrapper` using the diamond storage
 *      pattern (EIP-2535). Access control and pause checks are enforced via `Modifiers`.
 *      Functions named in mixed-case (`initialize_ERC20Votes`, `CLOCK_MODE`) follow interface
 *      conventions and suppress the `func-name-mixedcase` solhint rule on those lines.
 * @author io.builders
 */
abstract contract ERC20Votes is IERC20Votes, Modifiers {
    /**
     * @notice Initialises ERC20 voting support with the given activation status.
     * @dev Can only be called once per deployment; reverts if already initialised.
     *      Callable only before the ERC20Votes storage has been initialised
     *      (enforced by `onlyNotERC20VotesInitialized`).
     * @param _activated Whether voting functionality is active after initialisation.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20Votes(bool _activated) external override onlyNotERC20VotesInitialized {
        ERC20VotesStorageWrapper.initializeERC20Votes(_activated);
    }

    /**
     * @notice Delegates the caller's voting power to `_delegatee`.
     * @dev Reverts if the contract is paused. Triggers pending cross-ordered scheduled
     *      tasks before recording the delegation. Emits `DelegateChanged`.
     * @param _delegatee The address to receive the caller's delegated voting power.
     */
    function delegate(address _delegatee) external override onlyUnpaused {
        ERC20VotesStorageWrapper.delegate(_delegatee);
    }

    /**
     * @notice Returns the current block number used as the EIP-6372 clock value.
     * @dev Casts the current block number to `uint48` via `TimeTravelStorageWrapper`
     *      to support test-environment overrides.
     * @return The current clock value (block number).
     */
    function clock() external view override returns (uint48) {
        return ERC20VotesStorageWrapper.clock();
    }

    /**
     * @notice Returns the clock mode string per EIP-6372.
     * @dev Returns `"mode=blocknumber&from=default`. Reverts with `BrokenClockMode`
     *      if the clock value has been tampered with.
     * @return The clock mode descriptor string.
     */
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() external view override returns (string memory) {
        return ERC20VotesStorageWrapper.CLOCK_MODE();
    }

    /**
     * @notice Returns the current voting power of `_account`.
     * @dev Applies the Adjustable Balance Factor (ABF) from the latest checkpoint.
     * @param _account The address whose current voting power is queried.
     * @return The current voting power of `_account`.
     */
    function getVotes(address _account) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getVotes(_account);
    }

    /**
     * @notice Returns the voting power of `_account` at a past block number.
     * @dev Reverts with `FutureLookup` if `_timepoint` is greater than or equal to the
     *      current clock value. Applies historical ABF corrections.
     * @param _account   The address whose historical voting power is queried.
     * @param _timepoint The block number at which to query voting power.
     * @return The voting power of `_account` at `_timepoint`.
     */
    function getPastVotes(address _account, uint256 _timepoint) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getPastVotes(_account, _timepoint);
    }

    /**
     * @notice Returns the total voting power supply at a past block number.
     * @dev Reverts with `FutureLookup` if `_timepoint` is greater than or equal to the
     *      current clock value.
     * @param _timepoint The block number at which to query total supply voting power.
     * @return The total voting power at `_timepoint`.
     */
    function getPastTotalSupply(uint256 _timepoint) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getPastTotalSupply(_timepoint);
    }

    /**
     * @notice Returns the current delegate of `_account`.
     * @param _account The address whose delegate is queried.
     * @return The delegate address for `_account`.
     */
    function delegates(address _account) external view override returns (address) {
        return ERC20VotesStorageWrapper.delegates(_account);
    }

    /**
     * @notice Returns a specific checkpoint for `_account` by index.
     * @param _account The address whose checkpoint history is queried.
     * @param _pos     The zero-based index of the checkpoint to retrieve.
     * @return The checkpoint at position `_pos` for `_account`.
     */
    function checkpoints(
        address _account,
        uint256 _pos
    ) external view override returns (Checkpoints.Checkpoint memory) {
        return ERC20VotesStorageWrapper.checkpoints(_account, _pos);
    }

    /**
     * @notice Returns the number of checkpoints recorded for `_account`.
     * @param _account The address whose checkpoint count is queried.
     * @return The total number of checkpoints for `_account`.
     */
    function numCheckpoints(address _account) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.numCheckpoints(_account);
    }

    /**
     * @notice Returns whether ERC20 voting functionality is activated.
     * @return True if voting is active; false otherwise.
     */
    function isActivated() external view returns (bool) {
        return ERC20VotesStorageWrapper.isActivated();
    }
}
