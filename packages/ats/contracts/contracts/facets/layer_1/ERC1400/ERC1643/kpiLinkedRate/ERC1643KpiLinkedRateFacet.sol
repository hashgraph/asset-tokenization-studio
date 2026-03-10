// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1643FacetBase } from "../ERC1643FacetBase.sol";
import { _ERC1643_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../../constants/resolverKeys.sol";
/* solhint-disable max-line-length */
import {
    CommonKpiLinkedInterestRate
} from "../../../../../domain/asset/extension/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";
/* solhint-enable max-line-length */

contract ERC1643KpiLinkedRateFacet is ERC1643FacetBase, CommonKpiLinkedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1643_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
