// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    HoldTokenHolderFixedRateFacet
} from "../../../../facets/features/hold/fixedRate/HoldTokenHolderFixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract HoldTokenHolderFixedRateFacetTimeTravel is HoldTokenHolderFixedRateFacet, TimeTravelStorageWrapper {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
