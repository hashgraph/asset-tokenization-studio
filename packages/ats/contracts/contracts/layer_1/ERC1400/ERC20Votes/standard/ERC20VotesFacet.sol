// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20VotesFacetBase } from "../ERC20VotesFacetBase.sol";
import { _ERC20VOTES_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { Common } from "../../../../layer_0/common/Common.sol";

contract ERC20VotesFacet is ERC20VotesFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20VOTES_RESOLVER_KEY;
    }
}
