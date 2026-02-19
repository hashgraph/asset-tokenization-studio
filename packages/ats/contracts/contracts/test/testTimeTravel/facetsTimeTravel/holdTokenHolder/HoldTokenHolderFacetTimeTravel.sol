// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";
import { HoldTokenHolderFacet } from "../../../../facets/features/hold/standard/HoldTokenHolderFacet.sol";

contract HoldTokenHolderFacetTimeTravel is HoldTokenHolderFacet, TimeTravelStorageWrapper {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
