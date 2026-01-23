// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20VotesFacetBase } from "../ERC20VotesFacetBase.sol";
import { _ERC20VOTES_FIXED_RATE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "contracts/layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract ERC20VotesFixedRateFacet is ERC20VotesFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20VOTES_FIXED_RATE_RESOLVER_KEY;
    }
}
