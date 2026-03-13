// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Votes } from "./IERC20Votes.sol";
import { Checkpoints } from "../../../../infrastructure/utils/Checkpoints.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { ERC20VotesStorageWrapper } from "../../../../domain/asset/ERC20VotesStorageWrapper.sol";

abstract contract ERC20Votes is IERC20Votes {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20Votes(bool _activated) external override {
        if (ERC20VotesStorageWrapper._isERC20VotesInitialized()) revert AlreadyInitialized();
        ERC20VotesStorageWrapper._initialize_ERC20Votes(_activated);
    }

    function delegate(address _delegatee) external override {
        PauseStorageWrapper._requireNotPaused();
        ERC20VotesStorageWrapper._delegate(_delegatee);
    }

    function clock() external view override returns (uint48) {
        return ERC20VotesStorageWrapper._clock();
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() external view override returns (string memory) {
        return ERC20VotesStorageWrapper.CLOCK_MODE();
    }

    function getVotes(address _account) external view override returns (uint256) {
        return ERC20VotesStorageWrapper._getVotes(_account);
    }

    function getPastVotes(address _account, uint256 _timepoint) external view override returns (uint256) {
        return ERC20VotesStorageWrapper._getPastVotes(_account, _timepoint);
    }

    function getPastTotalSupply(uint256 _timepoint) external view override returns (uint256) {
        return ERC20VotesStorageWrapper._getPastTotalSupply(_timepoint);
    }

    function delegates(address _account) external view override returns (address) {
        return ERC20VotesStorageWrapper._delegates(_account);
    }

    function checkpoints(
        address _account,
        uint256 _pos
    ) external view override returns (Checkpoints.Checkpoint memory) {
        return ERC20VotesStorageWrapper._checkpoints(_account, _pos);
    }

    function numCheckpoints(address _account) external view override returns (uint256) {
        return ERC20VotesStorageWrapper._numCheckpoints(_account);
    }

    function isActivated() external view returns (bool) {
        return ERC20VotesStorageWrapper._isActivated();
    }
}
