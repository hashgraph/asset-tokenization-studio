// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RESOLVER_KEY_BOND_VARIABLE_RATE } from "../IBondUSA.sol";

import { BondUSAFacetBase } from "../BondUSAFacetBase.sol";

contract BondUSAFacet is BondUSAFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BOND_VARIABLE_RATE;
    }

    function _bondInitializerKey() internal pure override returns (bytes32) {
        return _BOND_VARIABLE_RATE_RESOLVER_KEY;
    }
}
