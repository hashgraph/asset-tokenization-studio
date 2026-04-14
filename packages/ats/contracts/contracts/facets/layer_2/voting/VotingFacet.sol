// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Voting } from "./Voting.sol";
import { IVoting } from "./IVoting.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _VOTING_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

/// @title VotingFacet
/// @notice Concrete implementation of voting rights management facet
contract VotingFacet is Voting, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _VOTING_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](7);
        uint256 selectorIndex;
        staticFunctionSelectors_[selectorIndex++] = this.setVoting.selector;
        staticFunctionSelectors_[selectorIndex++] = this.cancelVoting.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVoting.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVotingFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVotingCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVotingHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalVotingHolders.selector;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IVoting).interfaceId;
    }
}
