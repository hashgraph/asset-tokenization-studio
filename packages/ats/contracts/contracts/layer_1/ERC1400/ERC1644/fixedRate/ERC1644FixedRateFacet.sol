// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1644FacetBase } from "../ERC1644FacetBase.sol";
import { _ERC1644_FIXED_RATE_RESOLVER_KEY } from "contracts/layer_1/constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "contracts/layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract ERC1644FixedRateFacet is ERC1644FacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1644_FIXED_RATE_RESOLVER_KEY;
    }
}
