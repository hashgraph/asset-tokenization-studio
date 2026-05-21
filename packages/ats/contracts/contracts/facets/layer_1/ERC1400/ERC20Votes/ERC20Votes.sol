// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Votes } from "./IERC20Votes.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../../constants/roles.sol";
import { _ERC20VOTES_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { Checkpoints } from "../../../../infrastructure/utils/Checkpoints.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ERC20VotesStorageWrapper } from "../../../../domain/asset/ERC20VotesStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ERC20Votes is IERC20Votes, Modifiers {
    function initializeERC20Votes(
        bool _activated
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(_ERC20VOTES_RESOLVER_KEY) {
        ERC20VotesStorageWrapper.initializeERC20Votes(_activated);
        InitializerStorageWrapper.setFacetToReady(_ERC20VOTES_RESOLVER_KEY);
        emit IERC20Votes.ERC20VotesInitialized(_activated);
    }

    function delegate(address _delegatee) external override onlyActivated onlyUnpaused {
        ERC20VotesStorageWrapper.delegate(_delegatee);
    }

    function clock() external view override returns (uint48) {
        return ERC20VotesStorageWrapper.clock();
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() external view override returns (string memory) {
        return ERC20VotesStorageWrapper.CLOCK_MODE();
    }

    function getVotes(address _account) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getVotes(_account);
    }

    function getPastVotes(address _account, uint256 _timepoint) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getPastVotes(_account, _timepoint);
    }

    function getPastTotalSupply(uint256 _timepoint) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getPastTotalSupply(_timepoint);
    }

    function delegates(address _account) external view override returns (address) {
        return ERC20VotesStorageWrapper.delegates(_account);
    }

    function checkpoints(
        address _account,
        uint256 _pos
    ) external view override returns (Checkpoints.Checkpoint memory) {
        return ERC20VotesStorageWrapper.checkpoints(_account, _pos);
    }

    function numCheckpoints(address _account) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.numCheckpoints(_account);
    }

    function isActivated() external view returns (bool) {
        return ERC20VotesStorageWrapper.isActivated();
    }
}
