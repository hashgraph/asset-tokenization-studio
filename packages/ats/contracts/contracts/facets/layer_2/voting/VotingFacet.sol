// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _VOTING_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { IVoting } from "./IVoting.sol";
import { Voting } from "./Voting.sol";

contract VotingFacet is Voting, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _VOTING_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.setVoting.selector;
        staticFunctionSelectors_[selectorIndex++] = this.cancelVoting.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVoting.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVotingFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVotingCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVotingHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalVotingHolders.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IVoting).interfaceId;
    }
}
