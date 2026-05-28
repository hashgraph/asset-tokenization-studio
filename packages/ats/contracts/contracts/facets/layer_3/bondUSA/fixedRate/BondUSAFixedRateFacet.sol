// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RESOLVER_KEY_BOND_FIXED_RATE } from "../IBondUSA.sol";

import { BondUSAFacetBase } from "../BondUSAFacetBase.sol";

contract BondUSAFixedRateFacet is BondUSAFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BOND_FIXED_RATE;
    }

    function _bondInitializerKey() internal pure override returns (bytes32) {
        return RESOLVER_KEY_BOND_FIXED_RATE;
    }
}
