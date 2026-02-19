// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAReadFacetBase } from "../BondUSAReadFacetBase.sol";
import { _BOND_FIXED_READ_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";

contract BondUSAReadFixedRateFacet is BondUSAReadFacetBase {
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_FIXED_READ_RESOLVER_KEY;
    }
}
