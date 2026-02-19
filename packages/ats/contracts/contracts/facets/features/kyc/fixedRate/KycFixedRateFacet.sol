// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KycFacetBase } from "../KycFacetBase.sol";
import { _KYC_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract KycFixedRateFacet is KycFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KYC_FIXED_RATE_RESOLVER_KEY;
    }
}
