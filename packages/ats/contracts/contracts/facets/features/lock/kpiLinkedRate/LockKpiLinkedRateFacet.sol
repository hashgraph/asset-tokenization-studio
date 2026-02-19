// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LockFacetBase } from "../LockFacetBase.sol";
import { _LOCK_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";
contract LockKpiLinkedRateFacet is LockFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _LOCK_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
