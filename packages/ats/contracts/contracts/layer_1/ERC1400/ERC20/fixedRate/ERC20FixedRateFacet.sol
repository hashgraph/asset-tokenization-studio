// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended
pragma solidity >=0.8.0 <0.9.0;

import { ERC20FacetBase } from "../ERC20FacetBase.sol";
import { _ERC20_FIXED_RATE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "contracts/layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract ERC20FixedRateFacet is ERC20FacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20_FIXED_RATE_RESOLVER_KEY;
    }
}
