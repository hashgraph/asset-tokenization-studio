// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalPauseManagementFacetBase } from "../ExternalPauseManagementFacetBase.sol";
import { _EXTERNAL_PAUSE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract ExternalPauseManagementFacet is ExternalPauseManagementFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_PAUSE_RESOLVER_KEY;
    }
}
