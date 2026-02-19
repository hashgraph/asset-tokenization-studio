// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410ManagementFacetBase } from "../ERC1410ManagementFacetBase.sol";
import { _ERC1410_MANAGEMENT_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../../constants/resolverKeys/features.sol";

contract ERC1410ManagementKpiLinkedRateFacet is ERC1410ManagementFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_MANAGEMENT_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
