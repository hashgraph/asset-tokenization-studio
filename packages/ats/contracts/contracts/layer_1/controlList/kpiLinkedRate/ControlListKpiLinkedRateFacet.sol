// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ControlListFacetBase } from "../ControlListFacetBase.sol";
import { _CONTROL_LIST_KPI_LINKED_RATE_RESOLVER_KEY } from "contracts/layer_1/constants/resolverKeys.sol";
import {
    CommonKpiLinkedInterestRate
} from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";

contract ControlListKpiLinkedRateFacet is ControlListFacetBase, CommonKpiLinkedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CONTROL_LIST_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
