// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IVotingSecurityHolders } from "./IVotingSecurityHolders.sol";
import { VotingStorageWrapper } from "../../domain/asset/VotingStorageWrapper.sol";

/**
 * @title VotingSecurityHolders
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IVotingSecurityHolders`, providing holder-enumeration
 *         queries for voting corporate actions.
 * @dev Stateless wrapper that delegates all storage reads to {VotingStorageWrapper}.
 *      Intended to be inherited by `VotingSecurityHoldersFacet`.
 */
abstract contract VotingSecurityHolders is IVotingSecurityHolders {
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
