// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RESOLVER_KEY_BOND_VARIABLE_READ } from "../IBondUSA.sol";

import { BondUSAReadFacetBase } from "../BondUSAReadFacetBase.sol";

contract BondUSAReadFacet is BondUSAReadFacetBase {
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BOND_VARIABLE_READ;
    }

    function _bondReadInitializerKey() internal pure override returns (bytes32) {
        return _BOND_VARIABLE_READ_RESOLVER_KEY;
    }
}
