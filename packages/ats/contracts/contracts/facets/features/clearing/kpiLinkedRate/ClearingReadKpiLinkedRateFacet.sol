// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingReadFacetBase } from "../ClearingReadFacetBase.sol";
import { _CLEARING_READ_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract ClearingReadKpiLinkedRateFacet is ClearingReadFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_READ_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
