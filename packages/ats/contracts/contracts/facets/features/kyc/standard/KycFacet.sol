// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KycFacetBase } from "../KycFacetBase.sol";
import { _KYC_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract KycFacet is KycFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KYC_RESOLVER_KEY;
    }
}
