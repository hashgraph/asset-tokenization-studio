// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAReadFacetBase } from "../BondUSAReadFacetBase.sol";
import { _BOND_KPI_LINKED_READ_RESOLVER_KEY } from "../../../layer_2/constants/resolverKeys.sol";
import {
    CommonKpiLinkedInterestRate
} from "../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";

contract BondUSAReadKpiLinkedRateFacet is BondUSAReadFacetBase, CommonKpiLinkedInterestRate {
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_KPI_LINKED_READ_RESOLVER_KEY;
    }
}
