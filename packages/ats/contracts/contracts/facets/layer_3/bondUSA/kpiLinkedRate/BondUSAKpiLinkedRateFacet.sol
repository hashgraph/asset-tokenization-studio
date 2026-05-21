// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RESOLVER_KEY_BOND_KPI_LINKED_RATE } from "../IBondUSA.sol";

import { BondUSAFacetBase } from "../BondUSAFacetBase.sol";

contract BondUSAKpiLinkedRateFacet is BondUSAFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BOND_KPI_LINKED_RATE;
    }

    function _bondInitializerKey() internal pure override returns (bytes32) {
        return _BOND_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
