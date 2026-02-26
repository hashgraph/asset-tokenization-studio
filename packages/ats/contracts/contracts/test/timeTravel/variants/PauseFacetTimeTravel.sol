// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseFacet } from "../../../facets/features/pause/PauseFacet.sol";
import { TimeTravelProvider } from "../TimeTravelProvider.sol";

contract PauseFacetTimeTravel is PauseFacet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
