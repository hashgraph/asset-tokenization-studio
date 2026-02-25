// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAReadFacet } from "../../../facets/regulation/bondUSA/variableRate/BondUSAReadFacet.sol";
import { TimeTravelProvider } from "../TimeTravelProvider.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";

contract BondUSAReadFacetTimeTravel is BondUSAReadFacet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
