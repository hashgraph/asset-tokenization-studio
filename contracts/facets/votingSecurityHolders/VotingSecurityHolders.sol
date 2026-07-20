// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IVotingSecurityHolders, RESOLVER_KEY_VOTING_SECURITY_HOLDERS } from "./IVotingSecurityHolders.sol";
import { VotingStorageWrapper } from "../../domain/asset/VotingStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title VotingSecurityHolders
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IVotingSecurityHolders`, providing holder-enumeration
 *         queries for voting corporate actions.
 * @dev Stateless wrapper that delegates all storage reads to {VotingStorageWrapper}.
 *      Intended to be inherited by `VotingSecurityHoldersFacet`.
 */
abstract contract VotingSecurityHolders is IVotingSecurityHolders, Modifiers {
    /// @inheritdoc IVotingSecurityHolders
    function initializeVotingSecurityHolders()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_VOTING_SECURITY_HOLDERS)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_VOTING_SECURITY_HOLDERS);
        emit VotingSecurityHoldersInitialized();
    }

    /// @inheritdoc IVotingSecurityHolders
    function getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory holders_) {
        return VotingStorageWrapper.getVotingHolders(_voteID, _pageIndex, _pageLength);
    }

    /// @inheritdoc IVotingSecurityHolders
    function getTotalVotingHolders(uint256 _voteID) external view override returns (uint256 totalHolders_) {
        return VotingStorageWrapper.getTotalVotingHolders(_voteID);
    }
}
