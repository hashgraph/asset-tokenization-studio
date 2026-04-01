// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AmortizationFacetBase } from "../AmortizationFacetBase.sol";
import { _AMORTIZATION_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { Common } from "../../../../domain/Common.sol";

contract AmortizationFacet is AmortizationFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _AMORTIZATION_RESOLVER_KEY;
    }
}
