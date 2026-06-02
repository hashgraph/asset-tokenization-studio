// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Voting } from "./Voting.sol";
import { IVoting, RESOLVER_KEY_VOTING } from "./IVoting.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/// @title VotingFacet
/// @notice Concrete implementation of voting rights management facet
contract VotingFacet is Voting, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_VOTING;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeVoting.selector,
                this.setVoting.selector,
                this.cancelVoting.selector,
                this.forceCancelVoting.selector,
                this.getVoting.selector,
                this.getVotingFor.selector,
                this.getVotingCount.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IVoting).interfaceId);
    }
}
