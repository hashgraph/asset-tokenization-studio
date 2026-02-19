// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410ReadFacetBase } from "../ERC1410ReadFacetBase.sol";
// solhint-disable-next-line max-line-length
import {
    _ERC1410_READ_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "../../../../../constants/resolverKeys/features.sol";

// solhint-disable-next-line max-line-length
contract ERC1410ReadSustainabilityPerformanceTargetRateFacet is ERC1410ReadFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_READ_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
