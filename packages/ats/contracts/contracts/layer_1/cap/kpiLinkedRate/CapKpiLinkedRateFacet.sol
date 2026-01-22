// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CapFacetBase } from "../CapFacetBase.sol";
import { _CAP_KPI_LINKED_RATE_RESOLVER_KEY } from "contracts/layer_1/constants/resolverKeys.sol";
import {
    CommonKpiLinkedInterestRate
} from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";

contract CapKpiLinkedRateFacet is CapFacetBase, CommonKpiLinkedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CAP_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
