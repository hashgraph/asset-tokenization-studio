// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20PermitFacetBase } from "../ERC20PermitFacetBase.sol";
import { _ERC20PERMIT_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import {
    CommonKpiLinkedInterestRate
} from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";

contract ERC20PermitKpiLinkedRateFacet is ERC20PermitFacetBase, CommonKpiLinkedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20PERMIT_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
