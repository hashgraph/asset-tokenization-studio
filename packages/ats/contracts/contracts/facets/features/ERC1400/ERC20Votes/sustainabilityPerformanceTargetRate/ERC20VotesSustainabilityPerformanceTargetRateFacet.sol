// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20VotesFacetBase } from "../ERC20VotesFacetBase.sol";
// solhint-disable-next-line max-line-length
import {
    _ERC20VOTES_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "../../../../../constants/resolverKeys/features.sol";

contract ERC20VotesSustainabilityPerformanceTargetRateFacet is ERC20VotesFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20VOTES_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
