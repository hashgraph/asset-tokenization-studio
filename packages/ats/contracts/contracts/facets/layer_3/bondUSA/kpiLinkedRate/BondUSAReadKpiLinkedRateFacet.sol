// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RESOLVER_KEY_BOND_KPI_LINKED_READ } from "../IBondUSA.sol";

import { BondUSAReadFacetBase } from "../BondUSAReadFacetBase.sol";

contract BondUSAReadKpiLinkedRateFacet is BondUSAReadFacetBase {
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BOND_KPI_LINKED_READ;
    }

    function _bondReadInitializerKey() internal pure override returns (bytes32) {
        return RESOLVER_KEY_BOND_KPI_LINKED_READ;
    }
}
