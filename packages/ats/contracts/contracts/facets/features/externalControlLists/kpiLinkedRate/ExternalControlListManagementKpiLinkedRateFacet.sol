// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalControlListManagementFacetBase } from "../ExternalControlListManagementFacetBase.sol";
import { _EXTERNAL_CONTROL_LIST_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract ExternalControlListManagementKpiLinkedRateFacet is ExternalControlListManagementFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_CONTROL_LIST_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
