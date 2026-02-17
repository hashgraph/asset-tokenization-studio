// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20Internals } from "../ERC20/ERC20Internals.sol";
import { CheckpointsLib } from "../../common/libraries/CheckpointsLib.sol";

abstract contract ERC20VotesInternals is ERC20Internals {
    function _delegate(address delegatee) internal virtual;
    function _delegate(address delegator, address delegatee) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC20Votes(bool _activated) internal virtual;
    function _moveVotingPower(address src, address dst, uint256 amount) internal virtual;
    function _setActivate(bool _activated) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _CLOCK_MODE() internal view virtual returns (string memory);
    function _checkpoints(
        address account,
        uint256 pos
    ) internal view virtual returns (CheckpointsLib.Checkpoint memory);
    function _clock() internal view virtual returns (uint48);
    function _delegates(address account) internal view virtual returns (address);
    function _getPastTotalSupply(uint256 timepoint) internal view virtual returns (uint256);
    function _getPastVotes(address account, uint256 timepoint) internal view virtual returns (uint256);
    function _getVotes(address account) internal view virtual returns (uint256);
    function _getVotesAdjustedAt(
        uint256 timepoint,
        CheckpointsLib.Checkpoint[] storage ckpts
    ) internal view virtual returns (uint256);
    function _isActivated() internal view virtual returns (bool);
    function _isERC20VotesInitialized() internal view virtual returns (bool);
    function _numCheckpoints(address account) internal view virtual returns (uint256);
}
