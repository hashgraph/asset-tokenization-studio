// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    HoldReadKpiLinkedRateFacet
} from "../../../../facets/features/hold/kpiLinkedRate/HoldReadKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract HoldReadKpiLinkedRateFacetTimeTravel is HoldReadKpiLinkedRateFacet, TimeTravelStorageWrapper {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
