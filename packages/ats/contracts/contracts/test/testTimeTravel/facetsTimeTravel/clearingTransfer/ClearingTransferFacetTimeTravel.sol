// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingTransferFacet } from "../../../../facets/layer_1/clearing/ClearingTransferFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ClearingTransferFacetTimeTravel is ClearingTransferFacet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override(TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override(TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
