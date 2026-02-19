// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ERC3643ManagementKpiLinkedRateFacet
} from "../../../../facets/features/ERC3643/kpiLinkedRate/ERC3643ManagementKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC3643ManagementKpiLinkedRateFacetTimeTravel is
    ERC3643ManagementKpiLinkedRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
