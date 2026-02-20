// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";
import { HoldManagementFacet } from "../../../../facets/features/hold/HoldManagementFacet.sol";

contract HoldManagementFacetTimeTravel is HoldManagementFacet, TimeTravelStorageWrapper {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
