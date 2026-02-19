// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ClearingHoldCreationKpiLinkedRateFacet
} from "../../../../facets/features/clearing/kpiLinkedRate/ClearingHoldCreationKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ClearingHoldCreationKpiLinkedRateFacetTimeTravel is
    ClearingHoldCreationKpiLinkedRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
