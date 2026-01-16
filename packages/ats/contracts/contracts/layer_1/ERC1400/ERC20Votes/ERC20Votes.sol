// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "../../../layer_0/Internals.sol";
import { IERC20Votes } from "../../interfaces/ERC1400/IERC20Votes.sol";
import { CheckpointsLib } from "../../../layer_0/common/libraries/CheckpointsLib.sol";

abstract contract ERC20Votes is IERC20Votes, Internals {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20Votes(bool _activated) external override onlyUninitialized(_isERC20VotesInitialized()) {
        _initialize_ERC20Votes(_activated);
    }

    function delegate(address _delegatee) external override onlyUnpaused {
        _delegate(_delegatee);
    }

    function clock() external view override returns (uint48) {
        return _clock();
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() external view override returns (string memory) {
        return _CLOCK_MODE();
    }

    function getVotes(address _account) external view override returns (uint256) {
        return _getVotes(_account);
    }

    function getPastVotes(address _account, uint256 _timepoint) external view override returns (uint256) {
        return _getPastVotes(_account, _timepoint);
    }

    function getPastTotalSupply(uint256 _timepoint) external view override returns (uint256) {
        return _getPastTotalSupply(_timepoint);
    }

    function delegates(address _account) external view override returns (address) {
        return _delegates(_account);
    }

    function checkpoints(
        address _account,
        uint256 _pos
    ) external view override returns (CheckpointsLib.Checkpoint memory) {
        return _checkpoints(_account, _pos);
    }

    function numCheckpoints(address _account) external view override returns (uint256) {
        return _numCheckpoints(_account);
    }

    function isActivated() external view returns (bool) {
        return _isActivated();
    }
}
