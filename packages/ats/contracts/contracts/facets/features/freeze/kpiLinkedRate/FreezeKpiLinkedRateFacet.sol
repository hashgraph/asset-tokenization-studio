// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { FreezeFacetBase } from "../FreezeFacetBase.sol";
import { _FREEZE_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";
contract FreezeKpiLinkedRateFacet is FreezeFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _FREEZE_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
