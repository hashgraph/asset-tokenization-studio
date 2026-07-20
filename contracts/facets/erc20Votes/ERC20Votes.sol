// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Votes, RESOLVER_KEY_ERC20VOTES } from "./IERC20Votes.sol";
import { IVotes } from "./IVotes.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { Checkpoints } from "../../infrastructure/utils/Checkpoints.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC20VotesStorageWrapper } from "../../domain/asset/ERC20VotesStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { IERC6372 } from "@openzeppelin/contracts/interfaces/IERC6372.sol";

/**
 * @title ERC20 Votes Facet
 * @notice Provides vote delegation and historical voting power queries for an ERC20 asset.
 * @dev Delegates storage and vote accounting to ERC20VotesStorageWrapper. Initialisation is
 * restricted to the default admin and may only occur before the facet is registered as ready.
 * @author Hashgraph
 */
abstract contract ERC20Votes is IERC20Votes, Modifiers {
    /// @inheritdoc IERC20Votes
    /// @dev Requires DEFAULT_ADMIN_ROLE and rejects repeated facet registration.
    function initializeERC20Votes(
        bool _activated
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_ERC20VOTES) {
        ERC20VotesStorageWrapper.initializeERC20Votes(_activated);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_ERC20VOTES);
        emit IERC20Votes.ERC20VotesInitialized(_activated);
    }

    /// @inheritdoc IVotes
    /// @dev Requires the system to be operational, activated, and not paused.
    function delegate(address _delegatee) external override onlyOperational onlyActivated onlyUnpaused {
        ERC20VotesStorageWrapper.delegate(_delegatee);
    }

    /// @inheritdoc IERC6372
    function clock() external view override returns (uint48) {
        return ERC20VotesStorageWrapper.clock();
    }

    /* solhint-disable func-name-mixedcase */
    /// @inheritdoc IERC6372
    function CLOCK_MODE() external view override returns (string memory) {
        return ERC20VotesStorageWrapper.CLOCK_MODE();
    }
    /* solhint-enable func-name-mixedcase */

    /// @inheritdoc IVotes
    function getVotes(address _account) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getVotes(_account);
    }

    /// @inheritdoc IVotes
    function getPastVotes(address _account, uint256 _timepoint) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getPastVotes(_account, _timepoint);
    }

    /// @inheritdoc IVotes
    function getPastTotalSupply(uint256 _timepoint) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.getPastTotalSupply(_timepoint);
    }

    /// @inheritdoc IVotes
    function delegates(address _account) external view override returns (address) {
        return ERC20VotesStorageWrapper.delegates(_account);
    }

    /// @inheritdoc IERC20Votes
    function checkpoints(
        address _account,
        uint256 _pos
    ) external view override returns (Checkpoints.Checkpoint memory) {
        return ERC20VotesStorageWrapper.checkpoints(_account, _pos);
    }

    /// @inheritdoc IERC20Votes
    function numCheckpoints(address _account) external view override returns (uint256) {
        return ERC20VotesStorageWrapper.numCheckpoints(_account);
    }

    /**
     * @notice Returns whether vote delegation functionality is active.
     * @dev Reads the activation flag from ERC20VotesStorageWrapper without mutating state.
     * @return True if ERC20Votes functionality is activated, false otherwise.
     */
    function isActivated() external view returns (bool) {
        return ERC20VotesStorageWrapper.isActivated();
    }
}
