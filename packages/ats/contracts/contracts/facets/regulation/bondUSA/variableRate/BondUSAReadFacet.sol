// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_VARIABLE_READ_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";
import { BondUSAReadFacetBase } from "../BondUSAReadFacetBase.sol";

contract BondUSAReadFacet is BondUSAReadFacetBase {
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_VARIABLE_READ_RESOLVER_KEY;
    }
}
