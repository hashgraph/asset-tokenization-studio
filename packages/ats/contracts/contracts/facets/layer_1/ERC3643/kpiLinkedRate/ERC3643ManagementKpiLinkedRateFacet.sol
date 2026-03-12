// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_MANAGEMENT_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { ERC3643ManagementFacetBase } from "../ERC3643ManagementFacetBase.sol";
/* solhint-disable max-line-length */
import {
    CommonKpiLinkedInterestRate
} from "../../../../domain/asset/extension/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";
/* solhint-enable max-line-length */

contract ERC3643ManagementKpiLinkedRateFacet is ERC3643ManagementFacetBase, CommonKpiLinkedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_MANAGEMENT_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
