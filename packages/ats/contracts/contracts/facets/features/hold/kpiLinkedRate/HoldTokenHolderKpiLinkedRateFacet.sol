// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldTokenHolderFacetBase } from "../HoldTokenHolderFacetBase.sol";
import { _HOLD_TOKEN_HOLDER_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract HoldTokenHolderKpiLinkedRateFacet is HoldTokenHolderFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_TOKEN_HOLDER_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
