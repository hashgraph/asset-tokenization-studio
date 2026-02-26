// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC3643ReadFacet } from "../../../facets/features/ERC3643/ERC3643ReadFacet.sol";
import { TimeTravelProvider } from "../TimeTravelProvider.sol";

contract ERC3643ReadFacetTimeTravel is ERC3643ReadFacet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
