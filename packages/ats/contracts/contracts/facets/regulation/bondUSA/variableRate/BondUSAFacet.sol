// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_VARIABLE_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";
import { BondUSAFacetBase } from "../BondUSAFacetBase.sol";

contract BondUSAFacet is BondUSAFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_VARIABLE_RATE_RESOLVER_KEY;
    }
}
