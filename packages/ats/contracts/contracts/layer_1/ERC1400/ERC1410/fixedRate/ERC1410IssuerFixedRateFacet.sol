// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410IssuerFacetBase } from "../ERC1410IssuerFacetBase.sol";
import { _ERC1410_ISSUER_FIXED_RATE_RESOLVER_KEY } from "../../../../layer_1/constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "../../../../layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract ERC1410IssuerFixedRateFacet is ERC1410IssuerFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_ISSUER_FIXED_RATE_RESOLVER_KEY;
    }
}
