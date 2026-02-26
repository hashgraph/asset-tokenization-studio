// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_VARIABLE_RATE_RESOLVER_KEY } from "../../../layer_2/constants/resolverKeys.sol";
import { BondUSAFacetBase } from "../BondUSAFacetBase.sol";
import { Common } from "../../../layer_0/common/Common.sol";

contract BondUSAFacet is BondUSAFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_VARIABLE_RATE_RESOLVER_KEY;
    }
}
