// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { FixedRateFacet } from "../../../facets/assetCapabilities/interestRates/fixedRate/FixedRateFacet.sol";
import { TimeTravelProvider } from "../TimeTravelProvider.sol";

contract FixedRateFacetTimeTravel is FixedRateFacet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
