// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SsiManagementFacet } from "../../../facets/features/ssi/SsiManagementFacet.sol";
import { TimeTravelProvider } from "../TimeTravelProvider.sol";

contract SsiManagementFacetTimeTravel is SsiManagementFacet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
