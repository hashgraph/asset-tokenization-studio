// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_KPI_LINKED_READ_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { BondUSAReadFacetBase } from "../BondUSAReadFacetBase.sol";

contract BondUSAReadKpiLinkedRateFacet is BondUSAReadFacetBase {
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_KPI_LINKED_READ_RESOLVER_KEY;
    }
}
