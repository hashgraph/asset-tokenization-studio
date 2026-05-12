// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Votes } from "./IERC20Votes.sol";
import { IERC5805 } from "@openzeppelin/contracts/interfaces/IERC5805.sol";
import { IERC6372 } from "@openzeppelin/contracts/interfaces/IERC6372.sol";
import { IVotes } from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import { ERC20Votes } from "./ERC20Votes.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ERC20VOTES_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract ERC20VotesFacet is ERC20Votes, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20VOTES_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](11);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ERC20Votes.selector;
        staticFunctionSelectors_[selectorIndex++] = this.delegate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.clock.selector;
        staticFunctionSelectors_[selectorIndex++] = this.CLOCK_MODE.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVotes.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getPastVotes.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getPastTotalSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.delegates.selector;
        staticFunctionSelectors_[selectorIndex++] = this.checkpoints.selector;
        staticFunctionSelectors_[selectorIndex++] = this.numCheckpoints.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isActivated.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](4);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC20Votes).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC5805).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC6372).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IVotes).interfaceId;
    }
}
