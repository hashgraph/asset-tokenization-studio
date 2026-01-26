// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1594FacetBase } from "../ERC1594FacetBase.sol";
import { _ERC1594_KPI_LINKED_RATE_RESOLVER_KEY } from "contracts/layer_1/constants/resolverKeys.sol";
import {
    CommonKpiLinkedInterestRate
} from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";

contract ERC1594KpiLinkedRateFacet is ERC1594FacetBase, CommonKpiLinkedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1594_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
