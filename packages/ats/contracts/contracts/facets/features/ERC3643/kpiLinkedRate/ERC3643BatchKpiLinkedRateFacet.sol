// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_BATCH_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";
import { ERC3643BatchFacetBase } from "../ERC3643BatchFacetBase.sol";

contract ERC3643BatchKpiLinkedRateFacet is ERC3643BatchFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_BATCH_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
