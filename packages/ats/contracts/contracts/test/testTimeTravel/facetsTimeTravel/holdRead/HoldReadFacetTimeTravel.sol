// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldReadFacet } from "../../../../facets/layer_1/hold/HoldReadFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";

contract HoldReadFacetTimeTravel is HoldReadFacet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
