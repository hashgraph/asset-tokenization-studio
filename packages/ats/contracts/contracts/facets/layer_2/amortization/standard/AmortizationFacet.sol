// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RESOLVER_KEY_AMORTIZATION } from "../IAmortization.sol";

import { AmortizationFacetBase } from "../AmortizationFacetBase.sol";
contract AmortizationFacet is AmortizationFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_AMORTIZATION;
    }
}
